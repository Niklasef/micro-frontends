/**
 * Minimal definition of the <search-input> custom element.
 *
 * • No styles and no Shadow DOM are used (the input stays in light-DOM).
 * • If the author placed an <input> inside the element the component
 *   leaves it untouched. Otherwise one is created automatically.
 */
class SearchInputElement extends HTMLElement {
  /** guard so connectedCallback only runs once */
  private _initialised = false;

  connectedCallback() {
    if (this._initialised) return;
    this._initialised = true;

    // Ensure there is exactly one <input type="search"> child
    let input = this.querySelector("input");
    if (!input) {
      input = document.createElement("input");
      input.type = "search";
      input.placeholder = "Search…";
      this.appendChild(input);
    } else if (input instanceof HTMLInputElement) {
      input.type = "search";
    }
  }
}

// Register once, even if this script is executed multiple times.
if (!customElements.get("search-input")) {
  customElements.define("search-input", SearchInputElement);
}
