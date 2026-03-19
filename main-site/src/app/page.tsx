"use client";

import { useEffect, useRef, useState } from "react";

type Suggestion = string;

type RecentOrder = {
  id: string;
  title: string;
  subtitle: string;
};

type SearchResponse = {
  suggestions: Suggestion[];
  recentOrders: RecentOrder[];
};

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
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();

    if (!q) {
      setFiltered([]);
      setRecentOrders([]);
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

        const data: SearchResponse = await res.json();

        setFiltered(Array.isArray(data.suggestions) ? data.suggestions : []);
        setRecentOrders(Array.isArray(data.recentOrders) ? data.recentOrders : []);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error(error);
          setFiltered([]);
          setRecentOrders([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const hasResults = filtered.length > 0 || recentOrders.length > 0;

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

          <div className="w-72 relative">
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
              className="w-full border rounded-md px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-zinc-200 pr-10"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1"
                onMouseDown={e => e.preventDefault()}
                onClick={() => {
                  setQuery("");
                  setFiltered([]);
                  setRecentOrders([]);
                  setOpen(false);
                }}
                tabIndex={-1}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}

            {open && (loading || hasResults) && (
              <div className="absolute mt-2 w-full rounded-md border bg-white shadow-lg overflow-hidden z-20">
                <div className="px-3 py-2 text-xs text-zinc-500 bg-zinc-50 border-b flex items-center gap-2">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-zinc-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Searching...
                    </>
                  ) : (
                    "Suggestions"
                  )}
                </div>

                {!loading && (
                  <div className="max-h-80 overflow-auto">
                    {filtered.length > 0 && (
                      <ul>
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

                    {recentOrders.length > 0 && (
                      <>
                        <div className="border-t" />
                        <div className="px-3 py-2 text-xs text-zinc-500 bg-zinc-50 border-b">
                          Your latest orders
                        </div>

                        <ul>
                          {recentOrders.map((order) => (
                            <li key={order.id}>
                              <button
                                type="button"
                                className="w-full text-left px-3 py-3 hover:bg-zinc-100"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setQuery(order.title);
                                  setOpen(false);
                                }}
                              >
                                <div className="text-sm font-medium text-zinc-900">
                                  {order.title}
                                </div>
                                <div className="text-xs text-zinc-500 mt-0.5">
                                  {order.subtitle}
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
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
