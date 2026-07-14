import type { ComponentPropsWithoutRef } from "react";
import { Caption } from "@/components/mdx/caption";
import { Plot } from "@/components/mdx/plot";
import { SineExplorer } from "@/components/mdx/sine-explorer";
import { TriattConcentration } from "@/components/mdx/triatt-concentration";
import { TriattCurve } from "@/components/mdx/triatt-curve";
import { TriattScoring } from "@/components/mdx/triatt-scoring";
import { YarnAbsolutePe } from "@/components/mdx/yarn-absolute-pe";
import { YarnRopeExtensions } from "@/components/mdx/yarn-rope-extensions";
import { YarnRopeRelative } from "@/components/mdx/yarn-rope-relative";
import { YarnRopeRotation } from "@/components/mdx/yarn-rope-rotation";
import { YarnRopeSpectrum } from "@/components/mdx/yarn-rope-spectrum";
import { YarnSinusoidalPe } from "@/components/mdx/yarn-sinusoidal-pe";

export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="mt-10 mb-4 text-xl font-medium" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-10 mb-4 text-lg font-medium" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-8 mb-3 font-medium" {...props} />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4 className="mt-6 mb-2 font-medium" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mb-5 leading-[1.75]" {...props} />
  ),
  a: ({ href = "", ...props }: ComponentPropsWithoutRef<"a">) => {
    const external = href.startsWith("http");
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
        {...props}
      />
    );
  },
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="mb-5 list-disc space-y-1.5 pl-5 leading-[1.75]" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="mb-5 list-decimal space-y-1.5 pl-5 leading-[1.75]" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="mb-5 border-l-2 border-border pl-4 text-muted"
      {...props}
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.85em]"
      {...props}
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="mb-5 overflow-x-auto rounded-lg bg-surface p-4 text-sm leading-6"
      {...props}
    />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-10 border-border" {...props} />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="mb-5 overflow-x-auto">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="border-b border-border px-3 py-2 text-left font-medium"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="border-b border-border px-3 py-2" {...props} />
  ),
  img: (props: ComponentPropsWithoutRef<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="my-6 w-full rounded-lg" alt="" {...props} />
  ),
  // Interactive components available in every post
  Caption,
  Plot,
  SineExplorer,
  TriattConcentration,
  TriattCurve,
  TriattScoring,
  YarnAbsolutePe,
  YarnRopeExtensions,
  YarnRopeRelative,
  YarnRopeRotation,
  YarnRopeSpectrum,
  YarnSinusoidalPe,
};
