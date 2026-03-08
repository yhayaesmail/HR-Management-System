import prisma from "./src/config/prisma.js";
import { hashPassword } from "./src/utils/hashing.js";

async function main() {
  const password = await hashPassword("MO123456");
  await prisma.user.create({
    data: {
      email: "MO1@example.com",
      password,
      role: "EMPLOYEE",
    },
  });
  console.log("Admin user created");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
