import * as React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "poc-element": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
