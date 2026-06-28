import prisma from "./prisma/client.js";
import bcrypt from "bcryptjs";

async function main() {
  const email = "admin@gmail.com";
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, isAdmin: true },
    create: {
      email,
      name: "Super Admin",
      password: hashedPassword,
      isAdmin: true
    }
  });
  
  console.log("✅ Admin user successfully created/updated in the database!");
  console.log(`Email: ${user.email}`);
  console.log("Password: admin123");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
