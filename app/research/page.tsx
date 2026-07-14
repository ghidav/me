import type { Metadata } from "next";
import { research } from "@/data/research";

export const metadata: Metadata = {
  title: "Research",
};

export default function ResearchPage() {
  return (
    <div>
      <h1 className="font-medium">Research</h1>
      <ul className="mt-8 space-y-6">
        {research.map((item) => (
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
            <p className="mt-1 text-xs leading-5 text-muted">{item.authors}</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              {item.description}
            </p>
            <p className="mt-1 text-sm text-muted">
              {item.venue} · {item.year}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
