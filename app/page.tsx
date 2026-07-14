import Link from "next/link";
import { formatDate, getPosts } from "@/lib/posts";
import { research, shortAuthors } from "@/data/research";

export default function Home() {
  const posts = getPosts().slice(0, 3);
  const highlights = research.slice(0, 3);

  return (
    <div>
      <h1 className="font-medium">Davide Ghilardi</h1>

      <p className="mt-6 leading-7">
        I am a first-year Ph.D. student at{" "}
        <a
          href="https://en.unimib.it/"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
        >
          Unimib
        </a>{" "}
        advised by Professor{" "}
        <a
          href="https://www.unimib.it/matteo-luigi-palmonari"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
        >
          Matteo Palmonari
        </a>
        . My research focus is on efficient post-training of LLMs.
      </p>

      <section className="mt-14">
        <h2 className="text-sm text-muted">Writing</h2>
        <ul className="mt-5 space-y-5 text-[15px]">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/writing/${post.slug}`}
                className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {post.title}
              </Link>
              <p className="mt-1 text-[13px] text-muted">
                {formatDate(post.date)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-sm text-muted">Research</h2>
        <ul className="mt-5 space-y-5 text-[15px]">
          {highlights.map((item) => (
            <li key={item.title}>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  {item.title}
                </a>
              ) : (
                <span>{item.title}</span>
              )}
              <p className="mt-1 text-[13px] leading-5 text-muted">
                {item.description}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                {shortAuthors(item.authors)} · {item.venue} · {item.year}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
