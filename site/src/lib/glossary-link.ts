/**
 * Wraps the first whole-word mention of each glossary term (its title, or
 * one of its aliases) in a page's description strings with the trigger
 * markup GlossaryPopup.astro listens for. Used on tech-stack.astro's
 * already-`set:html` description strings, and safe to reuse anywhere else
 * that renders similar hand-authored HTML strings.
 */

export interface GlossaryTerm {
  id: string;
  title: string;
  aliases?: string[];
}

// Never wrap text that's already inside one of these - a button nested
// inside a link (or another button) is broken HTML and worse UX than no
// trigger at all. Content authors should link the glossary page directly
// instead of hand-linking a term that now has its own entry.
const PROTECTED = /<a\b[^>]*>.*?<\/a>|<code\b[^>]*>.*?<\/code>/gis;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function linkGlossaryTerms(html: string, terms: GlossaryTerm[]): string {
  const segments = html.split(PROTECTED);
  const protectedMatches = html.match(PROTECTED) ?? [];
  const linked = new Set<string>();

  const wrapSegment = (segment: string): string => {
    let out = segment;
    for (const term of terms) {
      if (linked.has(term.id)) continue;
      // Title first, then aliases in the order given - first phrase that
      // actually appears wins; the rest are never tried for this term.
      const candidates = [term.title, ...(term.aliases ?? [])];
      for (const phrase of candidates) {
        const pattern = new RegExp(`\\b${escapeRegExp(phrase)}\\b`);
        if (!pattern.test(out)) continue;
        out = out.replace(
          pattern,
          (match) =>
            `<button type="button" class="glossary-term" data-glossary-term="${term.id}">${match}</button>`,
        );
        linked.add(term.id);
        break;
      }
    }
    return out;
  };

  let result = "";
  for (let i = 0; i < segments.length; i++) {
    result += wrapSegment(segments[i]);
    if (protectedMatches[i]) result += protectedMatches[i];
  }
  return result;
}
