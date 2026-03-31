/**
 * Minimal definition of the <search-input> custom element using
 * Declarative Shadow DOM (DSD).
 *
 * • On the server we emit a <template shadowroot="open"> (see
 *   SearchInput.astro). Browsers that support DSD will upgrade it
 *   automatically, giving us a populated `shadowRoot` when
 *   connectedCallback runs.
 *
 * • On browsers that do NOT support DSD (e.g. Safari), `shadowRoot`
 *   will be undefined. We detect that case, find the template and
 *   attach the shadow root manually to replicate the same markup.
 */
class SearchInputElement extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;

    const template = this.querySelector<HTMLTemplateElement>(
      "template[shadowrootmode]"
    );

    if (template) {
      const mode = (template.getAttribute("shadowrootmode") ?? "open") as
        | "open"
        | "closed";

      const shadow = this.attachShadow({ mode });
      shadow.appendChild(template.content.cloneNode(true));

      // optional: remove inert fallback template after cloning
      template.remove();
    }
  }
}

if (!customElements.get("search-input")) {
  customElements.define("search-input", SearchInputElement);
}