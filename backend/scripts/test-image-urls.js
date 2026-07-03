import prisma from "../prisma/client.js";

const names = [
  "Abstract Table Sculpture",
  "Woven Art Print",
  "Canvas Wall Shelf",
  "Abstract Tapestry",
  "Framed Decorative Panels",
];

const products = await prisma.product.findMany({
  where: { name: { in: names } },
  select: { id: true, name: true, imageUrl: true, images: true },
});

for (const p of products) {
  console.log("\n---", p.name, "---");
  console.log("imageUrl:", p.imageUrl);
  try {
    const res = await fetch(p.imageUrl, { method: "HEAD", redirect: "follow" });
    console.log("HEAD status:", res.status, res.url);
  } catch (e) {
    console.log("HEAD error:", e.message);
  }
}

await prisma.$disconnect();
