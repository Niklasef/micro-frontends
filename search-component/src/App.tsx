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

export default function App() {
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
        setRecentOrders(
          Array.isArray(data.recentOrders) ? data.recentOrders : []
        );
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
    <div className="w-72 relative" style={{ fontFamily: "sans-serif" }}>
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

      {open && (loading || hasResults) && (
        <div className="absolute mt-2 w-full rounded-md border bg-white shadow-lg overflow-hidden z-20">
          <div className="px-3 py-2 text-xs text-zinc-500 bg-zinc-50 border-b">
            {loading ? "Searching..." : "Suggestions"}
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
  );
}
