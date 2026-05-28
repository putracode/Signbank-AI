import { InvariantError, NotFoundError } from "../../../exceptions/index.js";
import response from "../../../utils/response.js";
import glosariumRepository from "../repositories/glosarium-repository.js";
import CacheService from "../../../cache/redis-service.js";

const cacheService = new CacheService();

export const create = async (req, res, next) => {
  const { termName, description, categoryId } = req.body;
  const thumbnailUrl = req.files?.thumbnail ? `/uploads/${req.files.thumbnail[0].filename}` : null;
  const videoUrl = req.files?.video ? `/uploads/${req.files.video[0].filename}` : null;

  const glosarium = await glosariumRepository.create({ termName, description, categoryId, thumbnailUrl, videoUrl });
  if (!glosarium) {
    return next(new InvariantError("Glosarium gagal ditambahkan"));
  }

  // Invalidate cache
  await cacheService.delete("glosarium");

  return response(res, 201, "Glosarium berhasil ditambahkan", { id: glosarium.id });
};

export const findAll = async (req, res, next) => {
  try {
    const cachedGlosariums = await cacheService.get("glosarium");
    return response(res, 200, "Glosarium berhasil ditampilkan", {
      glosariums: JSON.parse(cachedGlosariums),
    });
  } catch (error) {
    const glosariums = await glosariumRepository.findAll();
    await cacheService.set("glosarium", JSON.stringify(glosariums));
    return response(res, 200, "Glosarium berhasil ditampilkan", { glosariums });
  }
};

export const findById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const cachedGlosarium = await cacheService.get(`glosarium:${id}`);
    const glosarium = JSON.parse(cachedGlosarium);
    return response(res, 200, "Glosarium berhasil ditampilkan", {
      id: glosarium.id,
      termName: glosarium.termName,
      description: glosarium.description,
      categoryId: glosarium.categoryId,
      categoryName: glosarium.categoryName,
      thumbnailUrl: glosarium.thumbnailUrl,
      videoUrl: glosarium.videoUrl,
      createdAt: glosarium.createdAt,
      updatedAt: glosarium.updatedAt,
    });
  } catch (error) {
    const glosarium = await glosariumRepository.findById(id);

    if (!glosarium) {
      return next(new NotFoundError("Glosarium tidak ditemukan"));
    }

    await cacheService.set(`glosarium:${id}`, JSON.stringify(glosarium));

    return response(res, 200, "Glosarium berhasil ditampilkan", {
      id: glosarium.id,
      termName: glosarium.termName,
      description: glosarium.description,
      categoryId: glosarium.categoryId,
      categoryName: glosarium.categoryName,
      thumbnailUrl: glosarium.thumbnailUrl,
      videoUrl: glosarium.videoUrl,
      createdAt: glosarium.createdAt,
      updatedAt: glosarium.updatedAt,
    });
  }
};

export const update = async (req, res, next) => {
  const { id } = req.params;
  const { termName, description, categoryId } = req.body;
  
  const existing = await glosariumRepository.findById(id);
  if (!existing) {
    return next(new NotFoundError("Glosarium tidak ditemukan"));
  }

  const thumbnailUrl = req.files?.thumbnail ? `/uploads/${req.files.thumbnail[0].filename}` : existing.thumbnailUrl;
  const videoUrl = req.files?.video ? `/uploads/${req.files.video[0].filename}` : existing.videoUrl;

  const glosarium = await glosariumRepository.update({ id, termName, description, categoryId, thumbnailUrl, videoUrl });
  if (!glosarium) {
    return next(new NotFoundError("Glosarium gagal diperbarui"));
  }

  // Invalidate cache
  await cacheService.delete("glosarium");
  await cacheService.delete(`glosarium:${id}`);

  return response(res, 200, "Glosarium berhasil diperbarui", { id: glosarium.id });
};

export const destroy = async (req, res, next) => {
  const { id } = req.params;
  const glosariumId = await glosariumRepository.delete(id);
  if (!glosariumId) {
    return next(new NotFoundError("Glosarium tidak ditemukan"));
  }

  // Invalidate cache
  await cacheService.delete("glosarium");
  await cacheService.delete(`glosarium:${id}`);

  return response(res, 200, "Glosarium berhasil dihapus", { id: glosariumId });
};
