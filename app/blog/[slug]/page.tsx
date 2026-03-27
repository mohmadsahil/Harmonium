import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost, getRelatedPosts } from "@/lib/blog-data";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: [
      post.keyword,
      "online harmonium",
      "play harmonium online",
      "virtual harmonium",
      "harmonium riyaz",
    ],
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const relatedPosts = getRelatedPosts(post, 5);

  return (
    <main className="content-wrap px-2 py-8 md:py-12">
      <article className="glass-panel rounded-3xl p-6 md:p-10">
        <h1 className="text-3xl font-bold md:text-4xl">{post.title}</h1>
        <p className="mt-2 text-sm text-zinc-400">{new Date(post.date).toDateString()}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-zinc-400">{post.category}</p>
        <p className="mt-4 text-zinc-200">{post.description}</p>
        <div className="mt-6 space-y-4 text-zinc-300">
          {post.content.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3 text-sm text-zinc-300">
          <Link href="/">Practice on Player</Link>
          <span>|</span>
          <Link href="/learn-harmonium">Learn Harmonium</Link>
          <span>|</span>
          <Link href="/ragas-library">Ragas Library</Link>
        </div>

        {relatedPosts.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-amber-300">Related Articles</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {relatedPosts.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200 hover:bg-white/10"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
