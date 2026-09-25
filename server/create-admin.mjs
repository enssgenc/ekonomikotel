import { randomBytes, randomUUID } from "node:crypto";
import { resolve, join } from "node:path";
import { writeFileSync } from "node:fs";
import { openStore } from "./store.mjs";
import { passwordHash } from "./auth.mjs";
const username = process.env.ADMIN_USERNAME || "yonetici";
if (!/^[a-zA-Z0-9._-]{3,60}$/.test(username))
  throw new Error(
    "ADMIN_USERNAME must contain 3–60 letters, numbers, dots, hyphens or underscores.",
  );
const store = openStore(resolve(process.env.DATA_DIR || "data"));
try {
  if (store.db.prepare("SELECT 1 FROM users LIMIT 1").get()) {
    if (!process.argv.includes("--if-missing"))
      throw new Error(
        "An administrator already exists. This command never replaces existing credentials.",
      );
    console.log("Existing administrator preserved.");
  } else {
    const password =
      process.env.ADMIN_PASSWORD || randomBytes(18).toString("base64url");
    const hash = await passwordHash(password);
    const file = resolve(
      process.env.ADMIN_CREDENTIALS_FILE ||
        join(store.directory, "admin-access.txt"),
    );
    writeFileSync(
      file,
      `Ekonomikotel yönetici girişi\nAdres: /admin\nKullanıcı adı: ${username}\nŞifre: ${password}\n\nBu dosya özeldir. Paylaşmayın veya Git'e eklemeyin.\n`,
      { mode: 0o600, flag: "wx" },
    );
    store.db
      .prepare("INSERT INTO users VALUES(?,?,?,?,?)")
      .run(
        randomUUID(),
        username,
        process.env.ADMIN_NAME || "Ekonomikotel Yöneticisi",
        hash,
        new Date().toISOString(),
      );
    store.audit("Sistem", "account.create", "İlk yönetici");
    console.log(
      `Administrator created. Credentials saved privately to ${file}; values are not printed.`,
    );
  }
} finally {
  store.close();
}
