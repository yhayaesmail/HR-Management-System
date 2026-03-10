import prisma from "../../config/prisma.js";
import { hashPassword } from "../../utils/hashing.js";

export const createEmployee = async (data) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) {
    throw new Error("Email Already Existing");
  }
  const hashedPass = await hashPassword(data.password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        password: hashedPass,
        role: "EMPLOYEE",
      },
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
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
    return employee;
  });
  return result;
};

////////////////////////////////////////////////////////////////////////
////////////////////////GETEMPLOYEE/////////////////////////////////////
////////////////////////////////////////////////////////////////////////

export const getEmployees = async () => {};
