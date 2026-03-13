import jwt from "jsonwebtoken";
import { unauthorized } from "../utils/ApiError.js";
import prisma from "../config/prisma.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(unauthorized("No access token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // جلب بيانات الموظف كاملة
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        employee: true,
      },
    });

    if (!user) {
      return next(unauthorized("User not found"));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      employee: user.employee,
    };

    next();
  } catch (err) {
    return next(unauthorized("Invalid or expired token"));
  }
};
