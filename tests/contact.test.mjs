import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { openStore, sourceCatalog } from "../server/store.mjs";
import { passwordHash } from "../server/auth.mjs";
import { createApp } from "../server/app.mjs";
import { AGENCY, whatsappUrl } from "../src/lib/agency.js";
import {
  HEALTH_AREAS,
  HEALTH_LOCALES,
  HEALTH_LANGUAGES,
  values,
  labelOf,
} from "../src/lib/contact-forms.js";
import { treatmentCategories } from "../health/src/treatments.js";

const day = (n) =>
  new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const travel = (extra = {}) => ({
  form: "travel",
  requestId: randomUUID(),
  name: "Local Contact Visitor",
  phone: "+90 555 000 00 00",
  email: "",
  message: "QA only",
  consent: true,
  website: "",
  contactMethod: "phone",
  topic: "hotel",
  start: day(20),
  end: day(23),
  flexibleDates: true,
  adults: 2,
  childAges: [6],
  rooms: 1,
  area: "urgup",
  budget: "boutique",
  contactTime: "evening",
  bookingRef: "",
  ...extra,
});
const health = (extra = {}) => ({
  form: "health",
  requestId: randomUUID(),
  name: "Local Health Visitor",
  phone: "+49 30 0000000",
  email: "health@example.invalid",
  message: "QA only",
  consent: true,
  healthConsent: true,
  website: "",
  contactMethod: "email",
  locale: "de",
  treatmentArea: "dis",
  procedure: "Zahnimplantat",
  country: "Deutschland",
  travelWindow: "1-3m",
  companions: 1,
  services: ["accommodation", "transfer"],
  hasReports: "yes",
  ...extra,
});

test("shared agency and contact-form constants", () => {
  assert.equal(AGENCY.phoneDisplay, "0544 341 70 20");
  assert.equal(AGENCY.tel, "+905443417020");
  assert.equal(AGENCY.phoneIntl, "+90 544 341 70 20");
  assert.equal(AGENCY.whatsappE164, "905443417020");
  assert.equal(AGENCY.tursabNo, "A-12892");
  assert.equal(AGENCY.tursabVerifyUrl, "https://www.tursab.org.tr/tr/ddsv");
  assert.equal(
    whatsappUrl("Merhaba"),
    "https://wa.me/905443417020?text=Merhaba",
  );
  assert.deepEqual(
    values(HEALTH_AREAS).filter((v) => v !== "other"),
    treatmentCategories.map((c) => c.id),
  );
  assert.deepEqual(values(HEALTH_LANGUAGES), HEALTH_LOCALES);
  assert.equal(labelOf(HEALTH_AREAS, "dis"), "Ağız ve diş");
  assert.equal(labelOf(HEALTH_AREAS, "unknown"), "unknown");
});

test("server-rendered pages show the single phone line and TÜRSAB number", async () => {
  // .ssr yalnızca "npm run build" ile yenilenir; dinamik içe aktarma, eski bir
  // derlemenin diğer testleri düşürmesini önler.
  const { render } = await import("../.ssr/entry-server.js");
  const directory = await mkdtemp(join(tmpdir(), "eko-contact-ssr-")),
    store = openStore(directory);
  try {
    const catalog = store.catalog();
    const contact = render("/iletisim", catalog);
    assert(contact.includes("A-12892"), "/iletisim must show the TÜRSAB no");
    assert(
      contact.includes("0544 341 70 20"),
      "/iletisim must show the phone line",
    );
    for (const path of ["/", "/iletisim", "/oteller", "/turlar"]) {
      const html = render(path, catalog);
      assert(!html.includes("534 235"), `${path} still shows the old number`);
      assert(!html.includes("5342354688"), `${path} links the old number`);
    }
  } finally {
    store.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test("built health section carries the phone line and TÜRSAB number", async () => {
  // public/saglik-turizmi yalnızca "npm run build" ile oluşur.
  const assets = join("public", "saglik-turizmi", "assets");
  const bundle = (
    await Promise.all(
      (await readdir(assets))
        .filter((name) => name.endsWith(".js"))
        .map((name) => readFile(join(assets, name), "utf8")),
    )
  ).join("\n");
  const page = await readFile(
    join("public", "saglik-turizmi", "index.html"),
    "utf8",
  );
  assert(bundle.includes(AGENCY.tel), "health bundle must link the phone");
  assert(bundle.includes(AGENCY.phoneIntl), "health bundle must show the phone");
  assert(bundle.includes(AGENCY.tursabNo), "health bundle must show TÜRSAB");
  assert(page.includes('id="contact-direct"'), "health page needs the call box");
  assert(!bundle.includes("5342354688"), "health bundle links the old number");
});
test("public contact forms store travel and health requests separately", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "eko-contact-")),
    store = openStore(directory);
  const username = "contact-admin",
    password = "Contact-Tests-5817";
  store.db
    .prepare("INSERT INTO users VALUES(?,?,?,?,?)")
    .run(
      randomUUID(),
      username,
      "Test",
      await passwordHash(password),
      new Date().toISOString(),
    );
  const origin = "http://localhost:4999",
    app = createApp({ store, origin, dist: join(directory, "no-dist") });
  const server = await new Promise((r) => {
    const s = app.listen(0, "127.0.0.1", () => r(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = "",
    csrf = "";
  async function call(
    path,
    { method = "GET", body, requestOrigin = origin, raw } = {},
  ) {
    const headers = {};
    if (cookie) headers.Cookie = cookie;
    if (method !== "GET") {
      if (requestOrigin) headers.Origin = requestOrigin;
      if (csrf) headers["X-CSRF-Token"] = csrf;
      headers["Content-Type"] = "application/json";
    }
    const response = await fetch(base + path, {
      method,
      headers,
      body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {}
    return { status: response.status, text, json };
  }
  const send = (body, options = {}) =>
    call("/api/contact", { method: "POST", body, ...options });
  const lead = (id) => {
    const row = store.db.prepare("SELECT * FROM leads WHERE id=?").get(id);
    return row && { ...row, data: JSON.parse(row.data) };
  };
  const leadCount = () =>
    store.db.prepare("SELECT COUNT(*) AS n FROM leads").get().n;
  const resetLimits = () => store.db.exec("DELETE FROM public_limits");
  const fields = (result) => (result.json?.fields || []).map((f) => f.field);
  try {
    await t.test("travel request is stored as an Ekonomikotel contact lead", async () => {
      resetLimits();
      const body = travel({ isAdmin: true, status: "closed", offerAmount: 9 });
      const created = await send(body);
      assert.equal(created.status, 201, created.text);
      assert.match(created.json.reference, /^EKO-[0-9A-F]{10}$/);
      const row = lead(body.requestId);
      assert.equal(row.reference, created.json.reference);
      assert.equal(row.status, "new");
      assert.equal(row.data.kind, "contact");
      assert.equal(row.data.title, "İletişim formu · Otel konaklaması");
      assert.equal(row.data.source, "contact-form");
      assert.equal(row.data.topic, "hotel");
      assert.equal(row.data.area, "urgup");
      assert.deepEqual(row.data.childAges, [6]);
      assert.equal(row.data.flexibleDates, true);
      assert.equal(row.data.offerCurrency, "TRY");
      assert.equal(row.data.offerAmount, 0);
      assert.equal(row.data.notes, "");
      assert.equal(row.data.outcome, "");
      assert.ok(Date.parse(row.data.consentAt));
      for (const key of ["website", "requestId", "form", "isAdmin", "status"])
        assert(!(key in row.data), `${key} must not be stored`);
    });
    await t.test("travel defaults fill optional details", async () => {
      resetLimits();
      const body = {
        form: "travel",
        requestId: randomUUID(),
        name: "  Minimal Visitor  ",
        phone: "0555 000 00 00",
        consent: true,
        contactMethod: "whatsapp",
        topic: "existing",
        bookingRef: " EKO-TEST ",
      };
      assert.equal((await send(body)).status, 201);
      const { data } = lead(body.requestId);
      assert.equal(data.name, "Minimal Visitor");
      assert.equal(data.bookingRef, "EKO-TEST");
      assert.equal(data.title, "İletişim formu · Mevcut rezervasyonum hakkında");
      assert.deepEqual(
        [data.adults, data.rooms, data.childAges, data.start, data.end],
        [2, 1, [], "", ""],
      );
      assert.deepEqual(
        [data.area, data.budget, data.contactTime, data.email, data.message],
        ["", "", "", "", ""],
      );
      assert.equal(data.flexibleDates, false);
    });
    await t.test("health request is stored with explicit consent and CH reference", async () => {
      resetLimits();
      const auditBefore = store.db
        .prepare("SELECT COUNT(*) AS n FROM audit")
        .get().n;
      const body = health();
      const created = await send(body);
      assert.equal(created.status, 201, created.text);
      assert.match(created.json.reference, /^CH-[0-9A-F]{10}$/);
      const { data } = lead(body.requestId);
      assert.equal(data.kind, "health");
      assert.equal(data.title, "Sağlık turizmi · Ağız ve diş");
      assert.equal(data.source, "health-form");
      assert.equal(data.preferredLanguage, "de");
      assert.equal(data.offerCurrency, "EUR");
      assert.deepEqual(data.services, ["accommodation", "transfer"]);
      assert.equal(data.healthConsent, true);
      assert.ok(Date.parse(data.consentAt));
      assert.ok(Date.parse(data.healthConsentAt));
      for (const key of ["website", "requestId", "form"])
        assert(!(key in data), `${key} must not be stored`);
      assert.equal(
        store.db.prepare("SELECT COUNT(*) AS n FROM audit").get().n,
        auditBefore,
        "health submissions must not reach the audit log",
      );
      const other = health({
        treatmentArea: "other",
        preferredLanguage: "en",
        contactMethod: "whatsapp",
        email: "",
        services: [],
      });
      assert.equal((await send(other)).status, 201);
      assert.equal(lead(other.requestId).data.preferredLanguage, "en");
      assert.equal(
        lead(other.requestId).data.title,
        "Sağlık turizmi · Diğer / emin değilim",
      );
    });
    await t.test("invalid submissions are rejected with field errors", async () => {
      resetLimits();
      const before = leadCount();
      const cases = [
        [travel({ consent: false }), "consent"],
        [travel({ consent: undefined }), "consent"],
        [health({ healthConsent: false }), "healthConsent"],
        [health({ healthConsent: undefined }), "healthConsent"],
        [travel({ contactMethod: "email", email: "" }), "email"],
        [health({ contactMethod: "email", email: "" }), "email"],
        [travel({ email: "not-an-email" }), "email"],
        [travel({ phone: "call me" }), "phone"],
        [health({ phone: "07700 900123" }), "phone"],
        [health({ phone: "49 30 0000000" }), "phone"],
        [travel({ name: "A" }), "name"],
        [travel({ topic: "cruise" }), "topic"],
        [travel({ contactMethod: "fax" }), "contactMethod"],
        [travel({ adults: 0 }), "adults"],
        [travel({ rooms: 51 }), "rooms"],
        [travel({ childAges: [18] }), "childAges.0"],
        [travel({ area: "paris" }), "area"],
        [travel({ message: "x".repeat(4001) }), "message"],
        [health({ message: "x".repeat(2001) }), "message"],
        [health({ country: "" }), "country"],
        [health({ locale: "es" }), "locale"],
        [health({ treatmentArea: "cardio" }), "treatmentArea"],
        [health({ services: ["transfer", "transfer"] }), "services"],
        [health({ companions: 6 }), "companions"],
        [health({ requestId: "not-a-uuid" }), "requestId"],
        [{ ...travel(), form: "spa" }, "form"],
      ];
      for (const [body, field] of cases) {
        const result = await send(body);
        assert.equal(result.status, 422, `${field}: ${result.text}`);
        assert(
          fields(result).includes(field),
          `${field} expected in ${result.text}`,
        );
      }
      const single = await send(travel({ contactMethod: "email" }));
      assert.equal(
        single.json.error,
        "E-posta ile dönüş için e-posta adresinizi girin.",
      );
      const honeypot = await send(travel({ website: "https://spam.invalid" }));
      assert.equal(honeypot.status, 422);
      assert.equal(honeypot.json.error, "Talep gönderilemedi.");
      assert.equal(leadCount(), before);
    });
    await t.test("travel date ranges must be complete and in the future", async () => {
      resetLimits();
      const before = leadCount();
      for (const [dates, field] of [
        [{ start: day(10), end: day(10) }, "end"],
        [{ start: day(10), end: day(8) }, "end"],
        [{ start: day(-2), end: day(3) }, "start"],
        [{ start: day(10), end: "" }, "end"],
        [{ start: "", end: day(10) }, "start"],
      ]) {
        const result = await send(travel(dates));
        assert.equal(result.status, 422, JSON.stringify(dates));
        assert.equal(result.json.error, "Geçerli bir tarih aralığı girin.");
        assert.deepEqual(fields(result), [field]);
      }
      assert.equal((await send(travel({ start: "2026-02-31" }))).status, 422);
      assert.equal(leadCount(), before);
    });
    await t.test("origin is enforced and oversized bodies are refused", async () => {
      resetLimits();
      const before = leadCount();
      assert.equal(
        (await send(travel(), { requestOrigin: "https://untrusted.invalid" }))
          .status,
        403,
      );
      assert.equal((await send(health(), { requestOrigin: "" })).status, 403);
      assert.equal(
        (
          await call("/api/contact", {
            method: "POST",
            raw: JSON.stringify(travel({ message: "x".repeat(25000) })),
          })
        ).status,
        413,
      );
      assert.equal(leadCount(), before);
    });
    await t.test("retries with the same requestId return the first reference", async () => {
      resetLimits();
      const body = health();
      const first = await send(body);
      assert.equal(first.status, 201);
      const before = leadCount();
      const again = await send({ ...body, name: "Changed Name", country: "Österreich" });
      assert.ok(again.status < 300, again.text);
      assert.equal(again.json.reference, first.json.reference);
      assert.equal(leadCount(), before);
      assert.equal(lead(body.requestId).data.name, "Local Health Visitor");
    });
    await t.test("rate limit allows five contact submissions per window", async () => {
      resetLimits();
      for (let i = 0; i < 5; i++)
        assert.equal((await send(i % 2 ? health() : travel())).status, 201);
      const blocked = await send(travel());
      assert.equal(blocked.status, 429);
      assert.match(blocked.json.error, /Çok fazla istek/);
      resetLimits();
    });
    await t.test("admin lead list filters by source and opens new kinds", async () => {
      resetLimits();
      const hotelLead = {
        kind: "hotel",
        slug: sourceCatalog.hotels[0].slug,
        name: "Local Hotel Visitor",
        phone: "+905550000001",
        adults: 2,
        consent: true,
        requestId: randomUUID(),
      };
      assert.equal(
        (await call("/api/inquiries", { method: "POST", body: hotelLead }))
          .status,
        201,
      );
      const login = await fetch(base + "/api/admin/login", {
        method: "POST",
        headers: { Origin: origin, "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      assert.equal(login.status, 200);
      cookie = login.headers.get("set-cookie").split(";")[0];
      csrf = (await login.json()).csrf;
      const list = async (query) =>
        (await call("/api/admin/leads" + query)).json;
      const all = await list("");
      const kinds = (result) => new Set(result.items.map((i) => i.data.kind));
      assert.deepEqual(kinds(all), new Set(["hotel", "contact", "health"]));
      const onlyHealth = await list("?kind=health");
      assert.deepEqual(kinds(onlyHealth), new Set(["health"]));
      assert.equal(
        onlyHealth.total,
        store.db
          .prepare(
            "SELECT COUNT(*) AS n FROM leads WHERE json_extract(data,'$.kind')='health'",
          )
          .get().n,
      );
      assert.deepEqual(kinds(await list("?kind=contact")), new Set(["contact"]));
      const offers = await list("?kind=hotel,tour");
      assert.equal(offers.total, 1);
      assert.equal(offers.items[0].data.name, "Local Hotel Visitor");
      assert.equal((await list("?kind=unknown")).total, all.total);
      assert.equal((await list("?kind=health&q=Local%20Health")).total > 0, true);
      assert.equal((await list("?kind=contact&q=Local%20Health")).total, 0);
      const healthLead = onlyHealth.items[0];
      const detail = await call("/api/admin/leads/" + healthLead.id);
      assert.equal(detail.status, 200);
      assert.equal(detail.json.data.kind, "health");
      const update = await call("/api/admin/leads/" + healthLead.id, {
        method: "PUT",
        body: {
          version: detail.json.version,
          status: "contacted",
          notes: "Forwarded for pre-evaluation",
          offerAmount: 0,
          offerCurrency: "EUR",
          offerText: "",
          outcome: "",
        },
      });
      assert.equal(update.status, 200, update.text);
      const audit = store.db
        .prepare("SELECT * FROM audit WHERE action='lead.update'")
        .all();
      assert.equal(audit.at(-1).target, healthLead.reference);
      assert(
        !JSON.stringify(audit).includes(healthLead.data.name),
        "audit log must not contain personal data",
      );
    });
    await t.test("phone rules: travel accepts local formats, health needs a country code", async () => {
      resetLimits();
      const local = await send(health({ phone: "07700 900123" }));
      assert.equal(local.status, 422, local.text);
      assert.deepEqual(fields(local), ["phone"]);
      assert.equal(
        local.json.error,
        "Ülke koduyla birlikte telefon numarası girin (ör. +44 …).",
      );
      for (const phone of ["+33 6.12.34.56.78", "0049 151/2345678"]) {
        const body = health({ phone });
        const result = await send(body);
        assert.equal(result.status, 201, `${phone}: ${result.text}`);
        assert.equal(lead(body.requestId).data.phone, phone);
      }
      const dotted = travel({ phone: "0532.123.45.67" });
      const result = await send(dotted);
      assert.equal(result.status, 201, result.text);
      assert.equal(lead(dotted.requestId).data.phone, "0532.123.45.67");
      resetLimits();
    });
    await t.test("contact retries of a stored request skip the rate limit", async () => {
      resetLimits();
      const first = travel();
      const created = await send(first);
      assert.equal(created.status, 201, created.text);
      for (let i = 0; i < 3; i++)
        assert.equal((await send(i % 2 ? travel() : health())).status, 201);
      // Tekrar denemeler kotayı tüketmez: beşinci yeni gönderim hâlâ kabul edilir.
      for (let i = 0; i < 3; i++) {
        const again = await send(first);
        assert.equal(again.status, 201, again.text);
        assert.equal(again.json.reference, created.json.reference);
      }
      assert.equal((await send(travel())).status, 201);
      assert.equal((await send(travel())).status, 429);
      const retry = await send(first);
      assert.equal(retry.status, 201, retry.text);
      assert.equal(retry.json.reference, created.json.reference);
      resetLimits();
    });
    await t.test("offer-form retries return the stored reference without using the quota", async () => {
      resetLimits();
      const inquiry = () => ({
        kind: "hotel",
        slug: sourceCatalog.hotels[0].slug,
        name: "Local Retry Visitor",
        phone: "0532.123.45.67",
        adults: 2,
        consent: true,
        requestId: randomUUID(),
      });
      const post = (body) => call("/api/inquiries", { method: "POST", body });
      const first = inquiry();
      const created = await post(first);
      assert.equal(created.status, 201, created.text);
      for (let i = 0; i < 4; i++) assert.equal((await post(inquiry())).status, 201);
      assert.equal((await post(inquiry())).status, 429);
      const retry = await post(first);
      assert.equal(retry.status, 200, retry.text);
      assert.equal(retry.json.reference, created.json.reference);
      assert.equal(lead(first.requestId).data.phone, "0532.123.45.67");
      resetLimits();
    });
  } finally {
    await new Promise((r) => server.close(r));
    store.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test("server-rendered meta for the contact and KVKK notice pages", async (t) => {
  // dist ve .ssr yalnızca "npm run build" ile yenilenir; KVKK sayfasının
  // gövdesi React rotası eklenip yeniden derlendikten sonra doğrulanabilir.
  const { render } = await import("../.ssr/entry-server.js");
  const directory = await mkdtemp(join(tmpdir(), "eko-contact-meta-")),
    store = openStore(directory);
  const origin = "http://localhost:4999",
    app = createApp({ store, origin, dist: resolve("dist"), render });
  const server = await new Promise((r) => {
    const s = app.listen(0, "127.0.0.1", () => r(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const get = async (path) => {
    const response = await fetch(base + path);
    return { status: response.status, text: await response.text() };
  };
  try {
    const contact = await get("/iletisim/");
    assert.equal(contact.status, 200);
    const contactDescription = `Otel, tur ve balayı talepleriniz için iletişim formu ve ${AGENCY.phoneDisplay} bilgi hattı. TÜRSAB Belge No: ${AGENCY.tursabNo}.`;
    assert(
      contact.text.includes(
        `<meta name="description" content="${contactDescription}"`,
      ),
      "/iletisim needs its own meta description",
    );
    assert(
      contact.text.includes(
        `<meta property="og:description" content="${contactDescription}"`,
      ),
    );
    const kvkk = await get("/kvkk-aydinlatma/");
    assert.equal(kvkk.status, 200);
    assert(
      kvkk.text.includes("<title>KVKK Aydınlatma Metni | Ekonomikotel</title>"),
    );
    assert(
      kvkk.text.includes(
        '<meta name="description" content="Ekonomikotel iletişim ve teklif formları için kişisel verilerin işlenmesine ilişkin aydınlatma metni."',
      ),
    );
    assert(
      kvkk.text.includes(
        `<link rel="canonical" href="${origin}/kvkk-aydinlatma/"`,
      ),
    );
    assert(kvkk.text.includes('content="index,follow"'));
    assert(
      (await get("/sitemap.xml")).text.includes(
        `<loc>${origin}/kvkk-aydinlatma/</loc>`,
      ),
    );
    await t.test("KVKK notice body comes from the rebuilt SSR bundle", () => {
      assert(
        !kvkk.text.includes("not-found"),
        "/kvkk-aydinlatma renders the 404 view: add the React route and run npm run build",
      );
      assert.match(kvkk.text, /Kapadokya Alperen/i);
      assert(kvkk.text.includes(AGENCY.tursabNo));
    });
  } finally {
    await new Promise((r) => server.close(r));
    store.close();
    await rm(directory, { recursive: true, force: true });
  }
});
