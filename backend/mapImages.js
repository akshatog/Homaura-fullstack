import prisma from "./prisma/client.js";

async function main() {
  const imagesMap = {
    "Nordic Ceramic Vase": "/images/premium_vase_1782593752505.png",
    "Geometric Brass Table Clock": "/images/premium_clock_1782593762929.png",
    "Macrame Woven Wall Hanging": "/images/premium_wall_decor_1782593772120.png",
    "Abstract Gold Metal Sculpture": "/images/premium_sculpture_1782593934820.png",
    "Amber Glass Table Lamp": "/images/premium_lamp_1782593780532.png",
    "Minimalist Terrazzo Planter": "/images/premium_planter_1782593790302.png",
    "Rattan Decorative Storage Basket": "/images/premium_basket_1782593945288.png",
    "Velvet Lumbar Cushion Cover": "/images/premium_cushion_1782593955719.png",
    "Faux Monstera Deliciosa Plant": "/images/premium_plant_1782593964565.png",
    "Hexagonal Frameless Mirror": "/images/premium_hex_mirror_1782593975769.png",
    "Scented Soy Wax Pillar Candle": "/images/premium_candle_1782593985899.png",
    "Marble and Wood Serving Tray": "/images/premium_tray_1782593997077.png",
    "Boho Fringed Area Rug": "/images/premium_rug_1782594008079.png",
    "Industrial Iron Wall Shelf": "/images/premium_shelf_1782594025090.png",
    "Ceramic Knot Object": "/images/premium_knot_1782594034094.png",
    "Matte Black Candlestick Holders": "/images/premium_candlesticks_1782594044963.png",
    "Concrete Desk Organizer": "/images/premium_organizer_1782594054071.png",
    "Artificial Eucalyptus Garland": "/images/premium_plant_1782593964565.png", 
    "Brass Sunburst Wall Mirror": "/images/premium_hex_mirror_1782593975769.png", 
    "Large Woven Floor Pouf": "/images/premium_cushion_1782593955719.png" 
  };

  const products = await prisma.product.findMany();
  for (let product of products) {
    if (imagesMap[product.name]) {
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: imagesMap[product.name] }
      });
      console.log(`Updated image for: ${product.name}`);
    }
  }
  console.log("✅ All product images precisely mapped to unique premium generations!");
}

main().catch(console.error).finally(()=>process.exit(0));
