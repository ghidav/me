"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "home", hover: "hover:text-accent-red" },
  { href: "/writing", label: "writing", hover: "hover:text-accent-yellow" },
  { href: "/research", label: "research", hover: "hover:text-accent-green" },
  { href: "/about", label: "about", hover: "hover:text-accent-blue" },
  { href: "/contact", label: "contact", hover: "hover:text-accent-purple" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="mb-16 flex items-center gap-5 text-sm">
      {links.map(({ href, label, hover }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`transition-colors ${hover} ${
              active ? "text-foreground" : "text-muted"
            }`}
          >
            {label}
          </Link>
        );
      })}
      <span className="ml-auto">
        <ThemeToggle />
      </span>
    </nav>
  );
}
