import prisma from "./prisma/client.js";
import { VERIFIED_PRODUCT_IMAGES, pickGalleryUrls } from "./utils/verifiedProductImages.js";

const categories = [
  {
    name: "Vases",
    adjectives: ["Nordic", "Ceramic", "Glass", "Minimalist", "Ribbed", "Matte", "Tall", "Sculptural", "Hand-painted", "Textured", "Geometric", "Terracotta"],
    nouns: ["Vase", "Flower Pot", "Decorative Urn", "Centerpiece Vase", "Bud Vase", "Floor Vase"]
  },
  {
    name: "Clocks",
    adjectives: ["Geometric", "Brass", "Wooden", "Silent", "Modern", "Vintage", "Marble", "Floating", "Sunburst", "Minimalist", "Oversized", "Sleek"],
    nouns: ["Table Clock", "Wall Clock", "Mantel Clock", "Desk Clock", "Analog Clock", "Pendulum Clock"]
  },
  {
    name: "Wall Decor",
    adjectives: ["Macrame", "Woven", "Canvas", "Abstract", "Metal", "Framed", "Bohemian", "Floating", "Rustic", "Industrial", "Minimalist", "Gold-leaf"],
    nouns: ["Wall Hanging", "Art Print", "Wall Shelf", "Tapestry", "Mirror", "Decorative Panels"]
  },
  {
    name: "Sculptures",
    adjectives: ["Abstract", "Gold", "Ceramic", "Knot", "Wooden", "Marble", "Bronze", "Modernist", "Twisted", "Geometric", "Resin", "Monochrome"],
    nouns: ["Table Sculpture", "Object", "Statue", "Figurine", "Floor Sculpture", "Bust"]
  }
];

const unsplashUrls = VERIFIED_PRODUCT_IMAGES;

const generateProducts = () => {
  const products = [];
  let idCounter = 1;
  
  categories.forEach(cat => {
    // Generate exactly 12 products per category (total 48)
    for (let i = 0; i < 12; i++) {
      const adjective = cat.adjectives[i];
      const noun = cat.nouns[i % cat.nouns.length];
      const productName = `${adjective} ${noun}`;
      
      const mainImageUrl = unsplashUrls[i % unsplashUrls.length];
      const gallery = pickGalleryUrls(mainImageUrl, unsplashUrls, 3, i);
      
      products.push({
        name: productName,
        description: `Experience the finest craftsmanship with this stunning ${adjective.toLowerCase()} ${noun.toLowerCase()}. Perfect for adding a touch of elegance and modern flair to any space in your home. Each piece is uniquely designed to complement contemporary interiors.`,
        price: Math.floor(Math.random() * 4000) + 999,
        category: cat.name,
        stock: Math.floor(Math.random() * 50) + 10,
        imageUrl: mainImageUrl,
        images: JSON.stringify(gallery),
        ...(i === 0 && { videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" })
      });
      idCounter++;
    }
  });
  
  return products;
}

async function main() {
  console.log("Cleaning up old data to prevent foreign key errors...");
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  
  console.log("Deleting old products...");
  await prisma.product.deleteMany({});
  
  const products = generateProducts();
  console.log(`Seeding ${products.length} new unique products...`); 
  
  const result = await prisma.product.createMany({
    data: products,
    skipDuplicates: true
  });
  console.log(`✅ Successfully added ${result.count} products to the database!`);
}

main()
  .catch(e => {
    console.error("Error seeding products:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

