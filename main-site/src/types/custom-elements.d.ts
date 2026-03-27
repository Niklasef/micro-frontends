import type React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "search-component": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        class?: string;
        className?: string;
      };
    }
  }
}

export {};