import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn Harmonium",
  description: "Learn harmonium free with step-by-step guides, fingering drills, and rhythm practice.",
};

const lessons = [
  {
    title: "Beginner Alankars",
    detail: "Daily finger control drills in 3 tempos with metronome references.",
  },
  {
    title: "Scale Shifting",
    detail: "Practice moving Sa across C to B while preserving interval quality.",
  },
  {
    title: "Accompaniment Basics",
    detail: "Use simple chords and sustained airflow for bhajan and ghazal support.",
  },
];

export default function LearnPage() {
  return (
    <main className="content-wrap px-2 py-8 md:py-12">
      <div className="glass-panel rounded-3xl p-6 md:p-10">
        <h1 className="text-3xl font-bold md:text-4xl">Learn Harmonium Free</h1>
        <p className="mt-3 max-w-2xl text-zinc-300">
          Follow focused lessons and then apply each concept directly in our interactive player.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {lessons.map((lesson) => (
            <article key={lesson.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold">{lesson.title}</h2>
              <p className="mt-2 text-sm text-zinc-300">{lesson.detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/">Start Playing</Link>
          <span className="text-zinc-400">|</span>
          <Link href="/blog">Read Blog Articles</Link>
          <span className="text-zinc-400">|</span>
          <Link href="/ragas-library">Explore Ragas</Link>
        </div>
      </div>
    </main>
  );
}
