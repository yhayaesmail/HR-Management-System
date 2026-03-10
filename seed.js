import prisma from "./src/config/prisma.js";
import { hashPassword } from "./src/utils/hashing.js";

async function main() {
  const password = await hashPassword("yaya123");
  await prisma.user.create({
    data: {
      email: "yaya@example.com",
      password,
      role: "ADMIN",
    },
  });
  console.log("Admin user created");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
