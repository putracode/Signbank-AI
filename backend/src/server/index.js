import express from "express";
import cors from "cors";
import path from "path";
import routes from "../routes/index.js";
import ErrorHandler from "../middlewares/error.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve(process.cwd(), "public/uploads")));
app.use(routes);
app.use(ErrorHandler);

export default app;
