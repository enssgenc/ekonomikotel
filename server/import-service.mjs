import { Worker } from "node:worker_threads";
import ExcelJS from "exceljs";
import { HttpError, validateContent } from "./validation.mjs";
export const columns = [
  "tur",
  "ad",
  "sayfa_adresi",
  "sehir",
  "bolge",
  "kisa_aciklama",
  "detayli_aciklama",
  "konsept",
  "sure",
  "ulasim",
  "kapak",
  "galeri",
  "olanaklar",
  "dahil",
  "haric",
  "program",
];
export async function importTemplate() {
  const book = new ExcelJS.Workbook(),
    sheet = book.addWorksheet("Icerikler");
  sheet.addRow(columns);
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  for (const c of sheet.columns) c.width = 24;
  const info = book.addWorksheet("Aciklama");
  for (const line of [
    "İlk sayfaya en fazla 200 kayıt ekleyin. Zorunlu sütunlar: tur, ad, sayfa_adresi.",
    "tur: hotel veya tour. Bütün kayıtlar taslak oluşturulur. Var olan adreslerin üzerine yazılmaz.",
    "kapak/galeri: kütüphanedeki /media/... veya /uploads/... yolları. Galeri ve liste alanları | ile ayrılır.",
    'program: JSON dizisi; örnek [{"day":1,"title":"Varış","text":"Program açıklaması"}]',
    "Fiyat dönemleri ve oda detayları içe aktarımdan sonra panelden tanımlanır. Formül kullanmayın.",
  ])
    info.addRow([line]);
  info.getColumn(1).width = 120;
  return book.xlsx.writeBuffer();
}
export async function parseWorkbook(buffer, store) {
  const result = await new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./import-worker.mjs", import.meta.url), {
      workerData: buffer,
      resourceLimits: { maxOldGenerationSizeMb: 128 },
    });
    const timer = setTimeout(() => {
      void worker.terminate();
      reject(
        new HttpError(
          422,
          "Dosya işleme süresi aşıldı. Daha küçük bir dosya seçin.",
        ),
      );
    }, 15000);
    worker.once("message", (r) => {
      clearTimeout(timer);
      void worker.terminate();
      resolve(r);
    });
    worker.once("error", () => {
      clearTimeout(timer);
      reject(new HttpError(422, "Excel dosyası işlenemedi. Şablonu kullanın."));
    });
    worker.once("exit", (code) => {
      clearTimeout(timer);
      if (code !== 0) reject(new HttpError(422, "Excel dosyası işlenemedi."));
    });
  });
  if (result.error) throw new HttpError(422, result.error);
  const header = result.rows.shift();
  if (
    !header ||
    !["tur", "ad", "sayfa_adresi"].every((k) => header.values.includes(k)) ||
    new Set(header.values).size !== header.values.length
  )
    throw new HttpError(
      422,
      "Şablon sütunlarını kullanın; zorunlu sütunlar eksik veya tekrarlı.",
    );
  const seen = new Set();
  return result.rows
    .filter((r) => r.values.some(Boolean))
    .map((row) => {
      const fields = Object.fromEntries(
        header.values.map((h, i) => [h, row.values[i] || ""]),
      );
      let data,
        error = "";
      try {
        const kind = fields.tur,
          list = (k) =>
            (fields[k] || "")
              .split("|")
              .map((v) => v.trim())
              .filter(Boolean);
        const raw = {
          slug: fields.sayfa_adresi,
          city: fields.sehir,
          concept: fields.konsept,
          img: fields.kapak,
          gallery: list("galeri"),
        };
        Object.assign(
          raw,
          kind === "hotel"
            ? {
                name: fields.ad,
                district: fields.bolge,
                blurb: fields.kisa_aciklama,
                longBlurb: fields.detayli_aciklama,
                amenities: list("olanaklar"),
              }
            : {
                title: fields.ad,
                shortDesc: fields.kisa_aciklama,
                hotelBlurb: fields.detayli_aciklama,
                duration: fields.sure,
                transport: fields.ulasim,
                includes: list("dahil"),
                excludes: list("haric"),
                itinerary: fields.program ? JSON.parse(fields.program) : [],
              },
        );
        data = validateContent(store, kind, { status: "draft", data: raw });
        const key = kind + ":" + data.slug;
        if (
          seen.has(key) ||
          store.db
            .prepare("SELECT 1 FROM content WHERE kind=? AND slug=?")
            .get(kind, data.slug)
        )
          throw new Error(
            "Bu sayfa adresi zaten var veya dosyada tekrarlanıyor.",
          );
        seen.add(key);
      } catch (e) {
        error =
          e.fields?.map((f) => `${f.field}: ${f.message}`).join(" · ") ||
          e.message;
      }
      return {
        row: row.index,
        kind: fields.tur,
        title: fields.ad,
        slug: fields.sayfa_adresi,
        data,
        error,
      };
    });
}
