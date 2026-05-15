import prisma from "../../config/prisma.js";
import { badRequest, forbidden, notFound } from "../../utils/ApiError.js";

export const createPayroll = async (data, userId) => {
  const employee = await prisma.employee.findUnique({
    where: { id: data.employeeId },
  });
  if (!employee) {
    throw notFound("Employee not found");
  }
  const exists = await prisma.payroll.findFirst({
    where: {
      employeeId: data.employeeId,
      month: data.month,
      year: data.year,
    },
  });
  if (exists) {
    throw badRequest("Payroll already exists for this month");
  }
  const baseSalary = data.baseSalary ?? employee.salary;
  const bonus = data.bonus ?? 0;
  const deduction = data.deduction ?? 0;
  const finalSalary = baseSalary + bonus - deduction;
  const payroll = await prisma.payroll.create({
    data: {
      employeeId: data.employeeId,
      baseSalary,
      bonus,
      deduction,
      finalSalary,
      month: data.month,
      year: data.year,
      createdBy: userId,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
    },
  });

  return payroll;
};

export const getPayrolls = async () => {
  return prisma.payroll.findMany({
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getPayrollById = async (id, currentUser) => {
  const payroll = await prisma.payroll.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
    },
  });
  if (!payroll) {
    throw notFound("Payroll not found");
  }
  if (
    currentUser.role !== "ADMIN" &&
    payroll.employeeId !== currentUser.employee?.id
  ) {
    throw forbidden("You can only access your own payroll");
  }
  return payroll;
};

export const getEmployeePayrolls = async (employeeId) => {
  return prisma.payroll.findMany({
    where: { employeeId },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
};

export const getMyPayrolls = async (employeeId) => {
  return prisma.payroll.findMany({
    where: { employeeId },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
};

export const updatePayroll = async (id, data, userId) => {
  const payroll = await prisma.payroll.findUnique({
    where: { id },
  });
  if (!payroll) {
    throw notFound("Payroll not found");
  }
  const baseSalary = data.baseSalary ?? payroll.baseSalary;
  const bonus = data.bonus ?? payroll.bonus;
  const deduction = data.deduction ?? payroll.deduction;
  const finalSalary = baseSalary + bonus - deduction;
  return prisma.payroll.update({
    where: { id },
    data: {
      baseSalary,
      bonus,
      deduction,
      finalSalary,
      updatedBy: userId,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
    },
  });
};

export const deletePayroll = async (id) => {
  const payroll = await prisma.payroll.findUnique({
    where: { id },
  });
  if (!payroll) {
    throw notFound("Payroll not found");
  }
  await prisma.payroll.delete({
    where: { id },
  });
  return { message: "Payroll deleted successfully" };
};
