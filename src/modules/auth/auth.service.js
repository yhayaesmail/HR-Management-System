import prisma from "../../config/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { unauthorized } from "../../utils/ApiError.js";
import { comparePassword } from "../../utils/hashing.js";
import logger from "../../utils/logger.js";

const REFRESH_TOKEN_EXPIRES_MS = 12 * 60 * 60 * 1000;

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    logger.warn(`Failed login attempt: invalid email - ${email}`);
    throw unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    logger.warn(`Failed login attempt for inactive user - ${email}`);
    throw unauthorized("Account is inactive");
  }

  const isValidPass = await comparePassword(password, user.password);
  if (!isValidPass) {
    logger.warn(`Failed login attempt: wrong password for email - ${email}`);
    throw unauthorized("Invalid email or password");
  }

  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
    },
  });

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
    throw unauthorized("No refresh token provided");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshtoken);
  } catch (err) {
    throw unauthorized("Invalid or expired refresh token");
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshtoken },
    include: { user: true },
  });
  if (
    !storedToken ||
    storedToken.expiresAt < new Date() ||
    !storedToken.user.isActive
  ) {
    throw unauthorized("Invalid or expired refresh token");
  }

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

export const logout = async (refreshtoken) => {
  if (!refreshtoken) return;

  await prisma.refreshToken.deleteMany({
    where: { token: refreshtoken },
  });
};
