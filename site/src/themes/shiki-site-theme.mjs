// A Shiki theme whose token colors are this site's own Helix-derived CSS
// custom properties (see helix-themes.css) rather than fixed hex values.
// Astro/Shiki bake these `var(--...)` strings straight into each token's
// inline `style="color:..."`, so a rendered code block re-colors itself
// whenever `data-theme` changes - live, via ThemePicker, no rebuild - the
// same way the rest of the page already does. A fixed built-in Shiki theme
// (e.g. github-dark) can't do this: its colors are resolved to hex once,
// at build time, so it looks the same no matter which Helix theme is
// active - the mismatch this theme exists to fix.
export const siteShikiTheme = {
  name: "site-theme",
  type: "dark",
  colors: {
    "editor.background": "var(--bg-inset)",
    "editor.foreground": "var(--text)",
  },
  settings: [
    {
      settings: {
        foreground: "var(--text)",
        background: "var(--bg-inset)",
      },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "var(--text-muted)" },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "punctuation.definition.string",
        "constant.numeric",
        "constant.language",
        "constant.character",
        "constant.other",
      ],
      settings: { foreground: "var(--accent)" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.operator.word",
        "storage",
        "storage.type",
        "storage.modifier",
        "entity.name.tag",
        "entity.name.section",
        "markup.heading",
        "markup.bold",
      ],
      settings: { foreground: "var(--heading)" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "variable.function",
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
        "markup.underline.link",
      ],
      settings: { foreground: "var(--link)" },
    },
    {
      scope: [
        "punctuation",
        "punctuation.separator",
        "punctuation.definition.section",
        "punctuation.definition.tag",
        "keyword.operator",
        "meta.brace",
      ],
      settings: { foreground: "var(--text-muted)" },
    },
    {
      scope: ["invalid", "invalid.illegal"],
      settings: { foreground: "var(--danger)" },
    },
  ],
};
