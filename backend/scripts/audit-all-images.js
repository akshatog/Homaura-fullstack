import prisma from "../prisma/client.js";

const products = await prisma.product.findMany({
  select: { id: true, name: true, imageUrl: true, images: true },
});

let ok = 0;
let broken = 0;
const brokenList = [];

async function checkUrl(url) {
  if (!url?.trim()) return false;
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.ok;
  } catch {
    return false;
  }
}

for (const p of products) {
  const valid = await checkUrl(p.imageUrl);
  if (valid) {
    ok++;
  } else {
    broken++;
    brokenList.push(p);
    console.log("BROKEN:", p.id, p.name, p.imageUrl);
  }
}

console.log(`\nOK: ${ok}, Broken: ${broken} / ${products.length}`);

await prisma.$disconnect();
