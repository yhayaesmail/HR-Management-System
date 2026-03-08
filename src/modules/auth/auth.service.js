import prisma from "../../config/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { unauthorized } from "../../utils/ApiError.js";
import { hashPassword, comparePassword } from "../../utils/hashing.js";

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new unauthorized("Invalid Email Or Password");
  }
  const isValidPass = await comparePassword(password, user.password);
  if (!isValidPass) {
    throw  unauthorized("Invalid Email Or Password");
  }
  const accessToken = generateAccessToken({
    id: user.id,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    id: user.id,
    role: user.role,
  });
  return {
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    },
  };
};

export const refreshAccessToken = async (refreshtoken) => {
  if (!refreshtoken) {
    throw  unauthorized("No Refresh Access Token Provided");
  }
  const decoded = verifyRefreshToken(refreshtoken);
  const newAccessToken = generateAccessToken({
    id: decoded.id,
    role: decoded.role,
  });
  return {
    success: true,
    message: "Token Refreshed",
    data: {
      accessToken: newAccessToken,
    },
  };
};
