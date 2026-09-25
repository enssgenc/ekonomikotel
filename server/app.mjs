import { publicExtensions, adminExtensions } from "./extensions.mjs";
import express from "express";
import { randomUUID } from "node:crypto";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";
import { authentication, passwordHash, passwordMatches } from "./auth.mjs";
import { HttpError, validateContent } from "./validation.mjs";

const cleanQuery = (value) =>
  typeof value === "string" ? value.slice(0, 200) : "";
const pageNumber = (value) =>
  Math.max(1, Math.min(10000, parseInt(value, 10) || 1));
const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const jsonForHtml = (value) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
export function createApp({
  store,
  backups,
  origin = "http://127.0.0.1:4173",
  secure = false,
  dist = resolve("dist"),
  render,
  trustProxy = false,
}) {
  const app = express();
  app.disable("x-powered-by");
  if (trustProxy) app.set("trust proxy", 1);
  const auth = authentication(store, { origin, secure });
  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    });
    if (secure) res.set("Strict-Transport-Security", "max-age=31536000");
    res.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'",
    );
    if (req.path.startsWith("/admin") || req.path.startsWith("/api/admin"))
      res.set({
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      });
    next();
  });
  app.get("/api/health", (req, res) => {
    store.db.prepare("SELECT 1").get();
    res.json({ ok: true });
  });
  app.get("/api/catalog", (req, res) =>
    res.set("Cache-Control", "no-store").json(store.catalog()),
  );
  publicExtensions(app, store, origin);
  app.use("/api/admin", express.json({ limit: "1mb" }));
  app.post("/api/admin/login", auth.sameOrigin, auth.login);
  app.use("/api/admin", auth.requireSession);
  app.use("/api/admin", (req, res, next) =>
    ["GET", "HEAD"].includes(req.method)
      ? next()
      : auth.sameOrigin(req, res, () => auth.csrf(req, res, next)),
  );
  app.get("/api/admin/session", (req, res) =>
    res.json({
      user: { username: req.session.username, name: req.session.name },
      csrf: req.session.csrf,
    }),
  );
  app.post("/api/admin/logout", (req, res) => {
    store.db
      .prepare("DELETE FROM sessions WHERE token_hash=?")
      .run(req.session.token_hash);
    auth.clear(res);
    res.json({ ok: true });
  });
  app.get("/api/admin/dashboard", (req, res) => {
    const counts = store.db
      .prepare(
        "SELECT kind,status,COUNT(*) AS count FROM content GROUP BY kind,status",
      )
      .all();
    const recent = store.db
      .prepare(
        "SELECT id,kind,title,status,updated_at FROM content ORDER BY updated_at DESC LIMIT 6",
      )
      .all();
    const media = store.db
      .prepare("SELECT COUNT(*) AS count FROM media")
      .get().count;
    res.json({ counts, recent, media, amenities: store.catalog().amenities });
  });
  app.get("/api/admin/content", (req, res) => {
    const kind = cleanQuery(req.query.kind),
      status = cleanQuery(req.query.status),
      q = cleanQuery(req.query.q),
      page = pageNumber(req.query.page);
    const where = ["1=1"],
      args = [];
    if (kind) {
      where.push("kind=?");
      args.push(kind);
    }
    if (status) {
      where.push("status=?");
      args.push(status);
    }
    if (q) {
      where.push("(title LIKE ? OR slug LIKE ?)");
      args.push(`%${q}%`, `%${q}%`);
    }
    const clause = where.join(" AND ");
    const total = store.db
      .prepare(`SELECT COUNT(*) AS count FROM content WHERE ${clause}`)
      .get(...args).count;
    const items = store.db
      .prepare(
        `SELECT * FROM content WHERE ${clause} ORDER BY updated_at DESC,id LIMIT 15 OFFSET ?`,
      )
      .all(...args, (page - 1) * 15)
      .map((row) => {
        const data = JSON.parse(row.data);
        return {
          id: row.id,
          kind: row.kind,
          title: row.title,
          slug: row.slug,
          status: row.status,
          version: row.version,
          updatedAt: row.updated_at,
          img: data.img,
          city: data.district || data.city,
          featured: data.featured,
        };
      });
    res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / 15)) });
  });
  app.get("/api/admin/content/:id", (req, res) => {
    const record = store.get(req.params.id);
    if (!record) throw new HttpError(404, "İçerik bulunamadı.");
    res.json(record);
  });
  app.post("/api/admin/content", (req, res) => {
    const { kind, status } = req.body || {};
    const data = validateContent(store, kind, req.body || {}),
      id = randomUUID(),
      now = new Date().toISOString();
    const title = data.name || data.title;
    if (
      store.db
        .prepare("SELECT 1 FROM content WHERE kind=? AND slug=?")
        .get(kind, data.slug)
    )
      throw new HttpError(
        409,
        "Bu sayfa adresi kullanılıyor. Farklı bir adres girin.",
      );
    store.transaction(() => {
      store.db
        .prepare(
          "INSERT INTO content(id,kind,slug,title,status,data,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
        )
        .run(
          id,
          kind,
          data.slug,
          title,
          status,
          JSON.stringify(data),
          now,
          now,
        );
      store.audit(req.session.username, `content.create.${status}`, title);
    });
    res.status(201).json(store.get(id));
  });
  app.put("/api/admin/content/:id", (req, res) => {
    const record = store.get(req.params.id);
    if (!record) throw new HttpError(404, "İçerik bulunamadı.");
    if (req.body.version !== record.version)
      throw new HttpError(
        409,
        "Bu kayıt başka bir sekmede değişti. Sayfayı yenileyip son sürümü alın.",
      );
    const data = validateContent(store, record.kind, req.body, record.data),
      title = data.name || data.title,
      now = new Date().toISOString();
    if (
      store.db
        .prepare("SELECT 1 FROM content WHERE kind=? AND slug=? AND id<>?")
        .get(record.kind, data.slug, record.id)
    )
      throw new HttpError(409, "Bu sayfa adresi kullanılıyor.");
    store.transaction(() => {
      store.db
        .prepare("INSERT INTO revisions VALUES(?,?,?,?,?,?,?)")
        .run(
          randomUUID(),
          record.id,
          record.version,
          JSON.stringify(record.data),
          record.status,
          req.session.username,
          now,
        );
      store.db
        .prepare(
          "UPDATE content SET slug=?,title=?,status=?,data=?,version=version+1,updated_at=? WHERE id=?",
        )
        .run(
          data.slug,
          title,
          req.body.status,
          JSON.stringify(data),
          now,
          record.id,
        );
      store.audit(
        req.session.username,
        `content.update.${req.body.status}`,
        title,
      );
    });
    res.json(store.get(record.id));
  });
  app.get("/api/admin/content/:id/revisions", (req, res) =>
    res.json({
      items: store.db
        .prepare(
          "SELECT id,version,status,actor,created_at FROM revisions WHERE content_id=? ORDER BY version DESC LIMIT 50",
        )
        .all(req.params.id),
    }),
  );
  app.get("/api/admin/content/:id/revisions/:revision", (req, res) => {
    const row = store.db
      .prepare("SELECT * FROM revisions WHERE content_id=? AND id=?")
      .get(req.params.id, req.params.revision);
    if (!row) throw new HttpError(404, "Sürüm bulunamadı.");
    res.json({ ...row, data: JSON.parse(row.data) });
  });
  app.get("/api/admin/media", (req, res) => {
    const q = cleanQuery(req.query.q),
      page = pageNumber(req.query.page),
      args = [`%${q}%`];
    const total = store.db
      .prepare("SELECT COUNT(*) AS count FROM media WHERE name LIKE ?")
      .get(...args).count;
    const items = store.db
      .prepare(
        "SELECT * FROM media WHERE name LIKE ? ORDER BY created_at DESC,id LIMIT 24 OFFSET ?",
      )
      .all(...args, (page - 1) * 24);
    res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / 24)) });
  });
  app.post(
    "/api/admin/media",
    express.raw({
      type: ["image/jpeg", "image/png", "image/webp"],
      limit: "12mb",
    }),
    async (req, res) => {
      if (!Buffer.isBuffer(req.body) || !req.body.length)
        throw new HttpError(
          415,
          "JPG, PNG veya WebP görseli seçin (en fazla 12 MB).",
        );
      const id = randomUUID(),
        path = `/uploads/${id}.webp`,
        target = join(store.directory, "uploads", `${id}.webp`);
      let output, info;
      try {
        const pipeline = sharp(req.body, {
          limitInputPixels: 40000000,
          animated: false,
        }).rotate();
        const metadata = await pipeline.metadata();
        if (!["jpeg", "png", "webp"].includes(metadata.format))
          throw new Error("format");
        ({ data: output, info } = await pipeline
          .resize({
            width: 1800,
            height: 1800,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 84 })
          .toBuffer({ resolveWithObject: true }));
      } catch {
        throw new HttpError(
          422,
          "Bu görsel işlenemedi. Geçerli bir JPG, PNG veya WebP seçin.",
        );
      }
      let name;
      try {
        name = decodeURIComponent(
          req.get("x-file-name") || "Yeni görsel",
        ).slice(0, 180);
      } catch {
        throw new HttpError(400, "Dosya adı okunamadı.");
      }
      await writeFile(target, output, { flag: "wx" });
      try {
        store.transaction(() => {
          store.db
            .prepare("INSERT INTO media VALUES(?,?,?,?,?,?,?,?)")
            .run(
              id,
              path,
              name,
              info.width,
              info.height,
              output.length,
              "upload",
              new Date().toISOString(),
            );
          store.audit(req.session.username, "media.upload", name);
        });
      } catch (error) {
        await unlink(target);
        throw error;
      }
      res.status(201).json({
        id,
        path,
        name,
        width: info.width,
        height: info.height,
        bytes: output.length,
      });
    },
  );
  app.get("/api/admin/audit", (req, res) => {
    const page = pageNumber(req.query.page),
      total = store.db
        .prepare("SELECT COUNT(*) AS count FROM audit")
        .get().count;
    res.json({
      items: store.db
        .prepare("SELECT * FROM audit ORDER BY id DESC LIMIT 25 OFFSET ?")
        .all((page - 1) * 25),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / 25)),
    });
  });
  app.get("/api/admin/export", (req, res) => {
    const items = store.db
      .prepare("SELECT * FROM content ORDER BY kind,title")
      .all()
      .map((row) => store.get(row.id));
    res
      .attachment(
        `ekonomikotel-katalog-${new Date().toISOString().slice(0, 10)}.json`,
      )
      .json({
        format: "ekonomikotel-catalog-v1",
        exportedAt: new Date().toISOString(),
        items,
        media: store.db.prepare("SELECT * FROM media").all(),
      });
  });
  app.put("/api/admin/account", async (req, res) => {
    const name = String(req.body.name || "").trim();
    if (name.length < 2 || name.length > 100)
      throw new HttpError(422, "Ad 2–100 karakter olmalı.");
    const user = store.db
      .prepare("SELECT * FROM users WHERE id=?")
      .get(req.session.user_id);
    if (!(await passwordMatches(req.body.currentPassword, user.password_hash)))
      throw new HttpError(422, "Mevcut şifre hatalı.");
    const hash = req.body.newPassword
      ? await passwordHash(req.body.newPassword)
      : user.password_hash;
    store.transaction(() => {
      store.db
        .prepare("UPDATE users SET name=?,password_hash=? WHERE id=?")
        .run(name, hash, user.id);
      store.db.prepare("DELETE FROM sessions WHERE user_id=?").run(user.id);
      store.audit(
        user.username,
        "account.update",
        "Yönetici hesabı güncellendi",
      );
    });
    auth.clear(res);
    res.json({ ok: true, relogin: true });
  });
  adminExtensions(app, store, backups);
  app.use("/api", (req, res) =>
    res.status(404).json({ error: "Uç nokta bulunamadı." }),
  );
  app.use(
    "/uploads",
    express.static(join(store.directory, "uploads"), {
      maxAge: "7d",
      immutable: true,
      index: false,
      dotfiles: "deny",
    }),
  );
  if (existsSync(dist)) {
    app.use(
      "/saglik-turizmi",
      express.static(join(dist, "saglik-turizmi"), { maxAge: 0 }),
    );
    for (const folder of ["assets", "media", "fonts"])
      app.use(
        `/${folder}`,
        express.static(join(dist, folder), {
          maxAge: folder === "assets" ? "1y" : "7d",
          immutable: folder === "assets",
          index: false,
          dotfiles: "deny",
        }),
      );
    app.get("/favicon.svg", (req, res) =>
      res.sendFile(join(dist, "favicon.svg")),
    );
    app.get("/robots.txt", (req, res) =>
      res
        .type("text")
        .send(
          `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\nSitemap: ${origin}/sitemap.xml\n`,
        ),
    );
    app.get("/sitemap.xml", (req, res) => {
      const data = store.catalog();
      const paths = [
        "/",
        "/oteller/",
        "/turlar/",
        "/rehber/",
        "/iletisim/",
        ...data.hotels.map((h) => `/oteller/${h.slug}/`),
        ...data.tours.map((t) => `/turlar/${t.slug}/`),
      ];
      res
        .type("xml")
        .send(
          `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${escape(origin + p)}</loc></url>`).join("")}</urlset>`,
        );
    });
    app.get(/^\/admin(?:\/.*)?$/, (req, res) =>
      res.sendFile(join(dist, "admin.html")),
    );
    app.get(/.*/, async (req, res) => {
      if (!render)
        throw new HttpError(503, "Önce üretim derlemesini oluşturun.");
      let pathname = req.path.replace(/\/$/, "") || "/";
      const previewId = cleanQuery(req.query.onizleme);
      if (previewId && !auth.session(req)) return res.redirect("/admin/giris");
      const preview = previewId ? store.get(previewId) : null;
      if (previewId && !preview)
        return res.status(404).type("text").send("Önizleme bulunamadı.");
      const data = store.catalog(previewId);
      const hotel = data.hotels.find((h) => pathname === `/oteller/${h.slug}`),
        tour = data.tours.find((t) => pathname === `/turlar/${t.slug}`);
      const titles = {
        "/": "Kapadokya Otelleri ve Tatil Paketleri",
        "/oteller": "Oteller",
        "/turlar": "Turlar ve Tatil Paketleri",
        "/rehber": "Kapadokya Rehberi",
        "/iletisim": "İletişim",
        "/favoriler": "Favorilerim",
        "/gorsel-kaynaklari": "Görsel Kaynakları",
      };
      const found = !!(titles[pathname] || hotel || tour),
        item = hotel || tour;
      const title =
        item?.seoTitle ||
        item?.name ||
        item?.title ||
        titles[pathname] ||
        "Sayfa bulunamadı";
      const description =
        item?.seoDescription ||
        hotel?.blurb ||
        tour?.shortDesc ||
        "Ekonomikotel ile otelleri ve tatil paketlerini keşfedin.";
      let html = await readFile(join(dist, "shell.html"), "utf8");
      html = html
        .replace(
          '<div id="root"></div>',
          `<div id="root">${render(found ? req.originalUrl : "/404", data)}</div><script type="application/json" id="catalog-data">${jsonForHtml(data)}</script>`,
        )
        .replace(
          /<title>.*?<\/title>/,
          `<title>${escape(title)} | Ekonomikotel</title>`,
        )
        .replace(
          /(<meta name="description" content=")[^"]*/,
          (_, prefix) => prefix + escape(description.slice(0, 180)),
        )
        .replace(
          /(<meta property="og:title" content=")[^"]*/,
          (_, prefix) => prefix + escape(title),
        )
        .replace(
          /(<meta property="og:description" content=")[^"]*/,
          (_, prefix) => prefix + escape(description.slice(0, 180)),
        )
        .replace(
          /(<link rel="canonical" href=")[^"]*/,
          (_, prefix) =>
            prefix + escape(origin + (pathname === "/" ? "/" : pathname + "/")),
        );
      if (previewId || !found || pathname === "/favoriler")
        html = html.replace(
          'content="index,follow"',
          'content="noindex,nofollow"',
        );
      res
        .status(found ? 200 : 404)
        .set("Cache-Control", "no-store")
        .type("html")
        .send(html);
    });
  }
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.status || 500;
    if (status >= 500) console.error("Request failed:", error.message);
    res.status(status).json({
      error:
        status === 413
          ? "Dosya veya içerik çok büyük."
          : status >= 500
            ? "İşlem tamamlanamadı. Lütfen tekrar deneyin."
            : error.message,
      fields: error.fields,
    });
  });
  return app;
}
