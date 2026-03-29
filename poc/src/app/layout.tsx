import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "PoC",
  description: "Proof-of-Concept Next.js application",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen flex items-center justify-center p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
