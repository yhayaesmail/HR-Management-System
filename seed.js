import prisma from "./src/config/prisma.js";
import { hashPassword } from "./src/utils/hashing.js";

async function main() {
  const password = await hashPassword("admin123");
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      password,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email: "admin@example.com",
      password,
      role: "ADMIN",
    },
  });
  console.log("Admin user ready: admin@example.com / admin123");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
