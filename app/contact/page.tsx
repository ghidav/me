import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div>
      <h1 className="font-medium">Contact</h1>
      <p className="mt-6 leading-7">
        The best way to reach me is by email at{" "}
        <a
          href="mailto:davide.ghilardi0@gmail.com"
          className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
        >
          davide.ghilardi0@gmail.com
        </a>
        .
      </p>
    </div>
  );
}
