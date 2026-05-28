import { InvariantError, NotFoundError } from "../../../exceptions/index.js";
import response from "../../../utils/response.js";
import categoryRepository from "../repositories/category-repository.js";
import CacheService from "../../../cache/redis-service.js";

const cacheService = new CacheService();

export const create = async (req, res, next) => {
  const { name } = req.body;

  const category = await categoryRepository.create({ name });
  if (!category) {
    return next(new InvariantError("Kategori gagal ditambahkan"));
  }

  // Invalidate cache
  await cacheService.delete("categories");

  return response(res, 201, "Kategori berhasil ditambahkan", { id: category.id });
};

export const findAll = async (req, res, next) => {
  try {
    const cachedCategories = await cacheService.get("categories");
    return response(res, 200, "Kategori berhasil ditampilkan", {
      categories: JSON.parse(cachedCategories),
    });
  } catch (error) {
    const categories = await categoryRepository.findAll();
    await cacheService.set("categories", JSON.stringify(categories));
    return response(res, 200, "Kategori berhasil ditampilkan", { categories });
  }
};

export const findById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const cachedCategory = await cacheService.get(`categories:${id}`);
    const category = JSON.parse(cachedCategory);
    return response(res, 200, "Kategori berhasil ditampilkan", {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  } catch (error) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      return next(new NotFoundError("Kategori tidak ditemukan"));
    }

    await cacheService.set(`categories:${id}`, JSON.stringify(category));

    return response(res, 200, "Kategori berhasil ditampilkan", {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  }
};

export const update = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const existing = await categoryRepository.findById(id);
  if (!existing) {
    return next(new NotFoundError("Kategori tidak ditemukan"));
  }

  const category = await categoryRepository.update({ id, name });
  if (!category) {
    return next(new NotFoundError("Kategori gagal diperbarui"));
  }

  // Invalidate cache
  await cacheService.delete("categories");
  await cacheService.delete(`categories:${id}`);
  await cacheService.delete("glosarium");

  return response(res, 200, "Kategori berhasil diperbarui", { id: category.id });
};

export const destroy = async (req, res, next) => {
  const { id } = req.params;
  const categoryId = await categoryRepository.delete(id);
  if (!categoryId) {
    return next(new NotFoundError("Kategori tidak ditemukan"));
  }

  // Invalidate cache
  await cacheService.delete("categories");
  await cacheService.delete(`categories:${id}`);
  await cacheService.delete("glosarium");

  return response(res, 200, "Kategori berhasil dihapus", { id: categoryId });
};
