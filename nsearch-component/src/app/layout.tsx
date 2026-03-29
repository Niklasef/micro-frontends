import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nsearch-component demo",
  description: "Bare-bones Next.js project for search component experimentation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
