import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { IconContext } from "@phosphor-icons/react";
import App from "./App.jsx";
import "./styles.css";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <IconContext.Provider
        value={{ size: 21, weight: "regular", "aria-hidden": true }}
      >
        <App />
      </IconContext.Provider>
    </BrowserRouter>
  </React.StrictMode>,
);
