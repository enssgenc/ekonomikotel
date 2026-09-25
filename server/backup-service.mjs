import { backup, DatabaseSync } from "node:sqlite";
import {
  mkdir,
  cp,
  readdir,
  readFile,
  writeFile,
  rename,
} from "node:fs/promises";
import { resolve, join, relative } from "node:path";
import { randomUUID, createHash } from "node:crypto";
export function createBackupService(
  store,
  root = process.env.BACKUP_DIR || join(store.directory, "backups"),
) {
  root = resolve(root);
  let running = null,
    timer;
  const config = () => ({
    enabled: true,
    intervalHours: 24,
    ...JSON.parse(
      store.db.prepare("SELECT data FROM settings WHERE key='backup'").get()
        ?.data || "{}",
    ),
  });
  const status = () => ({
    config: config(),
    running: !!running,
    items: store.db
      .prepare(
        "SELECT id,status,bytes,error,created_at,completed_at FROM backups ORDER BY created_at DESC LIMIT 20",
      )
      .all(),
    storage: root,
  });
  async function perform(id) {
    const temporary = join(root, `${id}.partial`),
      target = join(root, id);
    try {
      await mkdir(temporary, { recursive: true, mode: 0o700 });
      await backup(store.db, join(temporary, "ekonomikotel.sqlite"));
      const verify = new DatabaseSync(join(temporary, "ekonomikotel.sqlite"), {
        readOnly: true,
      });
      try {
        if (
          verify.prepare("PRAGMA integrity_check").get().integrity_check !==
          "ok"
        )
          throw new Error("Veritabanı bütünlük kontrolü başarısız.");
      } finally {
        verify.close();
      }
      await cp(join(store.directory, "uploads"), join(temporary, "uploads"), {
        recursive: true,
      });
      const files = [];
      async function walk(dir) {
        for (const entry of await readdir(dir, { withFileTypes: true })) {
          const path = join(dir, entry.name);
          if (entry.isDirectory()) await walk(path);
          else if (entry.isFile()) {
            const bytes = await readFile(path);
            files.push({
              path: relative(temporary, path),
              bytes: bytes.length,
              sha256: createHash("sha256").update(bytes).digest("hex"),
            });
          }
        }
      }
      await walk(temporary);
      await writeFile(
        join(temporary, "manifest.json"),
        JSON.stringify(
          {
            format: "ekonomikotel-backup-v1",
            createdAt: new Date().toISOString(),
            files,
          },
          null,
          2,
        ),
        { mode: 0o600 },
      );
      await rename(temporary, target);
      store.db
        .prepare(
          "UPDATE backups SET status='complete',path=?,bytes=?,completed_at=? WHERE id=?",
        )
        .run(
          target,
          files.reduce((n, f) => n + f.bytes, 0),
          new Date().toISOString(),
          id,
        );
      store.audit(
        "Sistem",
        "backup.complete",
        "Veritabanı ve görseller yedeklendi",
      );
    } catch (error) {
      store.db
        .prepare(
          "UPDATE backups SET status='failed',error=?,completed_at=? WHERE id=?",
        )
        .run(String(error.message).slice(0, 500), new Date().toISOString(), id);
    }
  }
  const run = () => {
    if (running) return running;
    const id =
      new Date().toISOString().replace(/[:.]/g, "-") +
      "-" +
      randomUUID().slice(0, 8);
    store.db
      .prepare(
        "INSERT INTO backups(id,status,created_at) VALUES(?,'running',?)",
      )
      .run(id, new Date().toISOString());
    running = perform(id).finally(() => {
      running = null;
    });
    return running;
  };
  const tick = () => {
    if (!config().enabled || running) return;
    const last = store.db
      .prepare(
        "SELECT created_at FROM backups ORDER BY created_at DESC LIMIT 1",
      )
      .get();
    if (
      !last ||
      Date.now() - Date.parse(last.created_at) >=
        config().intervalHours * 3600000
    )
      void run();
  };
  return {
    status,
    run,
    tick,
    start() {
      store.db
        .prepare(
          "UPDATE backups SET status='failed',error='Sunucu yeniden başladı; yeni yedek alın.' WHERE status='running'",
        )
        .run();
      tick();
      timer = setInterval(tick, 60000);
      timer.unref();
    },
    async stop() {
      clearInterval(timer);
      await running;
    },
  };
}
