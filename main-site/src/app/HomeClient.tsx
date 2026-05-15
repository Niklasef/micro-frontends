"use client";

import { signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { useEffect, useState } from "react";


type HomeClientProps = {
  userName: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  session: Session
};

const PRODUCTS = [
  "Product A",
  "Product B",
  "Product C",
  "Product D",
  "Product E",
  "Product F",
];

export default function HomeClient({
  userName,
  userEmail,
  isAuthenticated,
  session,
}: HomeClientProps) {

  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    setShowSearch(true);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <div className="text-lg font-semibold whitespace-nowrap">Generic Store</div>

          <nav className="hidden md:flex gap-6 text-sm text-zinc-600">
            <a href="#" className="hover:text-black">
              Home
            </a>
            <a href="#" className="hover:text-black">
              Products
            </a>
            <a href="#" className="hover:text-black">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <button
              onClick={() => signOut()}
              className="text-sm border rounded px-3 py-2 bg-white hover:bg-zinc-100 whitespace-nowrap"
              >
              Logout
              </button>
            ) : (
                <button
                onClick={() => signIn("keycloak")}
                className="text-sm border rounded px-3 py-2 bg-black text-white hover:bg-zinc-800 whitespace-nowrap"
                >
                Login
                </button>
            )}

            {showSearch && <search-component className="w-72 block" />}
          </div>
        </div>
      </header>

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Simple Product Platform</h1>
          <p className="text-zinc-600 max-w-xl mx-auto">A minimal demo site</p>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold mb-8">Featured Products</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {PRODUCTS.map((product) => (
              <div key={product} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="h-32 bg-zinc-100 rounded mb-4" />
                <h3 className="font-medium mb-2">{product}</h3>
                <p className="text-sm text-zinc-600 mb-4">
                  Placeholder description for {product}.
                </p>
                <button className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-zinc-800">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-zinc-500 text-center">
          © 2026 Generic Store – Demo Application
        </div>
      </footer>
    </div>
  );
}
