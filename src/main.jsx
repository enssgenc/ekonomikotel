import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { IconContext } from "@phosphor-icons/react";
import App from "./App.jsx";
import { CatalogContext } from "./CatalogContext.jsx";
import "./styles.css";
import "./refinements.css";
async function start() {
  const embedded = document.getElementById("catalog-data");
  const catalog = embedded
    ? JSON.parse(embedded.textContent)
    : await fetch("/api/catalog").then((r) => {
        if (!r.ok) throw new Error("Katalog yüklenemedi.");
        return r.json();
      });
  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter>
        <IconContext.Provider
          value={{ size: 21, weight: "regular", "aria-hidden": true }}
        >
          <CatalogContext.Provider value={catalog}>
            <App />
          </CatalogContext.Provider>
        </IconContext.Provider>
      </BrowserRouter>
    </React.StrictMode>,
  );
}
start().catch(() => {
  document.getElementById("root").textContent =
    "Katalog şu anda yüklenemedi. Lütfen sayfayı yenileyin.";
});
