import type { Metadata } from "next";
import Link from "next/link";
import { formatDateFull, getPosts, SECTIONS } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
};

export default function WritingPage() {
  const posts = getPosts();
  // fixed section order; anything unrecognized lands in a trailing group
  const groups = [...SECTIONS, "Other"]
    .map((section) => ({
      section,
      posts: posts.filter((post) =>
        section === "Other"
          ? !post.section || !SECTIONS.includes(post.section)
          : post.section === section,
      ),
    }))
    .filter((group) => group.posts.length > 0);

  return (
    <div>
      <h1 className="font-medium">Writing</h1>
      {groups.map(({ section, posts: sectionPosts }) => (
        <section key={section} className="mt-12">
          <h2 className="text-sm text-muted">{section}</h2>
          <ul className="mt-5 space-y-6">
            {sectionPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/writing/${post.slug}`}
                  className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  {post.title}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  {formatDateFull(post.date)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
