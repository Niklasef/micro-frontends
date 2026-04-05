"use client";

import { useEffect, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";

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

function SearchSSR() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const markup = await fetch("http://localhost:4321/").then((r) =>
          r.text()
        );

        if (cancelled || !containerRef.current) return;
        if (typeof (containerRef.current as any).setHTMLUnsafe === "function") {
          (containerRef.current as any).setHTMLUnsafe(markup);
        } else {
          containerRef.current.innerHTML = markup;
        }

        /* load & register the <search-input> element so it becomes interactive */
        try {
          await import(
            "http://localhost:4321/src/components/SearchInputElement.ts"
          );
        } catch (err) {
          console.error(err);
        }
      } catch (err) {
        console.error(err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return <div ref={containerRef} />;
}

export default function HomeClient({
  userName,
  userEmail,
  isAuthenticated,
  session,
}: HomeClientProps) {
  // const { data: session } = useSession();

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

            <SearchSSR />
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
