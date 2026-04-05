import styles from "../styles/tailwind.css?inline";

/**
 * Definition of the <search-input> custom element that works
 * with Declarative Shadow DOM (DSD) and injects compiled Tailwind
 * CSS utilities into the shadow-root so the `class` attributes
 * written in the server markup are actually styled.
 */
class SearchInputElement extends HTMLElement {
  connectedCallback() {
    /* Ensure the element ends up with a shadow-root. If the browser
       doesn't support DSD we need to create one and move the template
       contents into it. */
    let shadow = this.shadowRoot;
    if (!shadow) {
      const tmpl = this.querySelector<HTMLTemplateElement>(
        "template[shadowrootmode]"
      );
      if (tmpl) {
        shadow = this.attachShadow({ mode: "open" });
        shadow.appendChild(tmpl.content.cloneNode(true));
        tmpl.remove();
      } else {
        shadow = this.attachShadow({ mode: "open" });
      }
    }

    /* Inject Tailwind utilities once per element */
    if (shadow && !shadow.querySelector("style[data-tailwind]")) {
      const styleTag = document.createElement("style");
      styleTag.textContent = styles;
      styleTag.setAttribute("data-tailwind", "");
      shadow.prepend(styleTag);
    }
  }
}

if (!customElements.get("search-input")) {
  customElements.define("search-input", SearchInputElement);
}
