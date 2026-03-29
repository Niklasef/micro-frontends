import PocElement from "../components/PocElement";

export default function Home() {
  return (
    <PocElement>
      <section className="text-center">
        <h1 className="text-3xl font-bold">PoC Next.js App</h1>
        <p className="mt-4 text-zinc-600">
          This is a brand-new Next.js application living in <code>/poc</code>.
        </p>
      </section>
    </PocElement>
  );
}
