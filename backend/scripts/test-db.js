import prisma from "../prisma/client.js";

try {
  const count = await prisma.product.count();
  console.log("Product count:", count);
} catch (e) {
  console.error("DB error:", e.message);
} finally {
  await prisma.$disconnect();
}
