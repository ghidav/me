import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import "katex/dist/katex.min.css";
import { formatDate, getPost, getPosts } from "@/lib/posts";
import { mdxComponents } from "@/components/mdx/mdx-components";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article>
      <header className="mb-10">
        <h1 className="text-xl font-medium">{post.title}</h1>
        <p className="mt-2 text-sm text-muted">{formatDate(post.date)}</p>
      </header>
      <div className="text-[15px]">
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={{
            // posts are trusted local files; without this, next-mdx-remote v6
            // strips JS expressions (e.g. <Plot data={...} />) from the MDX
            blockJS: false,
            mdxOptions: {
              remarkPlugins: [remarkMath],
              rehypePlugins: [rehypeKatex, rehypeSlug],
            },
          }}
        />
      </div>
    </article>
  );
}
