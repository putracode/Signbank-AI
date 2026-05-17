import { Router } from "express";
import glosariumRouter from "../services/glosarium/routes/index.js";
import authenticationsRouter from "../services/authentications/routes/index.js";
import categoriesRouter from "../services/categories/routes/index.js";

const router = Router();

router.use("/glosarium", glosariumRouter);
router.use("/authentications", authenticationsRouter);
router.use("/categories", categoriesRouter);

export default router;
