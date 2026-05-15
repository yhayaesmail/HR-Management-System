import prisma from "../../config/prisma.js";
import { badRequest } from "../../utils/ApiError.js";

const getPayrollPeriod = (month, year) => {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw badRequest("Month must be between 1 and 12");
  }
  if (!Number.isInteger(year) || year < 2000) {
    throw badRequest("Year must be valid");
  }

  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 1),
    daysInMonth: new Date(year, month, 0).getDate(),
  };
};

export const generateMonthlyPayroll = async (month, year, createdBy) => {
  const { start, end, daysInMonth } = getPayrollPeriod(month, year);
  const employees = await prisma.employee.findMany({
    where: { isActive: true },
  });
  const payrolls = [];
  for (const emp of employees) {
    const existingPayroll = await prisma.payroll.findFirst({
      where: { employeeId: emp.id, month, year },
    });
    if (existingPayroll) {
      payrolls.push(existingPayroll);
      continue;
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId: emp.id,
        date: { gte: start, lt: end },
      },
    });
    const attendedDays = attendance.filter(
      (a) => a.status !== "ABSENT" && a.checkIn,
    ).length;
    const explicitAbsentDays = attendance.filter(
      (a) => a.status === "ABSENT",
    ).length;
    const absentDays = Math.max(
      explicitAbsentDays,
      daysInMonth - attendedDays,
    );
    const deduction = (emp.salary / 30) * Math.min(absentDays, 30);
    const finalSalary = Math.max(emp.salary - deduction, 0);
    const payroll = await prisma.payroll.create({
      data: {
        employeeId: emp.id,
        baseSalary: emp.salary,
        bonus: 0,
        deduction,
        finalSalary,
        month,
        year,
        createdBy,
      },
    });
    payrolls.push(payroll);
  }
  return payrolls;
};


export const getMonthlyReport = async (month, year) => {
  getPayrollPeriod(month, year);
  const payrolls = await prisma.payroll.findMany({
    where: { month, year },
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
      employeeId: "asc",
    },
  });
  const totalCost = payrolls.reduce((sum, p) => sum + p.finalSalary, 0);
  return {
    month,
    year,
    totalCost,
    payrolls,
  };
};
