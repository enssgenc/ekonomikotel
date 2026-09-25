import express from "express";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { z } from "zod";
import { HttpError, validateContent } from "./validation.mjs";
import { calculateStay, validDate } from "../src/lib/pricing.js";
import { defaultHomepage } from "../src/lib/homepage.js";
import { parseWorkbook, importTemplate } from "./import-service.mjs";
const now = () => new Date().toISOString();
const parse = (schema, input) => {
  const result = schema.safeParse(input);
  if (!result.success)
    throw new HttpError(
      422,
      "Alanları kontrol edin.",
      result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    );
  return result.data;
};
const text = (n = 1000) => z.string().trim().max(n).default("");
const day = z
  .string()
  .refine((v) => !v || validDate(v), "Geçerli tarih girin.")
  .default("");
const nonempty = (n = 150) => z.string().trim().min(2).max(n);
const uuid = z.string().uuid();
function addContent(store, kind, data, actor) {
  const id = randomUUID(),
    time = now();
  store.db
    .prepare(
      "INSERT INTO content(id,kind,slug,title,status,data,created_at,updated_at) VALUES(?,?,?,?,'draft',?,?,?)",
    )
    .run(
      id,
      kind,
      data.slug,
      data.name || data.title,
      JSON.stringify(data),
      time,
      time,
    );
  store.audit(actor, "content.create.draft", data.name || data.title);
  return store.get(id);
}
function revision(store, record, status, actor) {
  const time = now();
  store.db
    .prepare("INSERT INTO revisions VALUES(?,?,?,?,?,?,?)")
    .run(
      randomUUID(),
      record.id,
      record.version,
      JSON.stringify(record.data),
      record.status,
      actor,
      time,
    );
  store.db
    .prepare(
      "UPDATE content SET status=?,version=version+1,updated_at=? WHERE id=?",
    )
    .run(status, time, record.id);
  store.audit(
    actor,
    `content.update.${status}`,
    record.data.name || record.data.title,
  );
}
const leadSchema = z.object({
  kind: z.enum(["hotel", "tour"]),
  slug: z.string().min(3).max(120),
  name: nonempty(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d ()-]{7,25}$/, "Telefon numarasını kontrol edin."),
  email: z.string().email().max(180).or(z.literal("")).default(""),
  message: text(4000),
  start: day,
  end: day,
  adults: z.number().int().min(1).max(20),
  childAges: z.array(z.number().int().min(0).max(17)).max(10).default([]),
  roomId: text(100),
  consent: z.literal(true),
  website: z.string().max(200).default(""),
  requestId: uuid,
});
function limited(store, req, bucket, max = 5) {
  const key =
      bucket +
      createHash("sha256")
        .update(req.ip || "local")
        .digest("hex"),
    time = Date.now();
  store.db.prepare("DELETE FROM public_limits WHERE reset_at<=?").run(time);
  const row = store.db
    .prepare("SELECT * FROM public_limits WHERE key=?")
    .get(key);
  if (row?.count >= max)
    throw new HttpError(
      429,
      "Çok fazla istek gönderildi. Bir süre sonra tekrar deneyin.",
    );
  store.db
    .prepare(
      "INSERT INTO public_limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1",
    )
    .run(key, time + 15 * 60000);
}
export function publicExtensions(app, store, origin) {
  const exactOrigin = (req, res, next) => {
    if (req.get("origin") !== origin)
      throw new HttpError(403, "İstek kaynağı doğrulanamadı.");
    next();
  };
  app.post(
    "/api/quote",
    express.json({ limit: "20kb" }),
    exactOrigin,
    (req, res) => {
      limited(store, req, "quote:", 100);
      const input = parse(
        z.object({
          slug: z.string().max(120),
          roomId: text(100),
          start: day,
          end: day,
          adults: z.number().int(),
          childAges: z.array(z.number().int()).max(10).default([]),
        }),
        req.body,
      );
      const hotel = store.catalog().hotels.find((h) => h.slug === input.slug);
      if (!hotel) throw new HttpError(404, "Otel bulunamadı.");
      res.set("Cache-Control", "no-store").json(calculateStay(hotel, input));
    },
  );
  app.post(
    "/api/inquiries",
    express.json({ limit: "20kb" }),
    exactOrigin,
    (req, res) => {
      const data = parse(leadSchema, req.body);
      if (data.website) throw new HttpError(422, "Talep gönderilemedi.");
      limited(store, req, "lead:");
      const old = store.db
        .prepare("SELECT reference FROM leads WHERE id=?")
        .get(data.requestId);
      if (old) return res.json({ reference: old.reference });
      if (
        (data.start || data.end) &&
        (!data.start ||
          !data.end ||
          data.start < now().slice(0, 10) ||
          data.end <= data.start)
      )
        throw new HttpError(422, "Geçerli bir tarih aralığı girin.");
      const content = store.db
        .prepare(
          "SELECT id,data FROM content WHERE kind=? AND slug=? AND status='published'",
        )
        .get(data.kind, data.slug);
      if (!content) throw new HttpError(404, "İçerik bulunamadı.");
      const item = JSON.parse(content.data);
      if (data.roomId && !item.rooms?.some((r) => r.id === data.roomId))
        throw new HttpError(422, "Oda tipi bulunamadı.");
      const quote =
        data.kind === "hotel" && data.roomId ? calculateStay(item, data) : null;
      const reference = "EKO-" + randomBytes(5).toString("hex").toUpperCase();
      const saved = {
        ...data,
        website: undefined,
        requestId: undefined,
        contentId: content.id,
        title: item.name || item.title,
        source: "website",
        consentAt: now(),
        quote,
        notes: "",
        offerAmount: 0,
        offerCurrency: "TRY",
        offerText: "",
        outcome: "",
      };
      store.db
        .prepare(
          "INSERT INTO leads(id,reference,status,data,created_at,updated_at) VALUES(?,?,'new',?,?,?)",
        )
        .run(data.requestId, reference, JSON.stringify(saved), now(), now());
      res.status(201).json({ reference });
    },
  );
}
export function adminExtensions(app, store, backups) {
  const prefix = "/api/admin";
  const getSetting = (key, defaults) => {
    const row = store.db.prepare("SELECT * FROM settings WHERE key=?").get(key);
    return {
      data: row ? JSON.parse(row.data) : defaults,
      version: row?.version || 0,
    };
  };
  const saveSetting = (key, data, version, actor) => {
    const current = getSetting(key, {});
    if (version !== current.version)
      throw new HttpError(409, "Ayarlar başka bir sekmede değişti. Yenileyin.");
    store.db
      .prepare(
        "INSERT INTO settings VALUES(?,?,1,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data,version=settings.version+1,updated_at=excluded.updated_at",
      )
      .run(key, JSON.stringify(data), now());
    store.audit(actor, "settings.update", key);
    return getSetting(key, {});
  };
  app.get(prefix + "/choices", (req, res) =>
    res.json({
      items: store.db
        .prepare(
          "SELECT id,kind,slug,title,status,version FROM content ORDER BY title",
        )
        .all(),
    }),
  );
  app.post(prefix + "/content/:id/duplicate", (req, res) => {
    const record = store.get(req.params.id);
    if (!record) throw new HttpError(404, "İçerik bulunamadı.");
    const data = structuredClone(record.data);
    data.slug =
      data.slug.slice(0, 90) + "-kopya-" + randomBytes(4).toString("hex");
    data[record.kind === "hotel" ? "name" : "title"] =
      (data.name || data.title).slice(0, 165) + " (Kopya)";
    data.featured = false;
    data.internalNotes = "";
    const copy = store.transaction(() =>
      addContent(store, record.kind, data, req.session.username),
    );
    res.status(201).json(copy);
  });
  app.post(prefix + "/bulk-status", (req, res) => {
    const body = parse(
      z.object({
        items: z
          .array(z.object({ id: uuid, version: z.number().int().positive() }))
          .min(1)
          .max(100),
        status: z.enum(["draft", "published", "archived"]),
      }),
      req.body,
    );
    if (new Set(body.items.map((i) => i.id)).size !== body.items.length)
      throw new HttpError(422, "Tekrarlı kayıt seçilemez.");
    const records = body.items.map((i) => {
      const r = store.get(i.id);
      if (!r) throw new HttpError(404, "İçerik bulunamadı.");
      if (r.version !== i.version)
        throw new HttpError(
          409,
          "Seçili kayıtlardan biri değişti. Listeyi yenileyin.",
        );
      validateContent(store, r.kind, { ...r, status: body.status }, r.data);
      return r;
    });
    store.transaction(() => {
      for (const r of records)
        if (r.status !== body.status)
          revision(store, r, body.status, req.session.username);
    });
    res.json({ count: records.length });
  });
  app.get(prefix + "/autosaves/:key", (req, res) => {
    const row = store.db
      .prepare("SELECT * FROM autosaves WHERE user_id=? AND key=?")
      .get(req.session.user_id, req.params.key);
    res.json(
      row
        ? {
            data: JSON.parse(row.data),
            version: row.version,
            updatedAt: row.updated_at,
          }
        : { data: null, version: 0 },
    );
  });
  app.put(prefix + "/autosaves/:key", (req, res) => {
    const { key } = req.params;
    const body = parse(
      z.object({
        version: z.number().int().min(0),
        record: z.object({
          kind: z.enum(["hotel", "tour"]),
          version: z.number().int().min(0),
          status: z.enum(["draft", "published", "archived"]),
          data: z.record(z.string(), z.unknown()),
        }),
      }),
      req.body,
    );
    if (
      !["new-hotel", "new-tour"].includes(key) &&
      !z.string().uuid().safeParse(key).success
    )
      throw new HttpError(422, "Geçersiz taslak adresi.");
    if (key.startsWith("new-") && key !== `new-${body.record.kind}`)
      throw new HttpError(422, "Taslak türü uyuşmuyor.");
    if (!key.startsWith("new-")) {
      const r = store.get(key);
      if (
        !r ||
        r.kind !== body.record.kind ||
        r.version !== body.record.version
      )
        throw new HttpError(
          409,
          "Asıl kayıt değişti. Sayfayı yenileyip taslağınızı kontrol edin.",
        );
    }
    const current = store.db
      .prepare("SELECT version FROM autosaves WHERE user_id=? AND key=?")
      .get(req.session.user_id, key);
    if ((current?.version || 0) !== body.version)
      throw new HttpError(
        409,
        "Taslak başka bir sekmede değişti. Yenileyip son taslağı inceleyin.",
      );
    const time = now();
    store.db
      .prepare(
        "INSERT INTO autosaves VALUES(?,?,?,1,?) ON CONFLICT(user_id,key) DO UPDATE SET data=excluded.data,version=autosaves.version+1,updated_at=excluded.updated_at",
      )
      .run(req.session.user_id, key, JSON.stringify(body.record), time);
    res.json({ version: body.version + 1, updatedAt: time });
  });
  app.delete(prefix + "/autosaves/:key", (req, res) => {
    const version = Number(req.body?.version);
    const row = store.db
      .prepare("SELECT version FROM autosaves WHERE user_id=? AND key=?")
      .get(req.session.user_id, req.params.key);
    if (row && row.version !== version)
      throw new HttpError(409, "Taslak değişti. Sayfayı yenileyin.");
    store.db
      .prepare("DELETE FROM autosaves WHERE user_id=? AND key=?")
      .run(req.session.user_id, req.params.key);
    res.json({ ok: true });
  });
  const campaign = z.object({
    id: nonempty(100),
    title: nonempty(120),
    description: text(400),
    image: nonempty(500),
    link: nonempty(300),
    label: nonempty(80),
    enabled: z.boolean(),
    start: day,
    end: day,
  });
  const homeSchema = z.object({
    eyebrow: text(100),
    title: nonempty(100),
    accent: text(100),
    description: text(500),
    image: nonempty(500),
    imageAlt: nonempty(180),
    link: nonempty(300),
    linkLabel: nonempty(80),
    hotelSlugs: z.array(z.string().max(120)).max(12),
    tourSlugs: z.array(z.string().max(120)).max(12),
    campaigns: z.array(campaign).max(6),
  });
  app.get(prefix + "/homepage", (req, res) =>
    res.json(getSetting("homepage", defaultHomepage)),
  );
  app.put(prefix + "/homepage", (req, res) => {
    const data = parse(homeSchema, req.body.data);
    if (new Set(data.campaigns.map((c) => c.id)).size !== data.campaigns.length)
      throw new HttpError(422, "Kampanya kimlikleri tekrarlanamaz.");
    const validLink = (link) =>
      [
        "/",
        "/oteller",
        "/turlar",
        "/rehber",
        "/iletisim",
        "/saglik-turizmi/",
      ].includes(link) ||
      !!store.db
        .prepare(
          "SELECT 1 FROM content WHERE status='published' AND (CASE kind WHEN 'hotel' THEN '/oteller/' ELSE '/turlar/' END)||slug=?",
        )
        .get(link);
    if (
      !validLink(data.link) ||
      data.campaigns.some(
        (c) => !validLink(c.link) || (c.start && c.end && c.start > c.end),
      )
    )
      throw new HttpError(
        422,
        "Bağlantıları ve kampanya tarihlerini kontrol edin.",
      );
    for (const path of [data.image, ...data.campaigns.map((c) => c.image)])
      if (!store.db.prepare("SELECT 1 FROM media WHERE path=?").get(path))
        throw new HttpError(422, "Görselleri kütüphaneden seçin.");
    for (const [kind, slugs] of [
      ["hotel", data.hotelSlugs],
      ["tour", data.tourSlugs],
    ]) {
      if (new Set(slugs).size !== slugs.length)
        throw new HttpError(422, "Vitrin kayıtları tekrarlanamaz.");
      for (const slug of slugs)
        if (
          !store.db
            .prepare(
              "SELECT 1 FROM content WHERE kind=? AND slug=? AND status='published'",
            )
            .get(kind, slug)
        )
          throw new HttpError(
            422,
            "Vitrin için yalnızca yayındaki kayıtları seçin.",
          );
    }
    res.json(
      saveSetting("homepage", data, req.body.version, req.session.username),
    );
  });
  app.get(prefix + "/import-template", async (req, res) =>
    res
      .attachment("ekonomikotel-icerik-sablonu.xlsx")
      .send(Buffer.from(await importTemplate())),
  );
  app.post(
    prefix + "/imports/preview",
    express.raw({ type: "application/octet-stream", limit: "2mb" }),
    async (req, res) => {
      if (!Buffer.isBuffer(req.body))
        throw new HttpError(415, "Excel .xlsx dosyasını seçin.");
      const rows = await parseWorkbook(req.body, store);
      if (!rows.length) throw new HttpError(422, "Dosyada içerik bulunamadı.");
      const id = randomUUID();
      store.db
        .prepare(
          "INSERT INTO imports(id,user_id,data,created_at) VALUES(?,?,?,?)",
        )
        .run(id, req.session.user_id, JSON.stringify({ rows }), now());
      res.json({ id, rows: rows.map(({ data, ...r }) => r) });
    },
  );
  app.post(prefix + "/imports/:id/commit", (req, res) => {
    const body = parse(
      z.object({ rows: z.array(z.number().int()).min(1).max(200) }),
      req.body,
    );
    if (new Set(body.rows).size !== body.rows.length)
      throw new HttpError(422, "Tekrarlı satır seçilemez.");
    const row = store.db
      .prepare("SELECT * FROM imports WHERE id=? AND user_id=?")
      .get(req.params.id, req.session.user_id);
    if (!row) throw new HttpError(404, "Önizleme bulunamadı.");
    const info = JSON.parse(row.data);
    if (row.consumed_at)
      return res.json({
        items: info.completedIds.map((id) => store.get(id)),
        alreadyImported: true,
      });
    if (Date.now() - Date.parse(row.created_at) > 1800000)
      throw new HttpError(
        410,
        "Önizleme süresi doldu. Dosyayı tekrar yükleyin.",
      );
    const selected = body.rows.map((n) => info.rows.find((r) => r.row === n));
    if (selected.some((r) => !r || r.error))
      throw new HttpError(422, "Yalnızca geçerli satırları seçin.");
    const items = store.transaction(() => {
      for (const r of selected) {
        validateContent(store, r.kind, { status: "draft", data: r.data });
        if (
          store.db
            .prepare("SELECT 1 FROM content WHERE kind=? AND slug=?")
            .get(r.kind, r.data.slug)
        )
          throw new HttpError(
            409,
            "Bir adres artık kullanılıyor. Dosyayı yeniden önizleyin.",
          );
      }
      const items = selected.map((r) =>
        addContent(store, r.kind, r.data, req.session.username),
      );
      info.completedIds = items.map((i) => i.id);
      store.db
        .prepare("UPDATE imports SET consumed_at=?,data=? WHERE id=?")
        .run(now(), JSON.stringify(info), row.id);
      return items;
    });
    res.status(201).json({ items });
  });
  app.get(prefix + "/leads", (req, res) => {
    const q = String(req.query.q || "").slice(0, 150),
      status = String(req.query.status || ""),
      page = Math.max(1, Math.min(10000, parseInt(req.query.page) || 1));
    const where =
        "(?='' OR status=?) AND (reference LIKE ? OR json_extract(data,'$.name') LIKE ? OR json_extract(data,'$.phone') LIKE ?)",
      args = [status, status, ...Array(3).fill("%" + q + "%")];
    const total = store.db
      .prepare("SELECT COUNT(*) AS count FROM leads WHERE " + where)
      .get(...args).count;
    res.json({
      total,
      page,
      pages: Math.max(1, Math.ceil(total / 20)),
      items: store.db
        .prepare(
          "SELECT * FROM leads WHERE " +
            where +
            " ORDER BY created_at DESC LIMIT 20 OFFSET ?",
        )
        .all(...args, (page - 1) * 20)
        .map((r) => ({ ...r, data: JSON.parse(r.data) })),
    });
  });
  app.get(prefix + "/leads/:id", (req, res) => {
    const r = store.db
      .prepare("SELECT * FROM leads WHERE id=?")
      .get(req.params.id);
    if (!r) throw new HttpError(404, "Talep bulunamadı.");
    res.json({
      ...r,
      data: JSON.parse(r.data),
      history: store.db
        .prepare(
          "SELECT * FROM lead_events WHERE lead_id=? ORDER BY created_at DESC",
        )
        .all(r.id)
        .map((e) => ({ ...e, data: JSON.parse(e.data) })),
    });
  });
  app.put(prefix + "/leads/:id", (req, res) => {
    const body = parse(
      z.object({
        version: z.number().int(),
        status: z.enum(["new", "contacted", "quoted", "closed"]),
        notes: text(10000),
        offerAmount: z.number().min(0).max(100000000),
        offerCurrency: z.enum(["TRY", "EUR", "USD"]),
        offerText: text(10000),
        outcome: z.enum(["", "won", "lost", "cancelled"]),
      }),
      req.body,
    );
    if (body.status === "closed" && !body.outcome)
      throw new HttpError(422, "Sonuçlanan talebin sonucunu seçin.");
    if (body.status === "quoted" && !body.offerText)
      throw new HttpError(422, "Gönderilen teklifin açıklamasını girin.");
    const record = store.db
      .prepare("SELECT * FROM leads WHERE id=?")
      .get(req.params.id);
    if (!record) throw new HttpError(404, "Talep bulunamadı.");
    if (record.version !== body.version)
      throw new HttpError(409, "Talep başka bir sekmede değişti. Yenileyin.");
    const { version, status, ...changes } = body,
      data = { ...JSON.parse(record.data), ...changes };
    store.transaction(() => {
      store.db.prepare("INSERT INTO lead_events VALUES(?,?,?,?)").run(
        randomUUID(),
        record.id,
        JSON.stringify({
          status: record.status,
          notes: JSON.parse(record.data).notes,
          offerAmount: JSON.parse(record.data).offerAmount,
          offerText: JSON.parse(record.data).offerText,
          actor: req.session.username,
        }),
        now(),
      );
      store.db
        .prepare(
          "UPDATE leads SET status=?,data=?,version=version+1,updated_at=? WHERE id=?",
        )
        .run(status, JSON.stringify(data), now(), record.id);
      store.audit(req.session.username, "lead.update", record.reference);
    });
    res.json({ ok: true });
  });
  app.get(prefix + "/backups", (req, res) => {
    if (!backups) throw new HttpError(503, "Yedekleme servisi başlatılmadı.");
    res.json({
      ...backups.status(),
      ...getSetting("backup", { enabled: true, intervalHours: 24 }),
    });
  });
  app.put(prefix + "/backups", (req, res) => {
    const data = parse(
      z.object({
        enabled: z.boolean(),
        intervalHours: z.union([z.literal(6), z.literal(12), z.literal(24)]),
      }),
      req.body.data,
    );
    res.json(
      saveSetting("backup", data, req.body.version, req.session.username),
    );
  });
  app.post(prefix + "/backups/run", (req, res) => {
    if (!backups) throw new HttpError(503, "Yedekleme servisi başlatılmadı.");
    void backups.run();
    res.status(202).json({ ok: true });
  });
}
