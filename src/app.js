import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./utils/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use(errorHandler);

export default app;
