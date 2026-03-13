import prisma from "../../config/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { unauthorized } from "../../utils/ApiError.js";
import { hashPassword, comparePassword } from "../../utils/hashing.js";
import logger from "../../utils/logger.js";

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    logger.warn(`Failed login attempt: invalid email - ${email}`);
    throw new Error("Invalid Email Or Password");
  }

  const isValidPass = await comparePassword(password, user.password);
  if (!isValidPass) {
    logger.warn(`Failed login attempt: wrong password for email - ${email}`);
    throw new Error("Invalid Email Or Password");
  }

  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

  logger.info(`User logged in successfully: ${email}`);
  logger.audit("LOGIN", user.id);

  return {
    success: true,
    message: "Login successful",
    data: {
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    },
  };
};

export const refreshAccessToken = async (refreshtoken) => {
  if (!refreshtoken) {
    logger.warn("Refresh token missing in request");
    throw new Error("No Refresh Access Token Provided");
  }

  const decoded = verifyRefreshToken(refreshtoken);
  const newAccessToken = generateAccessToken({
    id: decoded.id,
    role: decoded.role,
  });

  logger.info(`Access token refreshed for userId: ${decoded.id}`);
  logger.audit("REFRESH_TOKEN", decoded.id);

  return {
    success: true,
    message: "Token Refreshed",
    data: { accessToken: newAccessToken },
  };
};
