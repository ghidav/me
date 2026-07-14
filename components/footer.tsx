"use client";

import { usePathname } from "next/navigation";

const socials = [
  {
    label: "Scholar",
    href: "https://scholar.google.com/citations?user=fMrxH9kAAAAJ&hl=en",
  },
  { label: "GitHub", href: "https://github.com/ghidav" },
  // TODO: replace with your real profile
  { label: "Twitter", href: "https://twitter.com" },
];

const inspirations = [
  { label: "Federico Bianchi", href: "https://federicobianchi.io/" },
  { label: "Paco Coursey", href: "https://paco.me/" },
  { label: "Lee Robinson", href: "https://leerob.com/" },
];

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="mt-24 text-sm text-muted">
      <div className="flex items-center gap-2">
        {socials.map(({ label, href }, i) => (
          <span key={label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>·</span>}
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {label}
            </a>
          </span>
        ))}
      </div>
      {pathname === "/" && (
        <p className="mt-6 text-xs leading-5">
          Website design inspired by the work of{" "}
          {inspirations.map(({ label, href }, i) => (
            <span key={label}>
              {i === inspirations.length - 1 ? ", and " : i > 0 ? ", " : ""}
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {label}
              </a>
            </span>
          ))}
          .
        </p>
      )}
    </footer>
  );
}
