import prisma from "../../config/prisma.js";
import { hashPassword } from "../../utils/hashing.js";
import logger from "../../utils/logger.js";

export const createEmployee = async (data) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) {
    logger.warn(
      `Attempted to create employee with existing email: ${data.email}`,
    );
    throw new Error("Email Already Existing");
  }

  const hashedPass = await hashPassword(data.password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: data.email, password: hashedPass, role: "EMPLOYEE" },
    });

    const employee = await tx.employee.create({
      data: {
        name: data.name,
        department: data.department,
        salary: data.salary,
        address: data.address,
        title: data.title,
        userId: user.id,
        phone: data.phone,
      },
      include: { user: { select: { id: true, email: true, role: true } } },
    });

    logger.info(`Employee created: ${employee.name} (ID: ${employee.id})`);
    logger.audit("CREATE_EMPLOYEE", user.id);

    return employee;
  });

  return result;
};

export const getEmployees = async (query) => {
  const { page = 1, limit = 10, search = "", department, title } = query;
  const where = {
    isActive: true,
    AND: [
      department ? { department } : {},
      title ? { title } : {},
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { user: { email: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {},
    ],
  };
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      include: { user: { select: { id: true, email: true, role: true } } },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.employee.count({ where }),
  ]);

  logger.info(`Fetched employees list: page ${page}, limit ${limit}`);
  return {
    employees,
    total,
    totalPages: Math.ceil(total / limit),
    page: Number(page),
  };
};

export const getEmployeeById = async (id) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { user: true, payrolls: true, attendances: true, tasks: true },
  });
  if (!employee) {
    logger.warn(`Attempted to fetch non-existing employee ID: ${id}`);
    throw new Error("Employee does not exist");
  }
  logger.info(`Fetched employee ID: ${id}`);
  return employee;
};

export const updateEmployee = async (id, data) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!employee) {
    logger.warn(`Attempted to update non-existing employee ID: ${id}`);
    throw new Error("Employee not found");
  }
  if (data.email && data.email !== employee.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      logger.warn(
        `Attempted to update employee ID: ${id} with existing email: ${data.email}`,
      );
      throw new Error("Sorry Email Already in use");
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    if (data.email)
      await tx.user.update({
        where: { id: employee.user.id },
        data: { email: data.email },
      });
    const updatedEmployee = await tx.employee.update({ where: { id }, data });
    logger.info(`Employee updated ID: ${id}`);
    logger.audit("UPDATE_EMPLOYEE", employee.user.id);
    return updatedEmployee;
  });

  return result;
};

export const deleteEmployee = async (id) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!employee) {
    logger.warn(`Attempted to delete non-existing employee ID: ${id}`);
    throw new Error("Employee does not exist");
  }
  if (!employee.isActive) {
    logger.warn(`Attempted to delete already deleted employee ID: ${id}`);
    throw new Error("Employee is already deleted");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: employee.user.id },
      data: { isActive: false },
    });
    const deletedEmployee = await tx.employee.update({
      where: { id },
      data: { isActive: false },
    });
    logger.info(`Employee soft-deleted ID: ${id}`);
    logger.audit("DELETE_EMPLOYEE", employee.user.id);
    return deletedEmployee;
  });

  return result;
};

export const deleteAllEmployees = async () => {
  const result = await prisma.$transaction(async (tx) => {
    await tx.user.updateMany({
      where: { employee: { isActive: true } },
      data: { isActive: false },
    });
    const updatedEmployees = await tx.employee.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
    logger.info(`All employees soft-deleted`);
    return updatedEmployees;
  });

  return result;
};
