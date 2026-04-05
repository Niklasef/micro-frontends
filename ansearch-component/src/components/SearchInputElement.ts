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

    /* --- interactive autocomplete logic --- */
    const input = shadow.querySelector("input") as HTMLInputElement | null;
    const dropdown = shadow.querySelector("[data-dropdown]") as HTMLElement | null;
    const statusEl = shadow.querySelector("[data-status]") as HTMLElement | null;
    const resultsEl = shadow.querySelector("[data-results]") as HTMLElement | null;

    if (!input || !dropdown || !statusEl || !resultsEl) return;

    let debounceTimer: number | null = null;
    let abortController: AbortController | null = null;

    const closeDropdown = () => {
      dropdown.classList.add("hidden");
    };

    const openDropdown = () => {
      dropdown.classList.remove("hidden");
    };

    function renderResults(suggestions: string[], recentOrders: any[]) {
      resultsEl.innerHTML = "";

      if (suggestions.length) {
        const ul = document.createElement("ul");
        suggestions.forEach((item) => {
          const li = document.createElement("li");
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className =
            "w-full text-left px-3 py-2 text-sm hover:bg-zinc-100";
          btn.textContent = item;
          btn.onmousedown = (e) => e.preventDefault();
          btn.onclick = () => {
            input.value = item;
            closeDropdown();
          };
          li.appendChild(btn);
          ul.appendChild(li);
        });
        resultsEl.appendChild(ul);
      }

      if (recentOrders.length) {
        if (suggestions.length) {
          const divider = document.createElement("div");
          divider.className = "border-t";
          resultsEl.appendChild(divider);
        }

        const header = document.createElement("div");
        header.className =
          "px-3 py-2 text-xs text-zinc-500 bg-zinc-50 border-b";
        header.textContent = "Your latest orders";
        resultsEl.appendChild(header);

        const ul = document.createElement("ul");
        recentOrders.forEach((order: any) => {
          const li = document.createElement("li");
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "w-full text-left px-3 py-3 hover:bg-zinc-100";
          btn.onmousedown = (e) => e.preventDefault();
          btn.onclick = () => {
            input.value = order.title;
            closeDropdown();
          };

          const title = document.createElement("div");
          title.className = "text-sm font-medium text-zinc-900";
          title.textContent = order.title;

          const subtitle = document.createElement("div");
          subtitle.className = "text-xs text-zinc-500 mt-0.5";
          subtitle.textContent = order.subtitle;

          btn.appendChild(title);
          btn.appendChild(subtitle);
          li.appendChild(btn);
          ul.appendChild(li);
        });
        resultsEl.appendChild(ul);
      }
    }

    async function search(q: string) {
      abortController?.abort();
      const controller = new AbortController();
      abortController = controller;

      statusEl.textContent = "Searching…";
      openDropdown();

      try {
        const res = await fetch(
          `http://localhost:3001/search-autocomplete?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        const suggestions = Array.isArray(data.suggestions)
          ? data.suggestions
          : [];
        const recentOrders = Array.isArray(data.recentOrders)
          ? data.recentOrders
          : [];

        statusEl.textContent = "Suggestions";
        renderResults(suggestions, recentOrders);

        if (!suggestions.length && !recentOrders.length) {
          closeDropdown();
        } else {
          openDropdown();
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
          closeDropdown();
        }
      }
    }

    input.addEventListener("input", () => {
      const value = input.value.trim();

      if (debounceTimer) clearTimeout(debounceTimer);

      if (!value) {
        closeDropdown();
        resultsEl.innerHTML = "";
        return;
      }

      debounceTimer = window.setTimeout(() => {
        search(value);
      }, 300);
    });

    input.addEventListener("focus", () => {
      if (resultsEl.children.length) openDropdown();
    });

    input.addEventListener("blur", () => {
      setTimeout(closeDropdown, 120);
    });
  }
}

if (!customElements.get("search-input")) {
  customElements.define("search-input", SearchInputElement);
}
