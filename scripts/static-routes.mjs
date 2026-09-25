import { readFile, writeFile, mkdir } from "node:fs/promises";
import { render } from "../.ssr/entry-server.js";
const data = JSON.parse(await readFile("src/data/catalog.json", "utf8"));
const template = await readFile("dist/index.html", "utf8");
const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const routes = [
  [
    "/",
    "Kapadokya Otelleri ve Tatil Paketleri",
    "Kapadokya otellerini keşfedin, tatil paketlerini karşılaştırın. Ekonomikotel ile tatilinizi planlayın.",
  ],
  [
    "/oteller",
    "Kapadokya Otelleri",
    "Kapadokya otellerini bölge ve olanaklarına göre karşılaştırın, fotoğraflarını inceleyin.",
  ],
  [
    "/turlar",
    "Kapadokya Tatil Paketleri",
    "Kapadokya 2 gece ve 3 gece konaklamalı tatil paketleri, tur programları ve deneyimler.",
  ],
  [
    "/rehber",
    "Kapadokya Rehberi",
    "Göreme, Ürgüp, Uçhisar ve Avanos: Kapadokya konaklamanızı ve tur programınızı keşfedin.",
  ],
  [
    "/iletisim",
    "İletişim",
    "Ekonomikotel otel ve tur fiyat talepleri için iletişim bilgileri.",
  ],
  [
    "/gorsel-kaynaklari",
    "Görsel Kaynakları",
    "Ekonomikotel görsel atıfları ve lisansları.",
  ],
  [
    "/favoriler",
    "Favori Otellerim",
    "Kaydettiğiniz favori Kapadokya otelleri.",
  ],
  ...data.hotels.map((h) => [`/oteller/${h.slug}`, h.name, h.blurb]),
  ...data.tours.map((t) => [`/turlar/${t.slug}`, t.title, t.shortDesc]),
];
for (const [url, title, description] of [
  ...routes,
  ["/404", "Sayfa Bulunamadı", "Aradığınız sayfa bulunamadı."],
]) {
  let html = template
    .replace('<div id="root"></div>', `<div id="root">${render(url)}</div>`)
    .replace(
      /<title>.*?<\/title>/,
      `<title>${escape(title)} | Ekonomikotel</title>`,
    )
    .replace(
      /(<meta name="description" content=")[^"]*/,
      `$1${escape(description.slice(0, 170))}`,
    )
    .replace(
      /(<link rel="canonical" href=")[^"]*/,
      `$1https://ekonomikotel.com${url === "/" ? "/" : url + "/"}`,
    )
    .replace(
      /(<meta property="og:title" content=")[^"]*/,
      `$1${escape(title)} | Ekonomikotel`,
    )
    .replace(
      /(<meta property="og:description" content=")[^"]*/,
      `$1${escape(description.slice(0, 170))}`,
    );
  if (url === "/favoriler" || url === "/404")
    html = html.replace('content="index,follow"', 'content="noindex,follow"');
  const dir = url === "/" ? "dist" : `dist${url}`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/index.html`, html);
  if (url === "/404") await writeFile("dist/404.html", html);
}
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes
    .filter(([p]) => p !== "/favoriler")
    .map(
      ([p]) =>
        `<url><loc>https://ekonomikotel.com${p === "/" ? "/" : p + "/"}</loc></url>`,
    )
    .join("")}</urlset>`,
);
console.log(
  `Prerendered ${routes.length} routes plus 404 with page content, metadata and sitemap.`,
);
