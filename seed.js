import prisma from "./src/config/prisma.js";
import { hashPassword } from "./src/utils/hashing.js";

async function main() {
  const password = await hashPassword("admin123");

  let company = await prisma.company.findUnique({ where: { slug: "default" } });
  if (!company) {
    company = await prisma.company.create({
      data: { name: "Default Company", slug: "default" },
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@hrm.dev" },
    update: {
      password,
      role: "COMPANY_ADMIN",
      isActive: true,
      companyId: company.id,
    },
    create: {
      email: "admin@hrm.dev",
      password,
      role: "COMPANY_ADMIN",
      companyId: company.id,
    },
  });
  console.log("Admin user ready: admin@hrm.dev / admin123");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
