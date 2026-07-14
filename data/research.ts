export type ResearchItem = {
  title: string;
  authors: string;
  description: string;
  href?: string;
  year: number;
  venue: string;
};

export const research: ResearchItem[] = [
  {
    title:
      "Efficient Training of Sparse Autoencoders for Large Language Models via Layer Groups",
    authors:
      "Davide Ghilardi, Federico Belotti, Marco Molinari, Tao Ma, Matteo Palmonari",
    description:
      "Cuts the cost of training sparse autoencoders by sharing them across groups of layers.",
    href: "https://aclanthology.org/2025.emnlp-main.942/",
    year: 2025,
    venue: "EMNLP",
  },
  {
    title:
      "h4rm3l: A Dynamic Benchmark of Composable Jailbreak Attacks for LLM Safety Assessment",
    authors:
      "Moussa Doumbouya, Ananjan Nandi, Gabriel Poesia, Davide Ghilardi, Anna Goldie, Federico Bianchi, Dan Jurafsky, Christopher D. Manning",
    description:
      "A composable language for synthesizing and benchmarking jailbreak attacks.",
    href: "https://openreview.net/forum?id=zZ8fgXHkXi",
    year: 2025,
    venue: "ICLR",
  },
  {
    title:
      "Accelerating Sparse Autoencoder Training via Layer-Wise Transfer Learning in Large Language Models",
    authors: "Davide Ghilardi, Federico Belotti, Marco Molinari",
    description:
      "Warm-starts sparse autoencoder training from neighboring layers to speed up convergence.",
    href: "https://aclanthology.org/2024.blackboxnlp-1.32/",
    year: 2024,
    venue: "BlackboxNLP @ EMNLP",
  },
];

export function shortAuthors(authors: string): string {
  const names = authors.split(",").map((name) => name.trim());
  const surname = names[0].split(" ").pop();
  return names.length > 1 ? `${surname} et al.` : `${surname}`;
}
