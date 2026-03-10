import jwt from "jsonwebtoken";
import { unauthorized } from "../utils/ApiError.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next( unauthorized("No access token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return next( unauthorized("Invalid or expired token"));
  }
};
