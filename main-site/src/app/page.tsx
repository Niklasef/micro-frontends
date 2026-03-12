"use client";

import { useEffect, useRef, useState } from "react";

type Suggestion = string;

const PRODUCTS = [
  "Product A",
  "Product B",
  "Product C",
  "Product D",
  "Product E",
  "Product F",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();

    if (!q) {
      setFiltered([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setLoading(true);

        const res = await fetch(
          `/api/search-autocomplete?q=${encodeURIComponent(q)}`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch autocomplete results");
        }

        const data = await res.json();

        // expects: { suggestions: string[] }
        setFiltered(Array.isArray(data.suggestions) ? data.suggestions : []);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error(error);
          setFiltered([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300); // debounce

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

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

          <div className="w-64 relative">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                setTimeout(() => setOpen(false), 120);
              }}
              placeholder="Search…"
              className="w-full border rounded-md px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-zinc-200"
            />

            {open && (loading || filtered.length > 0) && (
              <div className="absolute mt-2 w-full rounded-md border bg-white shadow-lg overflow-hidden z-20">
                <div className="px-3 py-2 text-xs text-zinc-500 bg-zinc-50 border-b">
                  {loading ? "Searching..." : "Suggestions"}
                </div>

                {!loading && (
                  <ul className="max-h-56 overflow-auto">
                    {filtered.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setQuery(item);
                            setOpen(false);
                          }}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
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
