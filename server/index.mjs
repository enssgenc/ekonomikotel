import { createBackupService } from "./backup-service.mjs";
import { resolve } from "node:path";
import { openStore } from "./store.mjs";
import { createApp } from "./app.mjs";
import { render } from "../.ssr/entry-server.js";
const production = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT) || 4173;
const origin = process.env.APP_ORIGIN || `http://127.0.0.1:${port}`;
if (production && (!process.env.DATA_DIR || !origin.startsWith("https://")))
  throw new Error("Production requires DATA_DIR and HTTPS APP_ORIGIN.");
const store = openStore(resolve(process.env.DATA_DIR || "data"));
const backups = createBackupService(store);
const app = createApp({
  backups,
  store,
  origin,
  secure: production,
  render,
  trustProxy: process.env.TRUST_PROXY === "1",
});
backups.start();
const server = app.listen(
  port,
  process.env.HOST || (production ? "0.0.0.0" : "127.0.0.1"),
  () => console.log(`Ekonomikotel ready: ${origin} (admin: /admin)`),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () =>
    server.close(async () => {
      await backups.stop();
      store.close();
      process.exit(0);
    }),
  );
