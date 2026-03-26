import React from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "./App";

/**
 * Web-component wrapper that mounts the React app into its own shadow DOM.
 */
class SearchComponentElement extends HTMLElement {
  private _root?: Root;

  connectedCallback() {
    if (this._root) return; // already mounted

    const mountPoint = this.attachShadow({ mode: "open" });
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
