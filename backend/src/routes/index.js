import { Router } from "express";
import fs from "fs";
import path from "path";
import glosariumRouter from "../services/glosarium/routes/index.js";
import authenticationsRouter from "../services/authentications/routes/index.js";
import categoriesRouter from "../services/categories/routes/index.js";

const router = Router();

router.get("/test-write", (req, res) => {
  const uploadFolder = path.resolve(process.cwd(), "public/uploads/");
  const testFile = path.join(uploadFolder, "test.txt");
  try {
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }
    fs.writeFileSync(testFile, "test content");
    fs.unlinkSync(testFile);
    return res.json({ status: "success", message: "Folder uploads is writable!", path: uploadFolder });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message, stack: error.stack });
  }
});

router.use("/glosarium", glosariumRouter);
router.use("/authentications", authenticationsRouter);
router.use("/categories", categoriesRouter);

export default router;
