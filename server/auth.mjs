import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
import { HttpError } from "./validation.mjs";
const scrypt = promisify(scryptCallback);
export const digest = (value) =>
  createHash("sha256").update(value).digest("hex");
export async function passwordHash(password) {
  if (
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 128
  )
    throw new HttpError(422, "Şifre 12–128 karakter olmalı.");
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64, {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return `${salt}:${hash.toString("hex")}`;
}
export async function passwordMatches(password, stored) {
  if (typeof password !== "string" || password.length > 128) return false;
  const [salt, expected] = stored.split(":");
  const actual = await scrypt(password, salt, 64, {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  const other = Buffer.from(expected, "hex");
  return other.length === actual.length && timingSafeEqual(actual, other);
}
export function authentication(store, { origin, secure }) {
  const cookieName = "ekonomikotel_admin";
  const cookieOptions = {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 12 * 60 * 60 * 1000,
  };
  function session(req) {
    const token = (req.headers.cookie || "")
      .split(";")
      .map((p) => p.trim())
      .find((p) => p.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1);
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
    return store.db
      .prepare(
        "SELECT s.*,u.username,u.name FROM sessions s JOIN users u ON s.user_id=u.id WHERE token_hash=? AND expires_at>?",
      )
      .get(digest(token), Date.now());
  }
  function requireSession(req, res, next) {
    const active = session(req);
    if (!active)
      throw new HttpError(401, "Oturumunuz sona erdi. Tekrar giriş yapın.");
    req.session = active;
    next();
  }
  function sameOrigin(req, res, next) {
    if (req.get("origin") !== origin)
      throw new HttpError(403, "İstek kaynağı doğrulanamadı.");
    next();
  }
  function csrf(req, res, next) {
    if (req.get("x-csrf-token") !== req.session.csrf)
      throw new HttpError(
        403,
        "Oturum doğrulaması başarısız. Sayfayı yenileyin.",
      );
    next();
  }
  const clear = (res) =>
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
    });
  async function login(req, res) {
    const username = String(req.body?.username || "")
        .trim()
        .slice(0, 120),
      password = req.body?.password;
    const now = Date.now(),
      keys = [
        `ip:${digest(req.ip || "local")}`,
        `user:${digest(username.toLowerCase())}`,
      ];
    store.db.prepare("DELETE FROM login_attempts WHERE reset_at<=?").run(now);
    for (const key of keys) {
      const row = store.db
        .prepare("SELECT * FROM login_attempts WHERE key=?")
        .get(key);
      if (row && row.reset_at > now && row.attempts >= 10) {
        res.set("Retry-After", String(Math.ceil((row.reset_at - now) / 1000)));
        throw new HttpError(
          429,
          "Çok fazla deneme yapıldı. 15 dakika sonra tekrar deneyin.",
        );
      }
    }
    for (const key of keys)
      store.db
        .prepare(
          "INSERT INTO login_attempts VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN reset_at>? THEN attempts+1 ELSE 1 END,reset_at=CASE WHEN reset_at>? THEN reset_at ELSE excluded.reset_at END",
        )
        .run(key, now + 900000, now, now);
    const user = store.db
      .prepare("SELECT * FROM users WHERE username=?")
      .get(username);
    const dummy = "0".repeat(32) + ":" + "0".repeat(128);
    const valid = await passwordMatches(password, user?.password_hash || dummy);
    if (!user || !valid) {
      store.audit("Giriş", "auth.failed", "Başarısız giriş");
      throw new HttpError(401, "Kullanıcı adı veya şifre hatalı.");
    }
    const token = randomBytes(32).toString("hex"),
      csrfToken = randomBytes(24).toString("hex");
    store.transaction(() => {
      for (const key of keys)
        store.db.prepare("DELETE FROM login_attempts WHERE key=?").run(key);
      store.db.prepare("DELETE FROM sessions WHERE expires_at<=?").run(now);
      store.db.prepare("DELETE FROM login_attempts WHERE reset_at<=?").run(now);
      store.db
        .prepare("INSERT INTO sessions VALUES(?,?,?,?)")
        .run(digest(token), user.id, csrfToken, now + cookieOptions.maxAge);
      store.audit(user.username, "auth.login", "Yönetici girişi");
    });
    res.cookie(cookieName, token, cookieOptions).json({
      user: { username: user.username, name: user.name },
      csrf: csrfToken,
    });
  }
  return { session, requireSession, sameOrigin, csrf, clear, login };
}
