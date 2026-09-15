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

// Narrative sub-articles for /tech-stack's column 3 - "why Podman over
// Docker", "why I edit in a terminal most of the time", not definitions
// (that's the glossary's job). A file's own path ties it to its parent:
//   tools/<item-slug>/<article-slug>.md
//   workflows/<item-slug>/<article-slug>.md
//   stack/<category-slug>/<group-slug>/<leaf-slug>/<article-slug>.md
// tech-stack.astro matches an article to its parent by checking whether
// its id starts with the parent's own slugify()'d key + "/" - no
// frontmatter field names the parent, so there's nothing to drift out of
// sync when an item gets renamed, only the folder it lives in.
const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    order: z.number().optional(),
  }),
});

export const collections = { glossary, articles };
