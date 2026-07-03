import { VERIFIED_PRODUCT_IMAGES } from "../utils/verifiedProductImages.js";

const unique = [...new Set(VERIFIED_PRODUCT_IMAGES)];
const working = [];

for (const url of unique) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    console.log(res.ok ? "OK" : res.status, url.slice(38, 75));
    if (res.ok) working.push(url);
  } catch (e) {
    console.log("ERR", url.slice(38, 75));
  }
}

console.log(`\nWorking: ${working.length}/${unique.length}`);
