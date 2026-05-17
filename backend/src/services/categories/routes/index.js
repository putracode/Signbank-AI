import { Router } from "express";
import {
    create,
    destroy,
    update,
    findAll,
    findById,
} from "../controller/category-controller.js";
import { categorySchema } from "../validator/schema.js";
import validate from "../../../middlewares/validate.js";
import authenticateToken from "../../../middlewares/auth.js";

const router = Router();

router.get("/", findAll);
router.get("/:id", findById);
router.post("/", authenticateToken, validate(categorySchema), create);
router.put("/:id", authenticateToken, validate(categorySchema), update);
router.delete("/:id", authenticateToken, destroy);

export default router;
