import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Harmonium Blog",
  description:
    "Articles for play harmonium online, learn harmonium free, and harmonium notes for beginners.",
};

export default function BlogPage() {
  const totalKeywords = blogPosts.length;

  return (
    <main className="content-wrap px-2 py-8 md:py-12">
      <section className="glass-panel rounded-3xl p-6 md:p-10">
        <h1 className="text-3xl font-bold md:text-4xl">Harmonium Learning Blog</h1>
        <p className="mt-3 text-zinc-300">
          SEO-focused practical lessons with links back to the interactive harmonium player.
        </p>
        <p className="mt-2 text-sm text-zinc-400">{totalKeywords} keyword-focused dynamic articles</p>
        <div className="mt-8 grid gap-4">
          {blogPosts.map((post) => (
            <article key={post.slug} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold text-amber-300">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="mt-1 text-xs uppercase tracking-wide text-zinc-400">{post.category}</p>
              <p className="mt-2 text-sm text-zinc-300">{post.description}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm text-zinc-300">
          Go to <Link href="/">Home Player</Link> to apply each lesson live.
        </p>
      </section>
    </main>
  );
}
