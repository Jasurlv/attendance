import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = (process.env.ADMIN_USERNAME ?? "admin").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Director";

  if (!password || password.length < 8) {
    throw new Error("Set ADMIN_PASSWORD (at least 8 characters) in .env before seeding.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { username },
    update: { passwordHash, name, role: "ADMIN", active: true },
    create: { username, passwordHash, name, role: "ADMIN" },
  });
  console.log(`Admin account ready. Sign in as "${username}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
