import prisma from "../src/config/prisma.js";
import { hashPassword } from "../src/utils/hashing.js";

let n = 0;
let defaultCompany = null;

const getDefaultCompany = async () => {
  if (defaultCompany) return defaultCompany;
  defaultCompany = await prisma.company.findUnique({ where: { slug: "default" } });
  if (!defaultCompany) {
    defaultCompany = await prisma.company.create({
      data: { name: "Default Company", slug: "default" },
    });
  }
  return defaultCompany;
};

export const makeUser = async (role = "EMPLOYEE", active = true) => {
  n += 1;
  const email = `tst_${Date.now()}_${n}@hrm.dev`;
  const company = await getDefaultCompany();
  const user = await prisma.user.create({
    data: {
      email,
      password: await hashPassword("password123"),
      role,
      isActive: active,
      companyId: company.id,
    },
  });
  return { user, password: "password123", email, companyId: company.id };
};

export const makeEmployee = async (userId, companyId) => {
  const company = companyId ? { id: companyId } : await getDefaultCompany();
  return prisma.employee.create({
    data: {
      name: "Test Employee",
      department: "Engineering",
      title: "Developer",
      salary: 3000,
      userId,
      companyId: company.id,
    },
  });
};

export const removeConversation = async (id) => {
  await prisma.message.deleteMany({ where: { conversationId: id } });
  await prisma.conversationParticipant.deleteMany({ where: { conversationId: id } });
  await prisma.conversation.deleteMany({ where: { id } });
};

export const removeUser = async (id) => {
  const convs = await prisma.conversationParticipant.findMany({
    where: { userId: id },
    select: { conversationId: true },
  });
  for (const c of convs) await removeConversation(c.conversationId);
  const emp = await prisma.employee.findUnique({ where: { userId: id } });
  if (emp) {
    await prisma.attendance.deleteMany({ where: { employeeId: emp.id } });
    await prisma.payroll.deleteMany({ where: { employeeId: emp.id } });
    await prisma.tasks.deleteMany({ where: { employeeId: emp.id } });
    await prisma.invite.deleteMany({ where: { companyId: emp.companyId } });
    await prisma.employee.delete({ where: { id: emp.id } });
  }
  await prisma.refreshToken.deleteMany({ where: { userId: id } });
  await prisma.user.deleteMany({ where: { id } });
};

export const disconnect = async () => {
  await prisma.$disconnect();
};
