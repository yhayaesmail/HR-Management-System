import prisma from "../../config/prisma.js";

export const generateMonthlyPayroll = async (month, year, createdBy) => {
  const employees = await prisma.employee.findMany();
  const payrolls = [];
  for (const emp of employees) {
    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId: emp.id,
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });
    const absentDays = attendance.filter((a) => a.status !== "PRESENT").length;
    const deduction = (emp.salary / 30) * absentDays;
    const finalSalary = emp.salary - deduction;
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