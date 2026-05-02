import { Router } from "express";
import glosariumRouter from "../services/glosarium/routes/index.js";

const router = Router();

router.use("/glosarium", glosariumRouter);

export default router;
