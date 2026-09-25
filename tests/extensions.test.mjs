import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import ExcelJS from "exceljs";
import { DatabaseSync } from "node:sqlite";
import { openStore, sourceCatalog } from "../server/store.mjs";
import { passwordHash } from "../server/auth.mjs";
import { createApp } from "../server/app.mjs";
import { createBackupService } from "../server/backup-service.mjs";
import { calculateStay } from "../src/lib/pricing.js";
import { render } from "../.ssr/entry-server.js";
const future = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
const later = (d, n) =>
  new Date(Date.parse(d) + n * 86400000).toISOString().slice(0, 10);
const room = {
  id: "suite",
  name: "Family Suite",
  capacity: 4,
  description: "Room details",
  area: 45,
  bedType: "Double + twin",
  view: "Valley",
  features: ["Terrace", "Bath"],
  gallery: [sourceCatalog.hotels[0].img],
};
const plan = {
  id: "summer",
  name: "Season",
  roomId: "suite",
  enabled: true,
  start: future,
  end: later(future, 10),
  basePrice: 100.1,
  currency: "TRY",
  includedAdults: 2,
  extraAdultPrice: 30.25,
  minNights: 1,
  childBands: [
    { minAge: 0, maxAge: 5, price: 0 },
    { minAge: 6, maxAge: 17, price: 20.2 },
  ],
};
test("seasonal pricing handles dates, guests, currencies and missing prices", () => {
  const hotel = { rooms: [room], ratePlans: [plan] },
    input = {
      roomId: "suite",
      start: future,
      end: later(future, 2),
      adults: 3,
      childAges: [7],
    };
  assert.equal(calculateStay(hotel, input).total, 301.1);
  assert.equal(
    calculateStay(hotel, { ...input, adults: 2, childAges: [5] }).total,
    200.2,
  );
  assert.equal(
    calculateStay(hotel, { ...input, end: future }).available,
    false,
  );
  assert.equal(
    calculateStay(hotel, { ...input, start: "2025-02-31" }).available,
    false,
  );
  assert.equal(
    calculateStay(hotel, { ...input, childAges: [7, 8] }).available,
    false,
  );
  assert.equal(calculateStay(hotel, { ...input, adults: 0 }).available, false);
  assert.equal(
    calculateStay(hotel, { ...input, end: later(future, 12) }).available,
    false,
  );
  assert.equal(
    calculateStay({ ...hotel, ratePlans: [{ ...plan, minNights: 3 }] }, input)
      .available,
    false,
  );
  assert.equal(
    calculateStay({ ...hotel, ratePlans: [{ ...plan, childBands: [] }] }, input)
      .available,
    false,
  );
  assert.equal(
    calculateStay(
      { ...hotel, ratePlans: [plan, { ...plan, id: "conflict" }] },
      input,
    ).available,
    false,
  );
  assert.equal(
    calculateStay(
      {
        ...hotel,
        ratePlans: [
          { ...plan, end: future },
          { ...plan, id: "next", start: later(future, 1), currency: "EUR" },
        ],
      },
      input,
    ).available,
    false,
  );
  assert.equal(
    calculateStay(hotel, { ...input, roomId: "unknown" }).available,
    false,
  );
});
test("extended admin workflows persist and enforce boundaries", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "eko-extended-")),
    store = openStore(directory);
  const userId = randomUUID(),
    username = "extended-admin",
    password = "Extension-Tests-7429";
  store.db
    .prepare("INSERT INTO users VALUES(?,?,?,?,?)")
    .run(
      userId,
      username,
      "Test",
      await passwordHash(password),
      new Date().toISOString(),
    );
  const backups = createBackupService(store, join(directory, "backups"));
  const origin = "http://localhost:4999",
    app = createApp({ store, backups, origin, dist: resolve("dist"), render });
  const server = await new Promise((r) => {
    const s = app.listen(0, "127.0.0.1", () => r(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = "",
    csrf = "",
    hotel,
    tour,
    importId;
  async function call(
    path,
    {
      method = "GET",
      body,
      auth = true,
      raw = false,
      requestOrigin = origin,
    } = {},
  ) {
    const headers = {};
    if (auth && cookie) headers.Cookie = cookie;
    if (method !== "GET") {
      headers.Origin = requestOrigin;
      if (auth && csrf) headers["X-CSRF-Token"] = csrf;
      headers["Content-Type"] = raw
        ? "application/octet-stream"
        : "application/json";
    }
    const response = await fetch(base + path, {
      method,
      headers,
      body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
      redirect: "manual",
    });
    const bytes = Buffer.from(await response.arrayBuffer()),
      text = bytes.toString();
    let json;
    try {
      json = JSON.parse(text);
    } catch {}
    return {
      status: response.status,
      headers: response.headers,
      text,
      json,
      bytes,
    };
  }
  try {
    const login = await call("/api/admin/login", {
      method: "POST",
      body: { username, password },
    });
    cookie = login.headers.get("set-cookie").split(";")[0];
    csrf = login.json.csrf;
    await t.test(
      "expanded endpoints require administrator authentication",
      async () => {
        for (const path of [
          "/homepage",
          "/choices",
          "/autosaves/new-hotel",
          "/leads",
          "/backups",
          "/import-template",
        ])
          assert.equal(
            (await call("/api/admin" + path, { auth: false })).status,
            401,
          );
      },
    );
    await t.test(
      "rich rooms and rate plans persist and render on public hotel pages",
      async () => {
        const r = await call("/api/admin/content", {
          method: "POST",
          body: {
            kind: "hotel",
            status: "published",
            data: {
              ...sourceCatalog.hotels[0],
              slug: "extended-test-hotel",
              name: "Extended Test Hotel",
              rooms: [room],
              ratePlans: [plan],
            },
          },
        });
        assert.equal(r.status, 201, r.text);
        hotel = r.json;
        const html = await call("/oteller/extended-test-hotel");
        assert.match(html.text, /Family Suite/);
        assert.match(html.text, /45 m²/);
        assert.match(html.text, /Valley/);
        const quote = await call("/api/quote", {
          method: "POST",
          auth: false,
          body: {
            slug: hotel.data.slug,
            roomId: "suite",
            start: future,
            end: later(future, 2),
            adults: 3,
            childAges: [7],
          },
        });
        assert.equal(quote.status, 200, quote.text);
        assert.equal(quote.json.total, 301.1);
        assert.equal(quote.json.indicative, true);
      },
    );
    await t.test(
      "rate overlaps, invalid rooms, duplicate room IDs and child bands are rejected",
      async () => {
        for (const patch of [
          { ratePlans: [plan, { ...plan, id: "overlap" }] },
          { ratePlans: [{ ...plan, roomId: "missing" }] },
          { ratePlans: [{ ...plan, start: plan.end, end: plan.start }] },
          {
            ratePlans: [
              {
                ...plan,
                childBands: [
                  { minAge: 0, maxAge: 5, price: 0 },
                  { minAge: 5, maxAge: 10, price: 1 },
                ],
              },
            ],
          },
          { rooms: [room, room] },
          { rooms: [{ ...room, gallery: ["/uploads/not-owned.webp"] }] },
        ]) {
          const r = await call(`/api/admin/content/${hotel.id}`, {
            method: "PUT",
            body: { ...hotel, data: { ...hotel.data, ...patch } },
          });
          assert.equal(r.status, 422, r.text);
        }
        assert.equal(store.get(hotel.id).version, 1);
      },
    );
    await t.test(
      "private automatic drafts accept incomplete forms and do not publish",
      async () => {
        const initial = await call("/api/admin/autosaves/new-hotel");
        assert.equal(initial.json.version, 0);
        const snapshot = {
          kind: "hotel",
          version: 0,
          status: "published",
          data: {
            name: "Unfinished autosave",
            slug: "",
            internalNotes: "AUTOSAVE-PRIVATE",
          },
        };
        const saved = await call("/api/admin/autosaves/new-hotel", {
          method: "PUT",
          body: { version: 0, record: snapshot },
        });
        assert.equal(saved.status, 200, saved.text);
        assert.equal(
          (await call("/api/admin/autosaves/new-hotel")).json.data.data.name,
          "Unfinished autosave",
        );
        assert(!JSON.stringify(store.catalog()).includes("AUTOSAVE-PRIVATE"));
        assert.equal(
          (
            await call("/api/admin/autosaves/new-hotel", {
              method: "PUT",
              body: { version: 0, record: snapshot },
            })
          ).status,
          409,
        );
        assert.equal(
          (
            await call("/api/admin/autosaves/new-hotel", {
              method: "DELETE",
              body: { version: 0 },
            })
          ).status,
          409,
        );
        assert.equal(
          (
            await call("/api/admin/autosaves/new-hotel", {
              method: "DELETE",
              body: { version: 1 },
            })
          ).status,
          200,
        );
        assert.equal(
          (
            await call(`/api/admin/autosaves/${hotel.id}`, {
              method: "PUT",
              body: { version: 0, record: { ...snapshot, version: 0 } },
            })
          ).status,
          409,
        );
      },
    );
    await t.test(
      "duplicates create independent drafts without publishing or replacing originals",
      async () => {
        const r = await call(`/api/admin/content/${hotel.id}/duplicate`, {
          method: "POST",
        });
        assert.equal(r.status, 201, r.text);
        assert.equal(r.json.status, "draft");
        assert.notEqual(r.json.data.slug, hotel.data.slug);
        assert.deepEqual(r.json.data.rooms, hotel.data.rooms);
        assert.equal(r.json.data.featured, false);
        assert.equal((await call("/oteller/" + r.json.data.slug)).status, 404);
      },
    );
    await t.test(
      "bulk publication is atomic, validates records and preserves revision history",
      async () => {
        const incomplete = await call("/api/admin/content", {
          method: "POST",
          body: {
            kind: "tour",
            status: "draft",
            data: { title: "Incomplete tour", slug: "incomplete-tour" },
          },
        });
        tour = incomplete.json;
        const fail = await call("/api/admin/bulk-status", {
          method: "POST",
          body: {
            items: [
              { id: hotel.id, version: hotel.version },
              { id: tour.id, version: tour.version },
            ],
            status: "published",
          },
        });
        assert.equal(fail.status, 422, fail.text);
        assert.equal(store.get(tour.id).status, "draft");
        assert.equal(store.get(hotel.id).version, hotel.version);
        const good = await call("/api/admin/bulk-status", {
          method: "POST",
          body: {
            items: [{ id: hotel.id, version: hotel.version }],
            status: "archived",
          },
        });
        assert.equal(good.status, 200, good.text);
        assert.equal((await call("/oteller/" + hotel.data.slug)).status, 404);
        assert.equal(
          (
            await call("/api/admin/bulk-status", {
              method: "POST",
              body: {
                items: [{ id: hotel.id, version: 1 }],
                status: "published",
              },
            })
          ).status,
          409,
        );
        hotel = store.get(hotel.id);
        await call("/api/admin/bulk-status", {
          method: "POST",
          body: {
            items: [{ id: hotel.id, version: hotel.version }],
            status: "published",
          },
        });
        hotel = store.get(hotel.id);
        assert.equal(
          (await call(`/api/admin/content/${hotel.id}/revisions`)).json.items
            .length,
          2,
        );
      },
    );
    await t.test(
      "homepage validates URLs/media, retains ordering, filters campaigns and blocks stale saves",
      async () => {
        const home = (await call("/api/admin/homepage")).json;
        const campaign = {
          id: "promo",
          title: "Editorial campaign",
          description: "Description",
          image: hotel.data.img,
          label: "See hotel",
          link: "/oteller/" + hotel.data.slug,
          enabled: true,
          start: "",
          end: "",
        };
        const data = {
          ...home.data,
          title: "New homepage title",
          hotelSlugs: [hotel.data.slug, sourceCatalog.hotels[1].slug],
          campaigns: [campaign, { ...campaign, id: "hidden", enabled: false }],
        };
        const bad = await call("/api/admin/homepage", {
          method: "PUT",
          body: { version: 0, data: { ...data, link: "javascript:alert(1)" } },
        });
        assert.equal(bad.status, 422, bad.text);
        const saved = await call("/api/admin/homepage", {
          method: "PUT",
          body: { version: 0, data },
        });
        assert.equal(saved.status, 200, saved.text);
        assert.equal(
          (
            await call("/api/admin/homepage", {
              method: "PUT",
              body: { version: 0, data },
            })
          ).status,
          409,
        );
        assert.equal(store.catalog().homepage.campaigns.length, 1);
        const html = await call("/");
        assert.match(html.text, /New homepage title/);
        assert.match(html.text, /Editorial campaign/);
        assert.deepEqual(store.catalog().homepage.hotelSlugs, data.hotelSlugs);
      },
    );
    await t.test(
      "Excel template, row preview, validation and repeat-safe commit",
      async () => {
        const template = await call("/api/admin/import-template");
        assert.equal(template.status, 200);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(template.bytes);
        const sheet = workbook.worksheets[0];
        sheet.addRow([
          "hotel",
          "Excel Test Hotel",
          "excel-test-hotel",
          "Nevşehir",
          "Göreme",
          "A sufficiently long description",
        ]);
        sheet.addRow([
          "tour",
          "Excel Test Tour",
          "excel-test-tour",
          "Nevşehir",
          "",
          "A sufficiently long tour description",
        ]);
        sheet.addRow(["hotel", "Duplicate", "excel-test-hotel"]);
        const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
        const preview = await call("/api/admin/imports/preview", {
          method: "POST",
          raw: true,
          body: buffer,
        });
        assert.equal(preview.status, 200, preview.text);
        importId = preview.json.id;
        assert.equal(preview.json.rows.length, 3);
        assert(preview.json.rows[2].error);
        assert.equal(preview.json.rows[0].error, "");
        assert.equal(
          store.db
            .prepare(
              "SELECT COUNT(*) AS count FROM content WHERE slug LIKE 'excel-test-%'",
            )
            .get().count,
          0,
        );
        assert.equal(
          (
            await call(`/api/admin/imports/${importId}/commit`, {
              method: "POST",
              body: { rows: [4] },
            })
          ).status,
          422,
        );
        const commit = await call(`/api/admin/imports/${importId}/commit`, {
          method: "POST",
          body: { rows: [2, 3] },
        });
        assert.equal(commit.status, 201, commit.text);
        assert(commit.json.items.every((i) => i.status === "draft"));
        const retry = await call(`/api/admin/imports/${importId}/commit`, {
          method: "POST",
          body: { rows: [2, 3] },
        });
        assert.equal(retry.status, 200, retry.text);
        assert.equal(retry.json.alreadyImported, true);
        assert.equal(
          store.db
            .prepare(
              "SELECT COUNT(*) AS count FROM content WHERE slug LIKE 'excel-test-%'",
            )
            .get().count,
          2,
        );
        assert.equal(
          (
            await call("/api/admin/imports/preview", {
              method: "POST",
              raw: true,
              body: Buffer.from("not-xlsx"),
            })
          ).status,
          422,
        );
      },
    );
    await t.test(
      "public inquiry consent/origin checks, deduplication, private notes and offer lifecycle",
      async () => {
        const body = {
          kind: "hotel",
          slug: hotel.data.slug,
          name: "Local Test Visitor",
          phone: "+905550000000",
          email: "test@example.invalid",
          message: "QA only",
          start: future,
          end: later(future, 2),
          adults: 2,
          childAges: [7],
          roomId: "suite",
          consent: true,
          website: "",
          requestId: randomUUID(),
        };
        assert.equal(
          (
            await call("/api/inquiries", {
              method: "POST",
              auth: false,
              body: { ...body, consent: false },
            })
          ).status,
          422,
        );
        assert.equal(
          (
            await call("/api/inquiries", {
              method: "POST",
              auth: false,
              body,
              requestOrigin: "https://untrusted.invalid",
            })
          ).status,
          403,
        );
        const created = await call("/api/inquiries", {
          method: "POST",
          auth: false,
          body,
        });
        assert.equal(created.status, 201, created.text);
        const repeated = await call("/api/inquiries", {
          method: "POST",
          auth: false,
          body,
        });
        assert.equal(repeated.json.reference, created.json.reference);
        assert.equal(
          store.db.prepare("SELECT COUNT(*) AS n FROM leads").get().n,
          1,
        );
        const list = await call("/api/admin/leads?q=Local&status=new");
        assert.equal(list.json.total, 1);
        const lead = (await call("/api/admin/leads/" + body.requestId)).json;
        assert.equal(lead.data.quote.total, 240.6);
        const update = {
          version: 1,
          status: "quoted",
          notes: "PRIVATE-LEAD-NOTE",
          offerAmount: 240.6,
          offerCurrency: "TRY",
          offerText: "Prepared offer",
          outcome: "",
        };
        assert.equal(
          (
            await call("/api/admin/leads/" + body.requestId, {
              method: "PUT",
              body: update,
            })
          ).status,
          200,
        );
        assert.equal(
          (
            await call("/api/admin/leads/" + body.requestId, {
              method: "PUT",
              body: update,
            })
          ).status,
          409,
        );
        assert.equal(
          (
            await call("/api/admin/leads/" + body.requestId, {
              method: "PUT",
              body: { ...update, version: 2, status: "closed" },
            })
          ).status,
          422,
        );
        assert.equal(
          (
            await call("/api/admin/leads/" + body.requestId, {
              method: "PUT",
              body: { ...update, version: 2, status: "closed", outcome: "won" },
            })
          ).status,
          200,
        );
        assert.equal(
          (await call("/api/admin/leads/" + body.requestId)).json.history
            .length,
          2,
        );
        assert(
          !(await call("/api/catalog", { auth: false })).text.includes(
            "PRIVATE-LEAD-NOTE",
          ),
        );
      },
    );
    await t.test(
      "backups include a verified DB, uploaded files and SHA-256 manifest; concurrent triggers coalesce",
      async () => {
        await writeFile(
          join(directory, "uploads", "backup-test.txt"),
          "test image stand-in",
        );
        const first = backups.run();
        assert.equal(backups.run(), first);
        await first;
        const status = backups.status();
        assert.equal(
          status.items[0].status,
          "complete",
          JSON.stringify(status),
        );
        const row = store.db
            .prepare("SELECT * FROM backups WHERE status='complete'")
            .get(),
          manifest = JSON.parse(
            await readFile(join(row.path, "manifest.json"), "utf8"),
          );
        for (const f of manifest.files) {
          const bytes = await readFile(join(row.path, f.path));
          assert.equal(
            createHash("sha256").update(bytes).digest("hex"),
            f.sha256,
          );
        }
        const restored = new DatabaseSync(
          join(row.path, "ekonomikotel.sqlite"),
          { readOnly: true },
        );
        assert.equal(
          restored.prepare("PRAGMA integrity_check").get().integrity_check,
          "ok",
        );
        assert.equal(
          restored.prepare("SELECT COUNT(*) AS n FROM leads").get().n,
          1,
        );
        restored.close();
        backups.tick();
        assert.equal(backups.status().running, false);
        const config = await call("/api/admin/backups");
        assert.equal(config.status, 200);
        assert.equal(
          (
            await call("/api/admin/backups", {
              method: "PUT",
              body: { version: 0, data: { enabled: false, intervalHours: 12 } },
            })
          ).status,
          200,
        );
        assert.equal(
          (
            await call("/api/admin/backups", {
              method: "PUT",
              body: { version: 0, data: { enabled: true, intervalHours: 24 } },
            })
          ).status,
          409,
        );
      },
    );
    await t.test(
      "backup failure is reported without success claims",
      async () => {
        const path = join(directory, "not-a-directory");
        await writeFile(path, "block");
        const broken = createBackupService(store, path);
        await broken.run();
        assert.equal(broken.status().items[0].status, "failed");
        await broken.stop();
      },
    );
    await t.test(
      "all original source records survive the extension workflows",
      () => {
        for (const original of sourceCatalog.hotels) {
          const actual = store
            .catalog()
            .hotels.find((h) => h.slug === original.slug);
          assert.equal(actual.longBlurb, original.longBlurb);
          assert.deepEqual(actual.gallery, original.gallery);
        }
      },
    );
  } finally {
    await backups.stop();
    await new Promise((r) => server.close(r));
    store.close();
    await rm(directory, { recursive: true, force: true });
  }
});
