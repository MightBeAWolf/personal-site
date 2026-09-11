import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Glossary terms behind the hover-popups on /tech-stack. Each entry renders
// two ways from this one source: a dedicated page at /glossary/<slug>
// (src/pages/glossary/[slug].astro), and - via that same page's HTML,
// fetched and extracted - inside a popup (src/components/GlossaryPopup.astro).
const glossary = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/glossary" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    link: z.string().url().optional(),
    // Extra surface phrases that should also trigger this term - e.g.
    // `apache-guacamole.md` (title "Apache Guacamole") listing "Guacamole"
    // here so the shorter name alone gets linked too. Matched in
    // site/src/lib/glossary-link.ts after `title`, in the order given.
    aliases: z.array(z.string()).optional(),
  }),
});

// The expanded accordion body for each Tools/Workflows row on /tech-stack.
// `teaser` is the one-liner shown in column 2; the markdown body is the
// prose that appears in column 3's accordion once it's expanded,
// cross-referencing glossary terms with the same hand-authored
// `<button class="glossary-term" ...>` pattern used in
// src/content/glossary/*.md.
const practices = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/practices" }),
  schema: z.object({
    section: z.enum(["tools", "workflows"]),
    title: z.string(),
    teaser: z.string(),
    order: z.number(),
  }),
});

export const collections = { glossary, practices };
