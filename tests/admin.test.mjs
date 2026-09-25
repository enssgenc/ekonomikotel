import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { openStore, sourceCatalog } from "../server/store.mjs";
import { passwordHash } from "../server/auth.mjs";
import { validateContent } from "../server/validation.mjs";
import { createApp } from "../server/app.mjs";
import { render } from "../.ssr/entry-server.js";

test("Admin persistence, access controls and publication lifecycle", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "ekonomikotel-admin-test-"));
  let store = openStore(directory);
  const username = "test-admin",
    password = "Only-Test-Password-274";
  store.db
    .prepare("INSERT INTO users VALUES(?,?,?,?,?)")
    .run(
      randomUUID(),
      username,
      "Test Manager",
      await passwordHash(password),
      new Date().toISOString(),
    );
  const allowedOrigin = "http://localhost:4999";
  const app = createApp({
    store,
    origin: allowedOrigin,
    dist: resolve("dist"),
    render,
  });
  const server = await new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = "",
    csrf = "",
    record;
  const call = async (
    path,
    {
      method = "GET",
      body,
      auth = true,
      origin = allowedOrigin,
      token = csrf,
      raw = false,
    } = {},
  ) => {
    const headers = {};
    if (auth && cookie) headers.Cookie = cookie;
    if (method !== "GET") {
      headers.Origin = origin;
      if (token) headers["X-CSRF-Token"] = token;
      headers["Content-Type"] = raw ? "image/png" : "application/json";
    }
    const response = await fetch(base + path, {
      method,
      headers,
      body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
      redirect: "manual",
    });
    return {
      status: response.status,
      headers: response.headers,
      text: await response.text(),
    };
  };
  try {
    await t.test(
      "initial seed preserves every imported field and is idempotent",
      () => {
        assert.equal(store.catalog().hotels.length, 129);
        assert.equal(store.catalog().tours.length, 2);
        for (const original of sourceCatalog.hotels) {
          const item = store
            .catalog()
            .hotels.find((h) => h.slug === original.slug);
          for (const key of [
            "name",
            "blurb",
            "longBlurb",
            "gallery",
            "amenities",
          ])
            assert.deepEqual(item[key], original[key]);
        }
        const other = openStore(directory);
        assert.equal(other.catalog().hotels.length, 129);
        other.close();
      },
    );
    await t.test(
      "all imported records remain editable, including absent long descriptions",
      () => {
        for (const row of store.db.prepare("SELECT id FROM content").all()) {
          const record = store.get(row.id);
          assert.doesNotThrow(() =>
            validateContent(store, record.kind, record, record.data),
          );
        }
      },
    );
    await t.test("empty catalog renders public routes without crashing", () => {
      const catalog = { ...store.catalog(), hotels: [], tours: [] };
      for (const path of ["/", "/oteller", "/turlar", "/favoriler", "/rehber"])
        assert.doesNotThrow(() => render(path, catalog));
    });
    await t.test(
      "unauthenticated admin access and cross-origin login are rejected",
      async () => {
        assert.equal(
          (await call("/api/admin/content", { auth: false })).status,
          401,
        );
        assert.equal(
          (
            await call("/api/admin/login", {
              method: "POST",
              auth: false,
              body: { username, password },
              origin: "https://untrusted.invalid",
            })
          ).status,
          403,
        );
      },
    );
    await t.test(
      "login creates an HttpOnly SameSite session and CSRF token",
      async () => {
        const r = await call("/api/admin/login", {
          method: "POST",
          auth: false,
          body: { username, password },
        });
        assert.equal(r.status, 200);
        const header = r.headers.get("set-cookie");
        assert.match(header, /HttpOnly/);
        assert.match(header, /SameSite=Strict/i);
        cookie = header.split(";")[0];
        csrf = JSON.parse(r.text).csrf;
        assert(csrf.length >= 32);
        assert(
          !store.db
            .prepare("SELECT * FROM sessions")
            .get()
            .token_hash.includes(cookie.split("=")[1]),
        );
      },
    );
    await t.test(
      "admin listing filters, pagination, media, dashboard and audit respond correctly",
      async () => {
        for (const kind of ["hotel", "tour"]) {
          const list = await call(
            `/api/admin/content?kind=${kind}&status=published&q=&page=1`,
          );
          assert.equal(list.status, 200, list.text);
          const data = JSON.parse(list.text);
          assert.equal(data.total, kind === "hotel" ? 129 : 2);
          assert(
            data.items.every(
              (item) => item.kind === kind && item.status === "published",
            ),
          );
        }
        const filtered = await call(
          "/api/admin/content?kind=hotel&status=published&q=Cappadocia&page=2",
        );
        assert.equal(filtered.status, 200, filtered.text);
        assert.equal(JSON.parse(filtered.text).page, 2);
        for (const path of [
          "/media?q=Cave&page=1",
          "/dashboard",
          "/audit?page=1",
        ]) {
          const result = await call("/api/admin" + path);
          assert.equal(result.status, 200, result.text);
        }
      },
    );
    await t.test("authenticated writes require origin and CSRF", async () => {
      assert.equal(
        (
          await call("/api/admin/content", {
            method: "POST",
            body: {},
            token: "wrong",
          })
        ).status,
        403,
      );
      assert.equal(
        (
          await call("/api/admin/content", {
            method: "POST",
            body: {},
            origin: "https://untrusted.invalid",
          })
        ).status,
        403,
      );
    });
    await t.test("draft creation is persistent but not public", async () => {
      const data = {
        name: "Test Cave Hotel",
        slug: "test-cave-hotel",
        city: "Nevşehir",
        district: "Göreme",
        blurb: "Test hotel description with sufficient information.",
        internalNotes: "PRIVATE-NOTE-MUST-NOT-LEAK",
        img: sourceCatalog.hotels[0].img,
        gallery: [sourceCatalog.hotels[0].img],
        amenities: ["wifi"],
        rooms: [
          {
            id: "room-test",
            name: "Suite Room",
            capacity: 3,
            concept: "Breakfast",
            description: "Room details.",
          },
        ],
      };
      const r = await call("/api/admin/content", {
        method: "POST",
        body: { kind: "hotel", status: "draft", data },
      });
      assert.equal(r.status, 201, r.text);
      record = JSON.parse(r.text);
      assert.equal(store.get(record.id).data.name, data.name);
      assert(!store.catalog().hotels.find((h) => h.slug === data.slug));
      const publicResponse = await call("/oteller/test-cave-hotel");
      assert.equal(publicResponse.status, 404);
      assert(!publicResponse.text.includes(data.internalNotes));
      assert.equal(
        (
          await call(`/oteller/test-cave-hotel?onizleme=${record.id}`, {
            auth: false,
          })
        ).status,
        302,
      );
      const preview = await call(
        `/oteller/test-cave-hotel?onizleme=${record.id}`,
      );
      assert.equal(preview.status, 200);
      assert(preview.text.includes("noindex,nofollow"));
      assert(!preview.text.includes(data.internalNotes));
    });
    await t.test(
      "publication validates required fields, URLs and gallery ownership",
      async () => {
        let r = await call(`/api/admin/content/${record.id}`, {
          method: "PUT",
          body: {
            ...record,
            status: "published",
            data: { ...record.data, img: "", gallery: [] },
          },
        });
        assert.equal(r.status, 422);
        r = await call(`/api/admin/content/${record.id}`, {
          method: "PUT",
          body: {
            ...record,
            data: { ...record.data, maps: "javascript:alert(1)" },
          },
        });
        assert.equal(r.status, 422);
        r = await call(`/api/admin/content/${record.id}`, {
          method: "PUT",
          body: {
            ...record,
            data: { ...record.data, img: "/uploads/nonexistent.webp" },
          },
        });
        assert.equal(r.status, 422);
      },
    );
    await t.test(
      "publication updates HTML, catalogue and sitemap without rebuild",
      async () => {
        const r = await call(`/api/admin/content/${record.id}`, {
          method: "PUT",
          body: {
            ...record,
            status: "published",
            data: {
              ...record.data,
              seoTitle: "Custom Search Title",
              seoDescription: "Custom search description.",
            },
          },
        });
        assert.equal(r.status, 200, r.text);
        record = JSON.parse(r.text);
        const page = await call("/oteller/test-cave-hotel");
        assert.equal(page.status, 200);
        assert(page.text.includes("Custom Search Title"));
        assert(page.text.includes("Suite Room"));
        assert(!page.text.includes("PRIVATE-NOTE-MUST-NOT-LEAK"));
        assert(
          (await call("/sitemap.xml")).text.includes(
            "/oteller/test-cave-hotel/",
          ),
        );
        assert(
          !(await call("/api/catalog")).text.includes(
            "PRIVATE-NOTE-MUST-NOT-LEAK",
          ),
        );
      },
    );
    await t.test(
      "duplicate slugs and stale saves do not overwrite content",
      async () => {
        assert.equal(
          (
            await call("/api/admin/content", {
              method: "POST",
              body: { kind: "hotel", status: "draft", data: record.data },
            })
          ).status,
          409,
        );
        assert.equal(
          (
            await call(`/api/admin/content/${record.id}`, {
              method: "PUT",
              body: { ...record, version: record.version - 1 },
            })
          ).status,
          409,
        );
        const revisions = JSON.parse(
          (await call(`/api/admin/content/${record.id}/revisions`)).text,
        );
        assert.equal(revisions.items.length, 1);
        const old = JSON.parse(
          (
            await call(
              `/api/admin/content/${record.id}/revisions/${revisions.items[0].id}`,
            )
          ).text,
        );
        assert.equal(old.status, "draft");
      },
    );
    await t.test(
      "uploads are decoded and re-encoded, invalid images rejected",
      async () => {
        const input = await sharp({
          create: { width: 32, height: 24, channels: 3, background: "#3562a4" },
        })
          .png()
          .toBuffer();
        const r = await call("/api/admin/media", {
          method: "POST",
          body: input,
          raw: true,
        });
        assert.equal(r.status, 201, r.text);
        const img = JSON.parse(r.text);
        assert.match(img.path, /^\/uploads\/[a-f0-9-]+\.webp$/);
        assert.equal(img.width, 32);
        assert.equal((await call(img.path, { auth: false })).status, 200);
        assert.equal(
          (
            await call("/api/admin/media", {
              method: "POST",
              raw: true,
              body: Buffer.from('<svg onload="alert(1)"></svg>'),
            })
          ).status,
          422,
        );
      },
    );
    await t.test("tour program and services can be published", async () => {
      const data = {
        slug: "test-cappadocia-tour",
        title: "Test Cappadocia Tour",
        city: "Nevşehir",
        duration: "1 Gün",
        shortDesc: "A full-day test tour for automated validation.",
        img: sourceCatalog.tours[0].img,
        gallery: [sourceCatalog.tours[0].img],
        itinerary: [
          { day: 1, title: "Test day", text: "Detailed tour program." },
        ],
        includes: ["Rehber"],
        excludes: ["Ulaşım"],
        terms: [],
        tourRoutes: [],
      };
      const r = await call("/api/admin/content", {
        method: "POST",
        body: { kind: "tour", status: "published", data },
      });
      assert.equal(r.status, 201, r.text);
      assert(store.catalog().tours.find((t) => t.slug === data.slug));
      const page = await call("/turlar/test-cappadocia-tour");
      assert.equal(page.status, 200);
      assert(page.text.includes("Detailed tour program."));
      assert(page.text.includes("Dahil olmayanlar"));
    });
    await t.test(
      "archiving removes every public route while keeping history",
      async () => {
        const r = await call(`/api/admin/content/${record.id}`, {
          method: "PUT",
          body: { ...record, status: "archived" },
        });
        assert.equal(r.status, 200);
        record = JSON.parse(r.text);
        assert.equal((await call("/oteller/test-cave-hotel")).status, 404);
        assert(
          !(await call("/sitemap.xml")).text.includes(
            "/oteller/test-cave-hotel/",
          ),
        );
        assert(
          !store.catalog().hotels.find((h) => h.slug === record.data.slug),
        );
        assert.equal(store.get(record.id).status, "archived");
        // Generated static HTML must never bypass the dynamic publication gate.
        assert.equal(
          (await call("/oteller/test-cave-hotel/index.html")).status,
          404,
        );
        assert.equal((await call("/shell.html")).status, 404);
      },
    );
    await t.test("backup export excludes authentication secrets", async () => {
      const r = await call("/api/admin/export");
      assert.equal(r.status, 200);
      assert.match(r.headers.get("content-disposition"), /attachment/);
      assert(!r.text.includes("password_hash"));
      assert(!r.text.includes(password));
    });
    await t.test("logout revokes the server session", async () => {
      assert.equal(
        (await call("/api/admin/logout", { method: "POST" })).status,
        200,
      );
      assert.equal((await call("/api/admin/session")).status, 401);
    });
    await t.test("login rate limit blocks repeated failures", async () => {
      for (let i = 0; i < 10; i++)
        assert.equal(
          (
            await call("/api/admin/login", {
              method: "POST",
              auth: false,
              body: { username: "unknown", password: "wrong" },
            })
          ).status,
          401,
        );
      assert.equal(
        (
          await call("/api/admin/login", {
            method: "POST",
            auth: false,
            body: { username: "unknown", password: "wrong" },
          })
        ).status,
        429,
      );
    });
    await t.test("restart retains edited data and does not reseed", () => {
      const other = openStore(directory);
      assert.equal(other.get(record.id).status, "archived");
      assert.equal(
        other.db.prepare("SELECT COUNT(*) AS count FROM content").get().count,
        133,
      );
      other.close();
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    store.close();
    await rm(directory, { recursive: true, force: true });
  }
});
