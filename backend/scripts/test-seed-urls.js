const urls = [
  "https://images.unsplash.com/photo-1613521140785-e85e427f8002?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1522758971460-1d21fac222d9?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1549467657-3729906d4eeb?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1584346083533-5c74eb1c0eb3?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1563299718-d7486e969077?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1603006905393-49dc85ee22dc?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1598539958043-4e4c965c490a?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1582582494705-f8ce0b0c24f0?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=800",
];

const working = [];
const dead = [];

for (const url of urls) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (res.ok) working.push(url);
    else dead.push({ url, status: res.status });
  } catch (e) {
    dead.push({ url, error: e.message });
  }
}

console.log("Working:", working.length);
console.log("Dead:", dead.length);
dead.forEach((d) => console.log(d.status || d.error, d.url.slice(50)));
