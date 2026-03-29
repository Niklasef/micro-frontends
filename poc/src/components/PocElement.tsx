"use client";

import { ReactNode, useEffect } from "react";

/**
 * Registers the <poc-element> custom element in the browser
 * and simply renders its children inside it.
 */
export default function PocElement({ children }: { children: ReactNode }) {
  /* register the element on first client render */
  useEffect(() => {
    if (typeof window !== "undefined" && !customElements.get("poc-element")) {
      class PocElementEl extends HTMLElement {}
      customElements.define("poc-element", PocElementEl);
    }
  }, []);

  return <poc-element>{children}</poc-element>;
}
