import prisma from "./prisma/client.js";

async function main() {
  const images = [
    "/images/premium_vase_1782593752505.png",
    "/images/premium_clock_1782593762929.png",
    "/images/premium_wall_decor_1782593772120.png",
    "/images/premium_lamp_1782593780532.png",
    "/images/premium_planter_1782593790302.png"
  ];

  const products = await prisma.product.findMany();
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const image = images[i % images.length]; 
    await prisma.product.update({
      where: { id: product.id },
      data: { imageUrl: image }
    });
  }
  console.log("✅ Successfully updated all product images to local premium AI generations!");
}

main().catch(console.error).finally(()=>process.exit(0));
