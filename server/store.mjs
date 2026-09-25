import { defaultHomepage } from "../src/lib/homepage.js";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

export const sourceCatalog = JSON.parse(
  readFileSync(new URL("../src/data/catalog.json", import.meta.url), "utf8"),
);
export const featuredSlugs = [
  "kayakapi-premium-caves-cappadocia",
  "sacred-mansion-cappadocia",
  "cappadocia-symbol-hotel",
  "sacred-house-hotel",
];
export function openStore(directory) {
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  mkdirSync(join(directory, "uploads"), { recursive: true });
  const db = new DatabaseSync(join(directory, "ekonomikotel.sqlite"));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), csrf TEXT NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS content (id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('hotel','tour')), slug TEXT NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('draft','published','archived')), data TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(kind,slug));
    CREATE TABLE IF NOT EXISTS revisions (id TEXT PRIMARY KEY, content_id TEXT NOT NULL REFERENCES content(id), version INTEGER NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL, actor TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(content_id,version));
    CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, path TEXT NOT NULL UNIQUE, name TEXT NOT NULL, width INTEGER, height INTEGER, bytes INTEGER, source TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS login_attempts (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, reset_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, data TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS autosaves (user_id TEXT NOT NULL REFERENCES users(id), key TEXT NOT NULL, data TEXT NOT NULL, version INTEGER NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY(user_id,key));
    CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, reference TEXT NOT NULL UNIQUE, status TEXT NOT NULL, data TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS lead_events (id TEXT PRIMARY KEY, lead_id TEXT NOT NULL REFERENCES leads(id), data TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS imports (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), data TEXT NOT NULL, created_at TEXT NOT NULL, consumed_at TEXT);
    CREATE TABLE IF NOT EXISTS backups (id TEXT PRIMARY KEY, status TEXT NOT NULL, path TEXT, bytes INTEGER, error TEXT, created_at TEXT NOT NULL, completed_at TEXT);
    CREATE TABLE IF NOT EXISTS public_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS leads_status_date ON leads(status,created_at);
    CREATE INDEX IF NOT EXISTS content_kind_status ON content(kind,status);
    CREATE INDEX IF NOT EXISTS audit_created ON audit(created_at);
  `);
  const transaction = (fn) => {
    db.exec("BEGIN IMMEDIATE");
    try {
      const value = fn();
      db.exec("COMMIT");
      return value;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  };
  const audit = (actor, action, target = "") =>
    db
      .prepare(
        "INSERT INTO audit(actor,action,target,created_at) VALUES(?,?,?,?)",
      )
      .run(actor, action, target, new Date().toISOString());
  if (!db.prepare("SELECT 1 FROM meta WHERE key='seed-v1'").get())
    transaction(() => {
      const now = new Date().toISOString();
      const add = db.prepare(
        "INSERT INTO content(id,kind,slug,title,status,data,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
      );
      const image = db.prepare(
        "INSERT OR IGNORE INTO media(id,path,name,source,created_at) VALUES(?,?,?,?,?)",
      );
      for (const kind of ["hotel", "tour"])
        for (const item of sourceCatalog[
          kind === "hotel" ? "hotels" : "tours"
        ]) {
          const data = {
            ...item,
            featured: kind === "tour" || featuredSlugs.includes(item.slug),
            priceMode: "request",
            rooms: [],
            seoTitle: "",
            seoDescription: "",
          };
          const id = randomUUID();
          add.run(
            id,
            kind,
            item.slug,
            item.name || item.title,
            "published",
            JSON.stringify(data),
            now,
            now,
          );
          for (const [index, path] of [
            ...new Set([item.img, ...item.gallery]),
          ].entries())
            image.run(
              randomUUID(),
              path,
              `${item.name || item.title} · ${index + 1}`,
              "import",
              now,
            );
        }
      db.prepare("INSERT INTO meta VALUES('seed-v1',?)").run(now);
      audit("Sistem", "catalog.import", "129 otel ve 2 tur");
    });
  const parse = (row) =>
    row && {
      id: row.id,
      kind: row.kind,
      status: row.status,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      data: JSON.parse(row.data),
    };
  const get = (id) =>
    parse(db.prepare("SELECT * FROM content WHERE id=?").get(id));
  const publicItem = (row) => {
    const {
      internalNotes,
      sourceHotelId,
      sourceId,
      sourceUrl,
      sourcePage,
      ...data
    } = JSON.parse(row.data);
    if (
      data.priceMode === "from" &&
      (!data.priceValidUntil ||
        data.priceValidUntil < new Date().toISOString().slice(0, 10))
    )
      data.priceMode = "request";
    return data;
  };
  const catalog = (previewId) => {
    const result = {
      amenities: sourceCatalog.amenities,
      hero: sourceCatalog.hero,
      homepage: JSON.parse(
        db.prepare("SELECT data FROM settings WHERE key='homepage'").get()
          ?.data || JSON.stringify(defaultHomepage),
      ),
      hotels: [],
      tours: [],
    };
    const rows = db
      .prepare(
        "SELECT * FROM content WHERE status='published' OR id=? ORDER BY created_at,rowid",
      )
      .all(previewId || "");
    for (const row of rows)
      result[row.kind === "hotel" ? "hotels" : "tours"].push(publicItem(row));
    result.homepage.hotelSlugs = result.homepage.hotelSlugs.filter((slug) =>
      result.hotels.some((h) => h.slug === slug),
    );
    result.homepage.tourSlugs = result.homepage.tourSlugs.filter((slug) =>
      result.tours.some((t) => t.slug === slug),
    );
    result.homepage.campaigns = result.homepage.campaigns.filter(
      (c) =>
        c.enabled &&
        (!c.start || c.start <= new Date().toISOString().slice(0, 10)) &&
        (!c.end || c.end >= new Date().toISOString().slice(0, 10)),
    );
    if (previewId) result.previewId = previewId;
    return result;
  };
  return {
    db,
    transaction,
    audit,
    get,
    catalog,
    directory,
    close: () => db.close(),
  };
}
