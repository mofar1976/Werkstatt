import type mongoose from "mongoose";
import {
  AuthAudience,
  UserRole,
  WorkshopRole,
  WorkshopStatus,
  type Paginated,
  type PublicWorkshop,
  type Workshop as WorkshopDTO,
  type WorkshopMember as WorkshopMemberDTO,
} from "@car-garage/shared";
import { HttpError } from "../helpers/http-error.js";
import { uniqueSlug } from "../helpers/slug.js";
import { RefreshToken } from "../models/refresh-token.model.js";
import { User } from "../models/user.model.js";
import { Workshop, type WorkshopDocument } from "../models/workshop.model.js";
import { WorkshopMember } from "../models/workshop-member.model.js";
import { createUser } from "./user.service.js";
import type {
  AddMemberInput,
  CreateWorkshopInput,
  ListWorkshopsQuery,
  UpdateMemberInput,
  UpdateWorkshopInput,
} from "../dto/workshop.dto.js";

const LIVE = { deleted: false } as const;

function toWorkshop(doc: WorkshopDocument, memberCount: number): WorkshopDTO {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description ?? undefined,
    email: doc.email ?? undefined,
    phone: doc.phone ?? undefined,
    address: {
      street: doc.address.street,
      city: doc.address.city,
      postalCode: doc.address.postalCode,
      country: doc.address.country,
    },
    location:
      doc.location && doc.location.coordinates.length === 2
        ? {
            lat: doc.location.coordinates[1] as number,
            lng: doc.location.coordinates[0] as number,
          }
        : undefined,
    status: doc.status,
    memberCount,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function toPublicWorkshop(doc: WorkshopDocument): PublicWorkshop {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description ?? undefined,
    address: {
      street: doc.address.street,
      city: doc.address.city,
      postalCode: doc.address.postalCode,
      country: doc.address.country,
    },
    location:
      doc.location && doc.location.coordinates.length === 2
        ? {
            lat: doc.location.coordinates[1] as number,
            lng: doc.location.coordinates[0] as number,
          }
        : undefined,
    phone: doc.phone ?? undefined,
    email: doc.email ?? undefined,
  };
}

function nameOrCitySearch(search?: string): Record<string, unknown> {
  if (!search) return {};
  const rx = new RegExp(
    search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i",
  );
  return { $or: [{ name: rx }, { "address.city": rx }, { slug: rx }] };
}

interface PopulatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

function toMember(m: {
  id: string;
  workshop: unknown;
  role: WorkshopRole;
  createdAt: Date;
  user: PopulatedUser;
}): WorkshopMemberDTO {
  return {
    id: m.id,
    workshopId: String(m.workshop),
    role: m.role,
    user: {
      id: m.user.id,
      email: m.user.email,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      phone: m.user.phone ?? undefined,
    },
    createdAt: m.createdAt.toISOString(),
  };
}

function rolesForWorkshopRole(role: WorkshopRole): UserRole[] {
  return role === WorkshopRole.CHEF
    ? [UserRole.WORKSHOP_ADMIN, UserRole.WORKSHOP_MEMBER]
    : [UserRole.WORKSHOP_MEMBER];
}

/** Soft-delete a workshop user and cut their active sessions. */
async function retireUser(userId: mongoose.Types.ObjectId): Promise<void> {
  await User.updateOne(
    { _id: userId, ...LIVE },
    { $set: { deleted: true, isActive: false } },
  );
  await RefreshToken.deleteMany({ user: userId });
}

async function liveMemberCounts(
  workshopIds: mongoose.Types.ObjectId[],
): Promise<Map<string, number>> {
  if (workshopIds.length === 0) return new Map();
  const rows = await WorkshopMember.aggregate<{ _id: unknown; count: number }>([
    { $match: { workshop: { $in: workshopIds }, deleted: false } },
    { $group: { _id: "$workshop", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.count]));
}

function countMembers(workshopId: mongoose.Types.ObjectId): Promise<number> {
  return WorkshopMember.countDocuments({ workshop: workshopId, ...LIVE });
}

async function getWorkshopOrThrow(id: string): Promise<WorkshopDocument> {
  const workshop = await Workshop.findOne({ _id: id, ...LIVE }).catch(() => null);
  if (!workshop) {
    throw HttpError.notFound("Workshop not found");
  }
  return workshop;
}

export const workshopService = {
  async list(query: ListWorkshopsQuery): Promise<Paginated<WorkshopDTO>> {
    const filter: Record<string, unknown> = { ...LIVE, ...nameOrCitySearch(query.search) };
    if (query.status) filter.status = query.status;

    const total = await Workshop.countDocuments(filter);
    const docs = await Workshop.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.pageSize)
      .limit(query.pageSize);

    const counts = await liveMemberCounts(docs.map((d) => d._id));

    return {
      items: docs.map((d) => toWorkshop(d, counts.get(d.id) ?? 0)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async getById(id: string): Promise<WorkshopDTO> {
    const workshop = await getWorkshopOrThrow(id);
    return toWorkshop(workshop, await countMembers(workshop._id));
  },

  /** Customer-facing: only ACTIVE workshops, public projection. */
  async listPublic(query: {
    search?: string;
    near?: string;
    radiusKm?: number;
    page: number;
    pageSize: number;
  }): Promise<Paginated<PublicWorkshop>> {
    const filter: Record<string, unknown> = {
      ...LIVE,
      status: WorkshopStatus.ACTIVE,
      ...nameOrCitySearch(query.search),
    };

    if (query.near) {
      const [lat, lng] = query.near.split(",").map(Number);
      const radiusKm = query.radiusKm ?? 25;
      // `$geoWithin` (unlike `$near`) is countDocuments-compatible.
      filter.location = {
        $geoWithin: { $centerSphere: [[lng, lat], radiusKm / 6378.1] },
      };
    }

    const total = await Workshop.countDocuments(filter);
    const docs = await Workshop.find(filter)
      .sort({ name: 1 })
      .skip((query.page - 1) * query.pageSize)
      .limit(query.pageSize);
    return {
      items: docs.map(toPublicWorkshop),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async getPublic(id: string): Promise<PublicWorkshop> {
    const workshop = await Workshop.findOne({
      _id: id,
      status: WorkshopStatus.ACTIVE,
      ...LIVE,
    }).catch(() => null);
    if (!workshop) {
      throw HttpError.notFound("Workshop not found");
    }
    return toPublicWorkshop(workshop);
  },

  async create(input: CreateWorkshopInput): Promise<WorkshopDTO> {
    const slug = await uniqueSlug(input.name, async (candidate) =>
      Boolean(await Workshop.exists({ slug: candidate, ...LIVE })),
    );

    const workshop = await Workshop.create({
      name: input.name,
      slug,
      description: input.description,
      email: input.email,
      phone: input.phone,
      address: input.address,
      location: input.location
        ? { type: "Point", coordinates: [input.location.lng, input.location.lat] }
        : undefined,
    });

    return toWorkshop(workshop, 0);
  },

  async update(id: string, input: UpdateWorkshopInput): Promise<WorkshopDTO> {
    const workshop = await getWorkshopOrThrow(id);

    if (input.name !== undefined) workshop.name = input.name;
    if (input.description !== undefined) workshop.description = input.description;
    if (input.email !== undefined) workshop.email = input.email;
    if (input.phone !== undefined) workshop.phone = input.phone;
    if (input.address !== undefined) {
      workshop.address = { ...workshop.address, ...input.address };
    }
    if (input.location !== undefined) {
      workshop.location = {
        type: "Point",
        coordinates: [input.location.lng, input.location.lat],
      };
    }

    await workshop.save();
    return toWorkshop(workshop, await countMembers(workshop._id));
  },

  async setStatus(id: string, status: WorkshopStatus): Promise<WorkshopDTO> {
    const workshop = await getWorkshopOrThrow(id);
    workshop.status = status;
    await workshop.save();
    return toWorkshop(workshop, await countMembers(workshop._id));
  },

  async remove(id: string): Promise<void> {
    const workshop = await getWorkshopOrThrow(id);
    // TODO: once appointments / repair orders exist, block deletion when the
    // workshop has history and require deactivation instead.
    const members = await WorkshopMember.find({ workshop: workshop._id, ...LIVE });
    await WorkshopMember.updateMany(
      { workshop: workshop._id, ...LIVE },
      { $set: { deleted: true } },
    );
    await Promise.all(members.map((m) => retireUser(m.user)));
    workshop.deleted = true;
    await workshop.save();
  },

  async listMembers(workshopId: string): Promise<WorkshopMemberDTO[]> {
    await getWorkshopOrThrow(workshopId);
    const members = await WorkshopMember.find({ workshop: workshopId, ...LIVE })
      .sort({ createdAt: 1 })
      .populate<{ user: PopulatedUser }>(
        "user",
        "email firstName lastName phone",
      );
    return members.map(toMember);
  },

  async addMember(
    workshopId: string,
    input: AddMemberInput,
  ): Promise<WorkshopMemberDTO> {
    const workshop = await getWorkshopOrThrow(workshopId);

    const user = await createUser({
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      audience: AuthAudience.WORKSHOP,
      roles: rolesForWorkshopRole(input.role),
    });

    const member = await WorkshopMember.create({
      workshop: workshop._id,
      user: user._id,
      role: input.role,
    });

    await member.populate("user", "email firstName lastName phone");
    return toMember(member as unknown as Parameters<typeof toMember>[0]);
  },

  async updateMember(
    workshopId: string,
    memberId: string,
    input: UpdateMemberInput,
  ): Promise<WorkshopMemberDTO> {
    await getWorkshopOrThrow(workshopId);
    const member = await WorkshopMember.findOne({
      _id: memberId,
      workshop: workshopId,
      ...LIVE,
    }).catch(() => null);
    if (!member) {
      throw HttpError.notFound("Member not found");
    }

    if (input.role !== undefined) {
      member.role = input.role;
      await member.save();
    }

    const user = await User.findOne({ _id: member.user, ...LIVE });
    if (user) {
      if (input.firstName !== undefined) user.firstName = input.firstName;
      if (input.lastName !== undefined) user.lastName = input.lastName;
      if (input.phone !== undefined) {
        user.phone = input.phone === "" ? undefined : input.phone;
      }
      if (input.role !== undefined) {
        user.roles = rolesForWorkshopRole(input.role);
      }
      await user.save();
    }

    await member.populate("user", "email firstName lastName phone");
    return toMember(member as unknown as Parameters<typeof toMember>[0]);
  },

  async removeMember(workshopId: string, memberId: string): Promise<void> {
    await getWorkshopOrThrow(workshopId);
    const member = await WorkshopMember.findOne({
      _id: memberId,
      workshop: workshopId,
      ...LIVE,
    }).catch(() => null);
    if (!member) {
      throw HttpError.notFound("Member not found");
    }
    // Soft-delete the assignment and retire the account it was created for.
    member.deleted = true;
    await member.save();
    await retireUser(member.user);
  },
};
