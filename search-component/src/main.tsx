import React from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "./App";
import styles from "./index.css?inline";

/**
 * Web-component wrapper that mounts the React app.
 */
class SearchComponentElement extends HTMLElement {
  private _root?: Root;

  connectedCallback() {
    if (this._root) return; // already mounted

    const mountPoint = document.createElement("div");
    this.appendChild(mountPoint);

    /* inject Tailwind CSS into the custom element so utility classes work */
    const styleTag = document.createElement("style");
    styleTag.textContent = styles;
    this.appendChild(styleTag);

    this._root = createRoot(mountPoint);
    this._root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }

  disconnectedCallback() {
    this._root?.unmount();
    this._root = undefined;
  }
}

if (!customElements.get("search-component")) {
  customElements.define("search-component", SearchComponentElement);
}