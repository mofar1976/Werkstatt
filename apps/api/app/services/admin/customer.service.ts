import type mongoose from "mongoose";
import {
  AuthAudience,
  type AdminCustomer,
  type Paginated,
} from "@car-garage/shared";
import { HttpError } from "../../helpers/http-error.js";
import { Appointment } from "../../models/appointment.model.js";
import { RefreshToken } from "../../models/refresh-token.model.js";
import { User, type UserDocument } from "../../models/user.model.js";
import type {
  ListCustomersQuery,
  UpdateCustomerInput,
} from "../../dto/customer.dto.js";

const CUSTOMERS = { deleted: false, audience: AuthAudience.CUSTOMER } as const;

function toAdminCustomer(
  doc: UserDocument,
  appointmentCount: number,
): AdminCustomer {
  return {
    id: doc.id,
    email: doc.email,
    firstName: doc.firstName,
    lastName: doc.lastName,
    phone: doc.phone ?? undefined,
    isActive: doc.isActive,
    appointmentCount,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function nameOrEmailSearch(search?: string): Record<string, unknown> {
  if (!search) return {};
  const rx = new RegExp(
    search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i",
  );
  return {
    $or: [{ email: rx }, { firstName: rx }, { lastName: rx }],
  };
}

async function appointmentCounts(
  customerIds: mongoose.Types.ObjectId[],
): Promise<Map<string, number>> {
  if (customerIds.length === 0) return new Map();
  const rows = await Appointment.aggregate<{ _id: unknown; count: number }>([
    { $match: { customer: { $in: customerIds }, deleted: false } },
    { $group: { _id: "$customer", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.count]));
}

async function getCustomerOrThrow(id: string): Promise<UserDocument> {
  const customer = await User.findOne({ _id: id, ...CUSTOMERS }).catch(
    () => null,
  );
  if (!customer) {
    throw HttpError.notFound("Customer not found");
  }
  return customer;
}

export const customerService = {
  async list(query: ListCustomersQuery): Promise<Paginated<AdminCustomer>> {
    const filter: Record<string, unknown> = {
      ...CUSTOMERS,
      ...nameOrEmailSearch(query.search),
    };
    if (query.status === "active") filter.isActive = true;
    if (query.status === "blocked") filter.isActive = false;

    const total = await User.countDocuments(filter);
    const docs = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.pageSize)
      .limit(query.pageSize);

    const counts = await appointmentCounts(docs.map((d) => d._id));

    return {
      items: docs.map((d) => toAdminCustomer(d, counts.get(d.id) ?? 0)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async getById(id: string): Promise<AdminCustomer> {
    const customer = await getCustomerOrThrow(id);
    const count = await Appointment.countDocuments({
      customer: customer._id,
      deleted: false,
    });
    return toAdminCustomer(customer, count);
  },

  async update(
    id: string,
    input: UpdateCustomerInput,
  ): Promise<AdminCustomer> {
    const customer = await getCustomerOrThrow(id);
    if (input.firstName !== undefined) customer.firstName = input.firstName;
    if (input.lastName !== undefined) customer.lastName = input.lastName;
    if (input.phone !== undefined) {
      customer.phone = input.phone === "" ? undefined : input.phone;
    }
    await customer.save();
    const count = await Appointment.countDocuments({
      customer: customer._id,
      deleted: false,
    });
    return toAdminCustomer(customer, count);
  },

  /** Block or unblock an account. Blocking also cuts active sessions. */
  async setActive(id: string, isActive: boolean): Promise<AdminCustomer> {
    const customer = await getCustomerOrThrow(id);
    customer.isActive = isActive;
    await customer.save();
    if (!isActive) {
      await RefreshToken.deleteMany({ user: customer._id });
    }
    const count = await Appointment.countDocuments({
      customer: customer._id,
      deleted: false,
    });
    return toAdminCustomer(customer, count);
  },

  async remove(id: string): Promise<void> {
    const customer = await getCustomerOrThrow(id);
    customer.deleted = true;
    customer.isActive = false;
    await customer.save();
    await RefreshToken.deleteMany({ user: customer._id });
  },
};
