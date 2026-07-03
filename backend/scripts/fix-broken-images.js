import prisma from "../prisma/client.js";
import {
  VERIFIED_PRODUCT_IMAGES,
  isImageUrlReachable,
  pickGalleryUrls,
} from "../utils/verifiedProductImages.js";

async function main() {
  // Verify pool once at start
  const pool = [];
  for (const url of VERIFIED_PRODUCT_IMAGES) {
    if (!pool.includes(url) && (await isImageUrlReachable(url))) {
      pool.push(url);
    }
  }

  if (pool.length === 0) {
    console.error("No reachable images in verified pool!");
    process.exit(1);
  }

  console.log(`Verified pool: ${pool.length} URLs`);

  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  let fixed = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const reachable = await isImageUrlReachable(product.imageUrl);

    if (reachable) continue;

    const mainUrl = pool[i % pool.length];
    const gallery = pickGalleryUrls(mainUrl, pool, 3, i);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        imageUrl: mainUrl,
        images: JSON.stringify(gallery),
      },
    });

    console.log(`Fixed #${product.id} ${product.name}`);
    fixed++;
  }

  console.log(`\nDone. Fixed ${fixed} / ${products.length} products.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
