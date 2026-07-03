import prisma from "../prisma/client.js";

const products = await prisma.product.findMany({
  select: { id: true, name: true, imageUrl: true, images: true },
});

const broken = [];
const local = [];
const empty = [];
const remote = [];

for (const p of products) {
  const url = p.imageUrl?.trim() || "";
  if (!url) empty.push(p);
  else if (url.startsWith("/images/")) local.push(p);
  else remote.push(p);
}

console.log("Total:", products.length);
console.log("Empty imageUrl:", empty.length);
console.log("Local /images/ paths:", local.length);
console.log("Remote URLs:", remote.length);

if (local.length) {
  console.log("\nSample local paths:");
  local.slice(0, 5).forEach((p) => console.log(`  ${p.id} ${p.name}: ${p.imageUrl}`));
}

if (empty.length) {
  console.log("\nEmpty URLs:");
  empty.forEach((p) => console.log(`  ${p.id} ${p.name}`));
}

console.log("\nSample remote:");
remote.slice(0, 5).forEach((p) => console.log(`  ${p.id} ${p.name}: ${p.imageUrl?.slice(0, 80)}`));

await prisma.$disconnect();
