import fs from "fs";
import { InvariantError, NotFoundError } from "../../../exceptions/index.js";
import response from "../../../utils/response.js";
import glosariumRepository from "../repositories/glosarium-repository.js";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedVideoTypes = ["video/mp4", "video/mkv", "video/quicktime"];

const validateAndCleanFiles = (files) => {
  try {
    if (files?.thumbnail) {
      const thumbnail = files.thumbnail[0];
      if (!allowedImageTypes.includes(thumbnail.mimetype)) {
        throw new InvariantError("Thumbnail harus berupa gambar (JPG, PNG, WEBP).");
      }
    }

    if (files?.video) {
      const video = files.video[0];
      if (!allowedVideoTypes.includes(video.mimetype)) {
        throw new InvariantError("Video harus berupa file video (MP4, MKV, QuickTime).");
      }
    }
  } catch (error) {
    if (files?.thumbnail) {
      fs.unlink(files.thumbnail[0].path, () => {});
    }
    if (files?.video) {
      fs.unlink(files.video[0].path, () => {});
    }
    throw error;
  }
};

export const create = async (req, res, next) => {
  try {
    validateAndCleanFiles(req.files);

    const { termName, description, categoryId } = req.body;
    const thumbnailUrl = req.files?.thumbnail ? `/uploads/${req.files.thumbnail[0].filename}` : null;
    const videoUrl = req.files?.video ? `/uploads/${req.files.video[0].filename}` : null;

    const glosarium = await glosariumRepository.create({ termName, description, categoryId, thumbnailUrl, videoUrl });
    if (!glosarium) {
      return next(new InvariantError("Glosarium gagal ditambahkan"));
    }

    return response(res, 201, "Glosarium berhasil ditambahkan", { id: glosarium.id });
  } catch (error) {
    return next(error);
  }
};

export const findAll = async (req, res, next) => {
  const glosariums = await glosariumRepository.findAll();
  return response(res, 200, "Glosarium berhasil ditampilkan", { glosariums });
};

export const findById = async (req, res, next) => {
  const { id } = req.params;

  const glosarium = await glosariumRepository.findById(id);

  if (!glosarium) {
    return next(new NotFoundError("Glosarium tidak ditemukan"));
  }

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
};

export const update = async (req, res, next) => {
  try {
    validateAndCleanFiles(req.files);

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

    return response(res, 200, "Glosarium berhasil diperbarui", { id: glosarium.id });
  } catch (error) {
    return next(error);
  }
};

export const destroy = async (req, res, next) => {
  const { id } = req.params;
  const glosariumId = await glosariumRepository.delete(id);
  if (!glosariumId) {
    return next(new NotFoundError("Glosarium tidak ditemukan"));
  }

  return response(res, 200, "Glosarium berhasil dihapus", { id: glosariumId });
};
