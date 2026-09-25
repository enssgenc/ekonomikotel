import { backup } from "node:sqlite";
import { resolve } from "node:path";
import { mkdirSync, cpSync, existsSync } from "node:fs";
import { openStore } from "./store.mjs";
const directory = resolve(process.env.DATA_DIR || "data");
const target = resolve(
  process.argv[2] ||
    resolve(
      directory,
      `backups/${new Date().toISOString().replace(/[:.]/g, "-")}`,
    ),
);
if (!existsSync(resolve(directory, "ekonomikotel.sqlite")))
  throw new Error(
    "Existing database not found. Check DATA_DIR before backing up.",
  );
if (existsSync(target))
  throw new Error("Backup target already exists. Choose a new directory.");
const store = openStore(directory);
try {
  mkdirSync(target, { recursive: true, mode: 0o700 });
  await backup(store.db, resolve(target, "ekonomikotel.sqlite"));
  cpSync(resolve(directory, "uploads"), resolve(target, "uploads"), {
    recursive: true,
  });
  console.log(`Database and uploaded images backed up to ${target}`);
} finally {
  store.close();
}
