import fs from "node:fs/promises";
import assert from "node:assert/strict";
const data = JSON.parse(await fs.readFile("src/data/catalog.json", "utf8"));
const source = JSON.parse(
  await fs.readFile("docs/source/hotels-original.json", "utf8"),
);
assert.equal(data.hotels.length, source.length);
assert.equal(new Set(data.hotels.map((h) => h.slug)).size, source.length);
for (const original of source) {
  const hotel = data.hotels.find((h) => h.slug === original.slug);
  for (const key of [
    "name",
    "district",
    "city",
    "blurb",
    "longBlurb",
    "address",
    "concept",
    "amenities",
  ])
    assert.deepEqual(hotel[key], original[key], `${hotel.slug} ${key}`);
  assert(!("price" in hotel));
  assert(!("rating" in hotel));
  assert.equal(
    hotel.gallery.length,
    new Set([original.img, ...original.gallery]).size,
  );
  for (const img of hotel.gallery) await fs.access(`public${img}`);
}
for (const tour of data.tours) {
  assert(!("price" in tour));
  assert(tour.itinerary.length > 0);
  for (const img of tour.gallery) await fs.access(`public${img}`);
}
await fs.access("public/saglik-turizmi/index.html");
console.log(
  `PASS: ${data.hotels.length} hotels preserve source text and every gallery image; ${data.tours.length} tours; no stale live-price/ratings claims; health page present.`,
);
