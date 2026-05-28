import fs from "fs";
import path from "path";
import multer from "multer";
import { InvariantError } from "../../../exceptions/index.js";

export const UPLOAD_FOLDER = path.resolve(process.cwd(), "public/uploads/");
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "thumbnail" && !file.mimetype.startsWith("image/")) {
      return cb(new InvariantError("Thumbnail harus berupa file gambar."), false);
    }
    
    if (file.fieldname === "video" && !file.mimetype.startsWith("video/")) {
      return cb(new InvariantError("Video harus berupa file video."), false);
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/mkv",
      "video/quicktime",
      "application/pdf"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new InvariantError("Format file tidak didukung. Hanya JPG, PNG, WEBP, dan MP4 yang diizinkan."), false);
    }
  },
});

export default { UPLOAD_FOLDER, storage, upload };
