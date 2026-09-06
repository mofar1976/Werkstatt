import type mongoose from "mongoose";
import type {
  CarBrand as CarBrandDTO,
  CarModel as CarModelDTO,
  Paginated,
} from "@car-garage/shared";
import { randomBytes } from "node:crypto";
import { HttpError } from "../helpers/http-error.js";
import { slugify } from "../helpers/slug.js";
import { putObject, removeObject, publicUrl } from "../helpers/storage.js";
import { IMAGE_EXTENSION } from "../helpers/upload.js";
import { CarBrand, type CarBrandDocument } from "../models/car-brand.model.js";
import { CarModel, type CarModelDocument } from "../models/car-model.model.js";
import type {
  CreateBrandInput,
  CreateModelInput,
  ListQuery,
  UpdateBrandInput,
  UpdateModelInput,
} from "../dto/car-catalog.dto.js";

const LIVE = { deleted: false } as const;

function toBrand(doc: CarBrandDocument, modelCount: number): CarBrandDTO {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    logoUrl: doc.logoKey ? publicUrl(doc.logoKey) : undefined,
    modelCount,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function toModel(doc: CarModelDocument): CarModelDTO {
  return {
    id: doc.id,
    brandId: String(doc.brand),
    name: doc.name,
    slug: doc.slug,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function searchFilter(search?: string): Record<string, unknown> {
  if (!search) return {};
  const rx = new RegExp(
    search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i",
  );
  return { $or: [{ name: rx }, { slug: rx }] };
}

async function modelCounts(
  brandIds: mongoose.Types.ObjectId[],
): Promise<Map<string, number>> {
  if (brandIds.length === 0) return new Map();
  const rows = await CarModel.aggregate<{ _id: unknown; count: number }>([
    { $match: { brand: { $in: brandIds }, deleted: false } },
    { $group: { _id: "$brand", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.count]));
}

async function getBrandOrThrow(id: string): Promise<CarBrandDocument> {
  const brand = await CarBrand.findOne({ _id: id, ...LIVE }).catch(() => null);
  if (!brand) {
    throw HttpError.notFound("Car brand not found");
  }
  return brand;
}

async function getModelOrThrow(
  brandId: string,
  modelId: string,
): Promise<CarModelDocument> {
  const model = await CarModel.findOne({
    _id: modelId,
    brand: brandId,
    ...LIVE,
  }).catch(() => null);
  if (!model) {
    throw HttpError.notFound("Car model not found");
  }
  return model;
}

export const carCatalogService = {
  async listBrands(query: ListQuery): Promise<Paginated<CarBrandDTO>> {
    const filter = { ...LIVE, ...searchFilter(query.search) };
    const total = await CarBrand.countDocuments(filter);
    const docs = await CarBrand.find(filter)
      .sort({ name: 1 })
      .skip((query.page - 1) * query.pageSize)
      .limit(query.pageSize);
    const counts = await modelCounts(docs.map((d) => d._id));
    return {
      items: docs.map((d) => toBrand(d, counts.get(d.id) ?? 0)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async getBrand(id: string): Promise<CarBrandDTO> {
    const brand = await getBrandOrThrow(id);
    const count = await CarModel.countDocuments({ brand: brand._id, ...LIVE });
    return toBrand(brand, count);
  },

  async createBrand(input: CreateBrandInput): Promise<CarBrandDTO> {
    const slug = slugify(input.name);
    if (!slug) throw HttpError.badRequest("Brand name must contain letters or digits");
    if (await CarBrand.exists({ slug, ...LIVE })) {
      throw HttpError.conflict("A brand with this name already exists");
    }
    const brand = await CarBrand.create({ name: input.name, slug });
    return toBrand(brand, 0);
  },

  async updateBrand(id: string, input: UpdateBrandInput): Promise<CarBrandDTO> {
    const brand = await getBrandOrThrow(id);
    if (input.name !== undefined && input.name !== brand.name) {
      const slug = slugify(input.name);
      if (!slug) throw HttpError.badRequest("Brand name must contain letters or digits");
      if (await CarBrand.exists({ slug, _id: { $ne: brand._id }, ...LIVE })) {
        throw HttpError.conflict("A brand with this name already exists");
      }
      brand.name = input.name;
      brand.slug = slug;
    }
    await brand.save();
    const count = await CarModel.countDocuments({ brand: brand._id, ...LIVE });
    return toBrand(brand, count);
  },

  async removeBrand(id: string): Promise<void> {
    const brand = await getBrandOrThrow(id);
    await CarModel.updateMany(
      { brand: brand._id, ...LIVE },
      { $set: { deleted: true } },
    );
    brand.deleted = true;
    await brand.save();
  },

  async setBrandLogo(
    id: string,
    file: { buffer: Buffer; mimetype: string },
  ): Promise<CarBrandDTO> {
    const brand = await getBrandOrThrow(id);
    const ext = IMAGE_EXTENSION[file.mimetype] ?? "bin";
    const key = `brands/${brand.id}/logo-${randomBytes(6).toString("hex")}.${ext}`;

    await putObject({ key, body: file.buffer, contentType: file.mimetype });

    const previousKey = brand.logoKey;
    brand.logoKey = key;
    await brand.save();
    if (previousKey && previousKey !== key) {
      await removeObject(previousKey).catch(() => undefined);
    }

    const count = await CarModel.countDocuments({ brand: brand._id, ...LIVE });
    return toBrand(brand, count);
  },

  async removeBrandLogo(id: string): Promise<CarBrandDTO> {
    const brand = await getBrandOrThrow(id);
    const previousKey = brand.logoKey;
    brand.logoKey = undefined;
    await brand.save();
    if (previousKey) {
      await removeObject(previousKey).catch(() => undefined);
    }
    const count = await CarModel.countDocuments({ brand: brand._id, ...LIVE });
    return toBrand(brand, count);
  },

  async listModels(
    brandId: string,
    query: ListQuery,
  ): Promise<Paginated<CarModelDTO>> {
    await getBrandOrThrow(brandId);
    const filter = { brand: brandId, ...LIVE, ...searchFilter(query.search) };
    const total = await CarModel.countDocuments(filter);
    const docs = await CarModel.find(filter)
      .sort({ name: 1 })
      .skip((query.page - 1) * query.pageSize)
      .limit(query.pageSize);
    return {
      items: docs.map(toModel),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async getModel(brandId: string, modelId: string): Promise<CarModelDTO> {
    return toModel(await getModelOrThrow(brandId, modelId));
  },

  /** Full brand list for customer-facing pickers (no pagination). */
  async publicBrands(): Promise<CarBrandDTO[]> {
    const docs = await CarBrand.find(LIVE).sort({ name: 1 });
    const counts = await modelCounts(docs.map((d) => d._id));
    return docs.map((d) => toBrand(d, counts.get(d.id) ?? 0));
  },

  /** All models of one brand for customer-facing pickers (no pagination). */
  async publicModels(brandId: string): Promise<CarModelDTO[]> {
    await getBrandOrThrow(brandId);
    const docs = await CarModel.find({ brand: brandId, ...LIVE }).sort({
      name: 1,
    });
    return docs.map(toModel);
  },

  async createModel(
    brandId: string,
    input: CreateModelInput,
  ): Promise<CarModelDTO> {
    const brand = await getBrandOrThrow(brandId);
    const slug = slugify(input.name);
    if (!slug) throw HttpError.badRequest("Model name must contain letters or digits");
    if (await CarModel.exists({ brand: brand._id, slug, ...LIVE })) {
      throw HttpError.conflict("This brand already has a model with that name");
    }
    const model = await CarModel.create({
      brand: brand._id,
      name: input.name,
      slug,
    });
    return toModel(model);
  },

  async updateModel(
    brandId: string,
    modelId: string,
    input: UpdateModelInput,
  ): Promise<CarModelDTO> {
    const model = await getModelOrThrow(brandId, modelId);
    if (input.name !== undefined && input.name !== model.name) {
      const slug = slugify(input.name);
      if (!slug) throw HttpError.badRequest("Model name must contain letters or digits");
      if (
        await CarModel.exists({
          brand: model.brand,
          slug,
          _id: { $ne: model._id },
          ...LIVE,
        })
      ) {
        throw HttpError.conflict("This brand already has a model with that name");
      }
      model.name = input.name;
      model.slug = slug;
    }
    await model.save();
    return toModel(model);
  },

  async removeModel(brandId: string, modelId: string): Promise<void> {
    const model = await getModelOrThrow(brandId, modelId);
    model.deleted = true;
    await model.save();
  },
};
