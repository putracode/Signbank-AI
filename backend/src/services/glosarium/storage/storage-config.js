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
    cb(null, true);
  },
});

export default { UPLOAD_FOLDER, storage, upload };
