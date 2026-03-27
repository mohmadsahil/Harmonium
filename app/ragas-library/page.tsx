import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ragas Library",
  description: "Discover popular ragas, pakad phrases, and practical harmonium usage notes.",
};

const ragas = [
  { name: "Yaman", time: "Evening", aroha: "Ni Re Ga Ma(t) Dha Ni Sa" },
  { name: "Bhairav", time: "Morning", aroha: "Sa Re(k) Ga Ma Pa Dha(k) Ni Sa" },
  { name: "Kafi", time: "Late Evening", aroha: "Sa Re Ga(k) Ma Pa Dha Ni(k) Sa" },
  { name: "Hamsadhwani", time: "Concert Opening", aroha: "Sa Ri2 Ga3 Pa Ni3 Sa" },
];

export default function RagasPage() {
  return (
    <main className="content-wrap px-2 py-8 md:py-12">
      <section className="glass-panel rounded-3xl p-6 md:p-10">
        <h1 className="text-3xl font-bold md:text-4xl">Ragas Library</h1>
        <p className="mt-3 text-zinc-300">
          Quick references for common ragas. Pair these with drone mode in the main player for ear training.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {ragas.map((raga) => (
            <article key={raga.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold text-amber-300">{raga.name}</h2>
              <p className="mt-1 text-sm text-zinc-200">Best Time: {raga.time}</p>
              <p className="mt-2 text-sm text-zinc-300">Aroha: {raga.aroha}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm text-zinc-300">
          Continue with beginner content in <Link href="/learn-harmonium">Learn Harmonium</Link>.
        </p>
      </section>
    </main>
  );
}
