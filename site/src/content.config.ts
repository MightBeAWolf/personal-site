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

export const collections = { glossary };
