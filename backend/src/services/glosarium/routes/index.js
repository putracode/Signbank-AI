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

const router = Router();

router.get("/", findAll);
router.get("/:id", findById);
router.post("/", validate(createSchema), create);
router.put("/:id", validate(updateSchema), update);
router.delete("/:id", destroy);

export default router;
