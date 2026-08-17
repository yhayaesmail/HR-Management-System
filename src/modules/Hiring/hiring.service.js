import prisma from "../../config/prisma.js";
import logger from "../../utils/logger.js";
import { badRequest, forbidden, notFound } from "../../utils/ApiError.js";

export const receiveApplications = async (data) => {
  const existingEmail = await prisma.hiring.findFirst({
    where: { email: data.email },
  });
  if (existingEmail) {
    logger.warn(`Tring to make Apolication with Existing Email`);
    throw badRequest(`Email Already Have Application`);
  }
  logger.info(`Application Created For Email: ${data.email}`);
  return await prisma.hiring.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      education: data.education,
      coverLetter: data.coverLetter,
      graduateYear: data.graduateYear,
      experience: data.experience,
      position: data.position,
    },
  });
};

export const getApplications = async (query, currentUser) => {
  if (currentUser.role !== "ADMIN") {
    throw forbidden(`Sorry You Have No Access To The Applications `);
  }
  const { page = 1, limit = 10, status } = query;
  const where = { ...(status ? { status } : {}) };
  const skip = (Number(page) - 1) * Number(limit);

  const [applications, total] = await Promise.all([
    prisma.hiring.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.hiring.count({ where }),
  ]);

  logger.info(`fetched all Applications to ${currentUser.id}`);
  return {
    applications,
    total,
    totalPages: Math.ceil(total / limit),
    page: Number(page),
  };
};

export const proccessApplication = async (email, status, currentUser) => {
  if (currentUser.role !== "ADMIN") {
    throw forbidden(`Sorry You Don't Have The Permission To Do That.`);
  }
  const application = await prisma.hiring.findUnique({
    where: { email },
  });
  if (!application) {
    throw notFound(`No Appication Found To This Email`);
  }

  const update = await prisma.hiring.update({
    where: { email },
    data: { status, updatedBy: currentUser.id },
  });
  logger.info(`Application for Email ${email} Updated Successfuly`);
  return update;
};

export const getApplicationById = async (email, currentUser) => {
  if (currentUser.role !== "ADMIN") {
    throw forbidden(`Sorry You Don't Have The Permission To Do That.`);
  }
  const result = await prisma.hiring.findUnique({
    where: { email },
  });

  if (!result) {
    throw notFound(`No Application For Email ${email}`);
  }
  logger.info(`fetched Application for ${currentUser.id}`);
  return result;
};

export const deleteApplication = async (email, currentUser) => {
  if (currentUser.role !== "ADMIN") {
    throw forbidden(`Sorry You Don't Have The Permission To Do That.`);
  }
  const result = await prisma.hiring.findUnique({
    where: { email },
  });
  if (!result) {
    throw notFound(`No Application For Email ${email}`);
  }
  const del = await prisma.hiring.delete({
    where: { email },
  });
    logger.info(`delete Application ${email} by ${currentUser.id}`);
  return del;
};
