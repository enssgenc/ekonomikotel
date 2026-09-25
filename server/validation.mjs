import { z } from "zod";
export class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
const text = (max = 5000) => z.string().trim().max(max).default("");
const list = (max = 100) =>
  z
    .array(z.string().trim().max(3000))
    .max(max)
    .default([])
    .transform((values) => values.filter(Boolean));
const image = z
  .string()
  .max(500)
  .regex(/^\/(?:media|uploads)\/[a-zA-Z0-9/_\-.]+$/)
  .or(z.literal(""));
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (value) =>
      !Number.isNaN(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value,
    "Geçerli tarih girin.",
  );
const url = z
  .string()
  .max(2000)
  .refine((value) => {
    if (!value) return true;
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Bağlantı https:// ile başlamalı.")
  .default("");
const common = {
  slug: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Adres yalnızca küçük harf, rakam ve tire içerebilir.",
    ),
  city: text(120),
  img: image.default(""),
  gallery: z.array(image).max(60).default([]),
  featured: z.boolean().default(false),
  seoTitle: text(90),
  seoDescription: text(180),
  internalNotes: text(10000),
  priceMode: z.enum(["request", "from"]).default("request"),
  fromPrice: z.number().finite().min(0).max(10000000).default(0),
  currency: z.enum(["TRY", "EUR", "USD"]).default("TRY"),
  priceUnit: text(100),
  priceValidUntil: date.or(z.literal("")).default(""),
};
export const hotelSchema = z.object({
  ...common,
  name: z.string().trim().min(2).max(180),
  district: text(120),
  concept: text(120),
  address: text(1000),
  maps: url,
  blurb: text(3000),
  longBlurb: text(30000).nullable(),
  amenities: list(40),
  rooms: z
    .array(
      z.object({
        id: text(100),
        name: z.string().trim().min(2).max(150),
        capacity: z.number().int().min(1).max(20),
        concept: text(150),
        description: text(3000),
      }),
    )
    .max(30)
    .default([]),
});
export const tourSchema = z.object({
  ...common,
  title: z.string().trim().min(2).max(180),
  category: text(120),
  duration: text(120),
  transport: text(160),
  concept: text(160),
  shortDesc: text(5000),
  hotelBlurb: text(15000),
  includes: list(),
  excludes: list(),
  departureCity: text(160),
  departureDates: z.array(date).max(200).default([]),
  itinerary: z
    .array(
      z.object({
        day: z.number().int().min(1).max(365),
        title: text(300),
        text: text(15000),
      }),
    )
    .max(90)
    .default([]),
  terms: z
    .array(z.object({ title: text(300), items: list() }))
    .max(50)
    .default([]),
  tourRoutes: z
    .array(
      z.object({
        key: text(100),
        name: text(300),
        badge: text(300),
        isDefault: z.boolean().optional(),
        stops: list(),
      }),
    )
    .max(30)
    .default([]),
});
export function validateContent(store, kind, body, previous = {}) {
  if (!["hotel", "tour"].includes(kind))
    throw new HttpError(400, "Geçersiz içerik türü.");
  if (!["draft", "published", "archived"].includes(body.status))
    throw new HttpError(422, "Yayın durumunu seçin.");
  const parsed = (kind === "hotel" ? hotelSchema : tourSchema).safeParse(
    body.data,
  );
  if (!parsed.success)
    throw new HttpError(
      422,
      "Alanları kontrol edin.",
      parsed.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    );
  const data = { ...previous, ...parsed.data };
  data.gallery = [...new Set(data.gallery.filter(Boolean))];
  if (data.img && !data.gallery.includes(data.img))
    data.gallery.unshift(data.img);
  const fields = [];
  for (const path of data.gallery)
    if (!store.db.prepare("SELECT 1 FROM media WHERE path=?").get(path))
      fields.push({
        field: "gallery",
        message: "Görselleri kütüphaneden seçin veya yükleyin.",
      });
  if (kind === "hotel")
    for (const a of data.amenities)
      if (!Object.hasOwn(store.catalog().amenities, a))
        fields.push({ field: "amenities", message: "Geçersiz otel olanağı." });
  if (
    kind === "tour" &&
    new Set(data.itinerary.map((d) => d.day)).size !== data.itinerary.length
  )
    fields.push({
      field: "itinerary",
      message: "Her program gününün numarası farklı olmalı.",
    });
  if (body.status === "published") {
    if (!data.img)
      fields.push({
        field: "img",
        message: "Yayınlamak için kapak görseli seçin.",
      });
    if (!data.city) fields.push({ field: "city", message: "Şehir girin." });
    if ((kind === "hotel" ? data.blurb : data.shortDesc).length < 20)
      fields.push({
        field: kind === "hotel" ? "blurb" : "shortDesc",
        message: "En az 20 karakterlik açıklama girin.",
      });
    if (kind === "hotel" && !data.district)
      fields.push({ field: "district", message: "Bölge girin." });
    if (
      kind === "tour" &&
      (!data.duration ||
        !data.itinerary.length ||
        data.itinerary.some((d) => !d.title || !d.text))
    )
      fields.push({
        field: "itinerary",
        message: "Tur süresini ve her günün başlık/açıklamasını tamamlayın.",
      });
    if (
      data.priceMode === "from" &&
      (!data.fromPrice ||
        !data.priceUnit ||
        !data.priceValidUntil ||
        data.priceValidUntil < new Date().toISOString().slice(0, 10))
    )
      fields.push({
        field: "fromPrice",
        message: "Fiyat, fiyat birimi ve geçerli son tarih girin.",
      });
  }
  if (fields.length)
    throw new HttpError(
      422,
      "Yayınlamadan önce eksik alanları tamamlayın.",
      fields,
    );
  return data;
}
