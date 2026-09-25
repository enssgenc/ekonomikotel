import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
const source = path.resolve(process.argv[2] || "../source-ett");
const output = path.resolve("public");
const rawHotels = JSON.parse(
  await fs.readFile(
    path.join(source, "scripts/cappadocia-import/data/final.json"),
    "utf8",
  ),
);
const { PACKAGES, AMENITY_LABELS } = await import(
  pathToFileURL(path.join(source, "lib/data.js")).href
);
const assetMap = new Map();
const missing = [];
async function imageAsset(original, maxWidth = 1440) {
  if (!original?.startsWith("/assets/")) return null;
  if (assetMap.has(original)) return assetMap.get(original);
  const destination = original
    .replace("/assets/", "/media/")
    .replace(/\.[^.]+$/, ".webp");
  const input = path.join(source, "public", original);
  const target = path.join(output, destination);
  try {
    await fs.access(input);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await sharp(input)
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(target);
    assetMap.set(original, destination);
    return destination;
  } catch (error) {
    missing.push({ path: original, reason: error.message });
    assetMap.set(original, null);
    return null;
  }
}
const hotels = [];
for (const hotel of rawHotels) {
  const gallery = [];
  for (const original of [...new Set([hotel.img, ...hotel.gallery])]) {
    const image = await imageAsset(original);
    if (image) gallery.push(image);
  }
  if (!gallery.length) throw new Error(`No photographs for ${hotel.slug}`);
  const { price, rating, _manifest, ...content } = hotel;
  hotels.push({
    ...content,
    img: gallery[0],
    gallery,
    sourceId: hotel.sourceHotelId,
    sourcePage: `https://ekonomiktatilim.com/oteller/${hotel.slug}/`,
  });
}
const tours = [];
for (const tour of PACKAGES.filter((item) =>
  item.slug.startsWith("kapadokya-"),
)) {
  const { price, reviews, contact, contactNote, ...content } = tour;
  const gallery = [];
  for (const original of [
    ...new Set([tour.img, ...(tour.seoImages || []), ...(tour.gallery || [])]),
  ]) {
    const image = await imageAsset(original);
    if (image) gallery.push(image);
  }
  tours.push({
    ...content,
    img: gallery[0],
    gallery,
    sourcePage: `https://ekonomiktatilim.com/paketler/${tour.slug}/`,
  });
}
const hero = await imageAsset("/assets/destinations/kapadokya.jpg", 1920);
await fs.mkdir("src/data", { recursive: true });
await fs.mkdir("docs/source", { recursive: true });
await fs.writeFile(
  "src/data/catalog.json",
  JSON.stringify({ hotels, tours, amenities: AMENITY_LABELS, hero }, null, 2),
);
await fs.writeFile(
  "docs/source/hotels-original.json",
  JSON.stringify(rawHotels, null, 2),
);
await fs.writeFile(
  "docs/source/packages-original.json",
  JSON.stringify(
    PACKAGES.filter((item) => item.slug.startsWith("kapadokya-")),
    null,
    2,
  ),
);
const provenance = {
  importedAt: new Date().toISOString(),
  sourceRepository: "https://github.com/enssgenc/ekonomiltatilimv2",
  sourceCommit: execFileSync("git", ["-C", source, "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  hotelCount: hotels.length,
  tourCount: tours.length,
  imageCount: assetMap.size - missing.length,
  note: "Catalogue snapshot, not a live price or availability feed. Original descriptions preserved. Original prices and ratings are retained only in source snapshots, not shown as current offers.",
  images: Object.fromEntries(assetMap),
  missing,
};
await fs.writeFile(
  "docs/source/import-manifest.json",
  JSON.stringify(provenance, null, 2),
);
console.log(
  JSON.stringify({
    hotels: hotels.length,
    tours: tours.length,
    images: provenance.imageCount,
    missing: missing.length,
  }),
);
