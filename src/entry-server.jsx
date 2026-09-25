import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { IconContext } from "@phosphor-icons/react";
import App from "./App.jsx";
export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <IconContext.Provider
        value={{ size: 21, weight: "regular", "aria-hidden": true }}
      >
        <App />
      </IconContext.Provider>
    </StaticRouter>,
  );
}
