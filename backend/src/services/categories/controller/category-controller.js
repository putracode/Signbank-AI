import { InvariantError, NotFoundError } from "../../../exceptions/index.js";
import response from "../../../utils/response.js";
import categoryRepository from "../repositories/category-repository.js";

export const create = async (req, res, next) => {
  const { name } = req.body;

  const category = await categoryRepository.create({ name });
  if (!category) {
    return next(new InvariantError("Kategori gagal ditambahkan"));
  }

  return response(res, 201, "Kategori berhasil ditambahkan", { id: category.id });
};

export const findAll = async (req, res, next) => {
  const categories = await categoryRepository.findAll();
  return response(res, 200, "Kategori berhasil ditampilkan", { categories });
};

export const findById = async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryRepository.findById(id);

  if (!category) {
    return next(new NotFoundError("Kategori tidak ditemukan"));
  }

  return response(res, 200, "Kategori berhasil ditampilkan", {
    id: category.id,
    name: category.name,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  });
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

  return response(res, 200, "Kategori berhasil diperbarui", { id: category.id });
};

export const destroy = async (req, res, next) => {
  const { id } = req.params;
  const categoryId = await categoryRepository.delete(id);
  if (!categoryId) {
    return next(new NotFoundError("Kategori tidak ditemukan"));
  }

  return response(res, 200, "Kategori berhasil dihapus", { id: categoryId });
};
