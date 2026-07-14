import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
};

const linkClass =
  "underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground";

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={linkClass}>
      {children}
    </a>
  );
}

export default function AboutPage() {
  return (
    <div>
      <h1 className="font-medium">About</h1>
      <Image
        src="/davide.jpg"
        alt="Portrait of Davide Ghilardi"
        width={400}
        height={400}
        priority
        className="mt-6 w-44 grayscale"
      />
      <p className="mt-6 leading-7">
        I&apos;m a Ph.D. student in Computer Science at the University of
        Milano-Bicocca, advised by Professor{" "}
        <A href="https://www.unimib.it/matteo-luigi-palmonari">
          Matteo Palmonari
        </A>
        . My research focuses on efficient post-training of LLMs.
      </p>
      <p className="mt-5 leading-7">
        Before starting the Ph.D., I was a visiting student researcher at the{" "}
        <A href="https://nlp.stanford.edu/">Stanford NLP Group</A>, supervised
        by <A href="https://web.stanford.edu/~jurafsky/">Dan Jurafsky</A> and{" "}
        <A href="https://federicobianchi.io/">Federico Bianchi</A>, where I
        applied mechanistic interpretability techniques to LLM safety. I also
        took part in Neel Nanda&apos;s{" "}
        <A href="https://www.matsprogram.org/">MATS</A> training program. My
        work on sparse autoencoders and LLM safety has appeared at{" "}
        <A href="https://aclanthology.org/2025.emnlp-main.942/">EMNLP</A>,{" "}
        <A href="https://openreview.net/forum?id=zZ8fgXHkXi">ICLR</A>, and{" "}
        <A href="https://aclanthology.org/2024.blackboxnlp-1.32/">
          BlackboxNLP
        </A>
        .
      </p>
      <p className="mt-5 leading-7">
        Earlier, I worked as a research fellow on NLP for the Italian legal
        domain, building information extraction and entity linking systems. I
        hold an M.Sc. in Data Science and a B.Sc. in Statistical and Economic
        Sciences, both from Milano-Bicocca.
      </p>
    </div>
  );
}
