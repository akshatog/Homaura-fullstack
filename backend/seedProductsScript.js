import prisma from "./prisma/client.js";

const products = [
  {
    name: "Nordic Ceramic Vase",
    description: "Elegant matte ceramic vase with a minimalist Scandinavian design, perfect for modern interiors.",
    price: 1299,
    category: "Vases",
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1613521140785-e85e427f8002?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Geometric Brass Table Clock",
    description: "A sleek contemporary table clock featuring a minimalist brass frame and silent movement.",
    price: 2499,
    category: "Clocks",
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Macrame Woven Wall Hanging",
    description: "Handcrafted bohemian macrame wall decor made from natural cotton rope with intricate knotting.",
    price: 1599,
    category: "Wall Decor",
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1522758971460-1d21fac222d9?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Abstract Gold Metal Sculpture",
    description: "A stunning modern tabletop sculpture with flowing golden ribbons, adding a touch of luxury.",
    price: 3199,
    category: "Sculptures",
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1549467657-3729906d4eeb?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Amber Glass Table Lamp",
    description: "Warm and aesthetic lighting with a vintage-inspired amber glass shade and brass base.",
    price: 4599,
    category: "Lighting",
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Minimalist Terrazzo Planter",
    description: "A contemporary indoor planter crafted from premium terrazzo with subtle gray and black flecks.",
    price: 899,
    category: "Planters",
    stock: 60,
    imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Rattan Decorative Storage Basket",
    description: "Eco-friendly woven rattan basket offering stylish and rustic storage for any living space.",
    price: 1199,
    category: "Storage",
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1584346083533-5c74eb1c0eb3?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Velvet Lumbar Cushion Cover",
    description: "Luxurious emerald green velvet cushion cover with elegant gold piping for a premium aesthetic.",
    price: 599,
    category: "Cushions",
    stock: 100,
    imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Faux Monstera Deliciosa Plant",
    description: "Lifelike artificial Monstera plant featuring lush green leaves, perfect for zero-maintenance decor.",
    price: 2999,
    category: "Artificial Plants",
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Hexagonal Frameless Mirror",
    description: "A modern frameless wall mirror with a unique hexagonal cut, enhancing room brightness and depth.",
    price: 1899,
    category: "Mirrors",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Scented Soy Wax Pillar Candle",
    description: "Hand-poured aesthetic pillar candle with a calming lavender scent and ribbed minimalist texture.",
    price: 399,
    category: "Candles",
    stock: 150,
    imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Marble and Wood Serving Tray",
    description: "A luxurious decorative tray blending natural acacia wood with cool white marble and brass handles.",
    price: 2199,
    category: "Decorative Trays",
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1563299718-d7486e969077?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Boho Fringed Area Rug",
    description: "A cozy bohemian floor rug with tribal geometric patterns and soft cotton tassels.",
    price: 5499,
    category: "Rugs",
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Industrial Iron Wall Shelf",
    description: "Rustic meets modern in this floating wall shelf crafted from matte black iron and reclaimed wood.",
    price: 1799,
    category: "Wall Decor",
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Ceramic Knot Object",
    description: "A contemporary decorative knot sculpture made from smooth clay, adding subtle visual interest to coffee tables.",
    price: 799,
    category: "Table Decor",
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Matte Black Candlestick Holders",
    description: "Set of three minimalist metal candlestick holders in varying heights for an elegant dining display.",
    price: 1299,
    category: "Home Accessories",
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1603006905393-49dc85ee22dc?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Concrete Desk Organizer",
    description: "An industrial-style desk accessory made from raw concrete, perfect for storing pens and small items.",
    price: 649,
    category: "Storage",
    stock: 55,
    imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Artificial Eucalyptus Garland",
    description: "A delicate string of faux frosted eucalyptus leaves to drape over mantles or dining tables.",
    price: 899,
    category: "Artificial Plants",
    stock: 65,
    imageUrl: "https://images.unsplash.com/photo-1598539958043-4e4c965c490a?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Brass Sunburst Wall Mirror",
    description: "A striking mid-century modern sunburst mirror featuring golden brass rays and a round center glass.",
    price: 3499,
    category: "Mirrors",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1582582494705-f8ce0b0c24f0?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Large Woven Floor Pouf",
    description: "A comfortable and stylish aesthetic floor seating pouf woven from durable natural jute fibers.",
    price: 2799,
    category: "Cushions",
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800"
  }
];

async function main() {
  console.log("Seeding products...");
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
