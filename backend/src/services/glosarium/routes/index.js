import { Router } from "express";
import {
    create,
    destroy,
    update,
    findAll,
    findById,
} from "../controller/glosarium-controller.js";
import { createSchema, updateSchema } from "../validator/schema.js";
import validate from "../../../middlewares/validate.js";
import authenticateToken from "../../../middlewares/auth.js";

import { upload } from "../storage/storage-config.js";

const router = Router();

const uploadFields = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

router.get("/", findAll);
router.get("/:id", findById);
router.post("/", uploadFields, authenticateToken, validate(createSchema), create);
router.put("/:id", uploadFields, authenticateToken, validate(updateSchema), update);
router.delete("/:id", authenticateToken, destroy);

export default router;
