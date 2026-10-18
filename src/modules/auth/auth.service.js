import prisma from "../../config/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { unauthorized, badRequest, notFound } from "../../utils/ApiError.js";
import { comparePassword, hashPassword } from "../../utils/hashing.js";
import logger from "../../utils/logger.js";
import crypto from "crypto";

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
      companyId: user.companyId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
    },
  });

  logger.info(`User logged in successfully: ${email}`);
  logger.audit("LOGIN", user.id);

  return {
    success: true,
    message: "Login successful",
    data: {
      user: { id: user.id, email: user.email, role: user.role, companyId: user.companyId },
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

export const registerCompany = async ({ email, password, companyName, companySlug }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw badRequest("Email already registered");
  }

  const existingCompany = await prisma.company.findUnique({ where: { slug: companySlug } });
  if (existingCompany) {
    throw badRequest("Company slug already taken");
  }

  const hashedPass = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: { name: companyName, slug: companySlug },
    });

    const user = await tx.user.create({
      data: {
        email,
        password: hashedPass,
        role: "COMPANY_ADMIN",
        companyId: company.id,
      },
    });

    logger.info(`Company registered: ${company.name} (${company.slug}) by ${email}`);
    logger.audit("REGISTER_COMPANY", user.id);

    return { user, company };
  });

  const accessToken = generateAccessToken({
    id: result.user.id,
    role: result.user.role,
    companyId: result.user.companyId,
  });
  const refreshToken = generateRefreshToken({
    id: result.user.id,
    role: result.user.role,
    companyId: result.user.companyId,
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: result.user.id,
      companyId: result.user.companyId,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    },
  });

  return {
    success: true,
    message: "Company registered successfully",
    data: {
      user: { id: result.user.id, email: result.user.email, role: result.user.role, companyId: result.user.companyId },
      company: { id: result.company.id, name: result.company.name, slug: result.company.slug },
      accessToken,
      refreshToken,
    },
  };
};

export const registerEmployee = async ({ email, password, inviteToken }) => {
  const invite = await prisma.invite.findUnique({ where: { token: inviteToken } });

  if (!invite) {
    throw unauthorized("Invalid invite token");
  }

  if (invite.usedAt) {
    throw unauthorized("Invite token already used");
  }

  if (invite.expiresAt < new Date()) {
    throw unauthorized("Invite token expired");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw badRequest("Email already registered");
  }

  if (invite.email.toLowerCase() !== email.toLowerCase()) {
    throw unauthorized("Invite token is not for this email");
  }

  const hashedPass = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPass,
        role: invite.role,
        companyId: invite.companyId,
      },
    });

    await tx.employee.create({
      data: {
        name: invite.name || email.split("@")[0],
        department: invite.department || "Unassigned",
        title: invite.title || "Unassigned",
        salary: invite.salary ?? 0,
        companyId: invite.companyId,
        userId: user.id,
      },
    });

    await tx.invite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });

    logger.info(`Employee registered: ${email} joined company ${invite.companyId}`);
    logger.audit("REGISTER_EMPLOYEE", user.id);

    return user;
  });

  const accessToken = generateAccessToken({
    id: result.id,
    role: result.role,
    companyId: result.companyId,
  });
  const refreshToken = generateRefreshToken({
    id: result.id,
    role: result.role,
    companyId: result.companyId,
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: result.id,
      companyId: result.companyId,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    },
  });

  return {
    success: true,
    message: "Employee registered successfully",
    data: {
      user: { id: result.id, email: result.email, role: result.role, companyId: result.companyId },
      accessToken,
      refreshToken,
    },
  };
};

export const getInviteStatus = async (token) => {
  const invite = await prisma.invite.findUnique({ where: { token } });

  if (!invite) {
    return { success: true, data: { status: "INVALID" } };
  }

  let status = "VALID";
  if (invite.usedAt) status = "USED";
  else if (invite.expiresAt < new Date()) status = "EXPIRED";

  return { success: true, data: { status } };
};

export const createInvite = async ({
  email,
  companyId,
  role = "EMPLOYEE",
  expiresInDays = 7,
  name,
  department,
  title,
  salary,
}) => {
  const existing = await prisma.invite.findUnique({ where: { email } });
  if (existing) {
    throw badRequest("An invite already exists for this email");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const invite = await prisma.invite.create({
    data: {
      email,
      companyId,
      role,
      token,
      expiresAt,
      name: name || null,
      department: department || null,
      title: title || null,
      salary: salary === undefined || salary === null || salary === "" ? null : Number(salary),
    },
  });

  logger.info(`Invite created for ${email} to company ${companyId}`);
  logger.audit("CREATE_INVITE", invite.id);

  return {
    success: true,
    message: "Invite created",
    data: { id: invite.id, email: invite.email, token: invite.token, expiresAt: invite.expiresAt },
  };
};
