"use client";

type HomeClientProps = {
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
}: HomeClientProps) {
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
