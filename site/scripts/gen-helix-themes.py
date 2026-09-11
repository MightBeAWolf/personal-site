#!/usr/bin/env python3
"""
Generate web design tokens from every Helix editor theme.

Reads all `runtime/themes/*.toml` from a Helix checkout and maps each theme's
editor scopes onto the semantic tokens this site uses. Emits:

  site/src/themes/helix-themes.css   - a `:root` default plus one
                                       `:root[data-theme="<id>"]` block per theme
  site/src/themes/helix-themes.json  - [{id, name, dark, swatch}] for the picker UI

Usage:
  python3 site/scripts/gen-helix-themes.py <helix>/runtime/themes [--default <id>]

The last generation used helix-editor/helix at commit
079a789e8cb08ead67f19e1971a1b7438b37354b (2026-07-23). Re-run after bumping that
ref. Nothing here is imported at runtime; the generated files are checked in.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys
import tomllib

# ---------------------------------------------------------------------------
# color helpers
# ---------------------------------------------------------------------------

# Helix accepts a handful of bare color names in addition to palette keys.
NAMED = {
    "black": "#000000",
    "white": "#ffffff",
    "gray": "#808080",
    "grey": "#808080",
    "red": "#ce2029",
    "green": "#1c8f4d",
    "blue": "#2f6fd8",
    "yellow": "#d8b200",
    "cyan": "#1f9ca8",
    "magenta": "#b5399a",
    "purple": "#8a54c9",
}


def clamp(n: float) -> int:
    return max(0, min(255, round(n)))


def parse_hex(value: str) -> tuple[int, int, int] | None:
    if not isinstance(value, str):
        return None
    v = value.strip().lstrip("#")
    if len(v) == 3:
        v = "".join(c * 2 for c in v)
    if len(v) == 8:  # #rrggbbaa - drop alpha
        v = v[:6]
    if len(v) != 6:
        return None
    try:
        return int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16)
    except ValueError:
        return None


def to_hex(rgb: tuple[int, int, int]) -> str:
    return "#{:02x}{:02x}{:02x}".format(*(clamp(c) for c in rgb))


def mix(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    """t=0 -> a, t=1 -> b."""
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))  # type: ignore[return-value]


def perceived(rgb: tuple[int, int, int]) -> float:
    """Cheap non-linear brightness 0..1 for dark/light classification."""
    r, g, b = (c / 255 for c in rgb)
    return 0.299 * r + 0.587 * g + 0.114 * b


def _lin(c: float) -> float:
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rel_luminance(rgb: tuple[int, int, int]) -> float:
    r, g, b = (_lin(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    hi, lo = sorted((rel_luminance(a), rel_luminance(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def saturation(rgb: tuple[int, int, int]) -> float:
    hi, lo = max(rgb), min(rgb)
    return 0.0 if hi == 0 else (hi - lo) / hi


# ---------------------------------------------------------------------------
# theme loading + inheritance
# ---------------------------------------------------------------------------


def load_all(theme_dir: pathlib.Path) -> dict[str, dict]:
    raw: dict[str, dict] = {}
    for path in sorted(theme_dir.glob("*.toml")):
        try:
            raw[path.stem] = tomllib.loads(path.read_text(encoding="utf-8"))
        except tomllib.TOMLDecodeError as exc:  # pragma: no cover - upstream typo
            print(f"  skip {path.name}: {exc}", file=sys.stderr)
    return raw


def resolve_inherits(name: str, raw: dict[str, dict], seen: frozenset[str]) -> dict:
    table = raw[name]
    parent_name = table.get("inherits")
    if isinstance(parent_name, str) and parent_name in raw and parent_name not in seen:
        base = resolve_inherits(parent_name, raw, seen | {name})
    else:
        base = {}
    merged = dict(base)
    for key, value in table.items():
        if key == "palette":
            merged["palette"] = {**base.get("palette", {}), **value}
        else:
            merged[key] = value
    return merged


# ---------------------------------------------------------------------------
# scope -> token extraction
# ---------------------------------------------------------------------------


class Theme:
    def __init__(self, table: dict):
        self.table = table
        self.palette: dict[str, str] = table.get("palette", {})

    def color(self, spec, _depth: int = 0) -> tuple[int, int, int] | None:
        """Resolve a Helix color spec (string, palette key, or {fg,bg} table)."""
        if _depth > 8 or spec is None:
            return None
        if isinstance(spec, dict):
            return None  # caller must pick .fg / .bg first
        if not isinstance(spec, str):
            return None
        rgb = parse_hex(spec)
        if rgb:
            return rgb
        if spec in self.palette:
            return self.color(self.palette[spec], _depth + 1)
        return parse_hex(NAMED.get(spec, ""))

    def fg(self, scope: str) -> tuple[int, int, int] | None:
        node = self.table.get(scope)
        if isinstance(node, dict):
            return self.color(node.get("fg"))
        return self.color(node)

    def bg(self, scope: str) -> tuple[int, int, int] | None:
        node = self.table.get(scope)
        if isinstance(node, dict):
            return self.color(node.get("bg"))
        return None

    def first_fg(self, *scopes: str) -> tuple[int, int, int] | None:
        for s in scopes:
            c = self.fg(s)
            if c:
                return c
        return None

    def first_bg(self, *scopes: str) -> tuple[int, int, int] | None:
        for s in scopes:
            c = self.bg(s)
            if c:
                return c
        return None


def build_tokens(theme: Theme) -> dict[str, str] | None:
    bg = theme.first_bg("ui.background") or theme.color(
        theme.palette.get("background") or theme.palette.get("bg") or ""
    )
    if not bg:
        return None  # terminal-only palette; not usable on the web

    # Body text: the most legible near-neutral candidate. Some themes (e.g.
    # github_light) park the real foreground on `ui.text.focus` and use
    # `ui.text` for a dimmer shade, so weigh both by contrast.
    text_candidates = [
        theme.fg("ui.text"),
        theme.fg("ui.background"),
        theme.color(theme.palette.get("foreground") or theme.palette.get("fg") or ""),
    ]
    focus = theme.fg("ui.text.focus")
    if focus and saturation(focus) < 0.28:
        text_candidates.append(focus)
    text_candidates = [c for c in text_candidates if c]
    if not text_candidates:
        return None
    text = max(text_candidates, key=lambda c: contrast(c, bg))

    dark = perceived(bg) < 0.5
    toward_edge = (255, 255, 255) if dark else (0, 0, 0)

    raised = (
        theme.first_bg("ui.menu", "ui.popup", "ui.popup.info", "ui.statusline")
        or mix(bg, toward_edge, 0.05 if dark else 0.035)
    )
    if not 1.04 < contrast(raised, bg) < 2.4:
        raised = mix(bg, toward_edge, 0.06 if dark else 0.04)
    inset = theme.first_bg("ui.background.separator") or mix(
        bg, toward_edge, 0.09 if dark else 0.06
    )
    selection = (
        theme.first_bg("ui.selection.primary", "ui.selection", "ui.cursor.match")
        or mix(bg, toward_edge, 0.16 if dark else 0.10)
    )
    if not 1.05 < contrast(selection, bg) < 2.8:
        selection = mix(bg, toward_edge, 0.16 if dark else 0.1)
    border = (
        theme.first_bg("ui.background.separator")
        or theme.first_fg("ui.window", "ui.linenr")
        or mix(bg, text, 0.18)
    )
    # A "border" that contrasts hard with the page is really a text/fg color
    # (some themes point ui.window at the foreground); one that matches the page
    # is invisible (ui.background.separator == background). Force a quiet hairline.
    _bc = contrast(border, bg)
    if _bc > 2.4 or _bc < 1.12:
        border = mix(bg, text, 0.2 if dark else 0.16)
    border_strong = mix(border, text, 0.3)
    muted = (
        theme.first_fg("comment", "ui.linenr", "ui.text.inactive")
        or mix(bg, text, 0.5)
    )
    # keep muted text legible, and distinct from body text - Helix's
    # comment/inactive colors are sometimes near-invisible or (when the theme
    # parks the real fg on `ui.text`) identical to our chosen body text.
    if contrast(muted, bg) < 3.0 or contrast(muted, text) < 1.25:
        muted = mix(bg, text, 0.55)
    faint = mix(bg, text, 0.34)

    def readable(c: tuple[int, int, int] | None, target: float = 3.2):
        """Nudge a foreground toward the page edge until it clears `target`."""
        if c is None:
            return None
        for t in (0.0, 0.15, 0.3, 0.45, 0.6):
            cand = mix(c, toward_edge, t)
            if contrast(cand, bg) >= target:
                return cand
        return mix(c, toward_edge, 0.6)

    heading = readable(
        theme.first_fg("markup.heading", "markup.heading.1", "keyword", "function")
    ) or text
    link = readable(
        theme.first_fg(
            "markup.link.url", "markup.link.text", "markup.link", "function", "type"
        )
    ) or text
    link_hover = readable(
        theme.first_fg("ui.text.focus", "markup.link.label")
    ) or mix(link, toward_edge, 0.22)
    accent = readable(
        theme.first_fg(
            "markup.raw", "markup.quote", "constant", "constant.numeric", "string"
        )
    ) or link
    # an accent that reads as body text (near-neutral, similar lightness) is
    # useless for code/quote highlights - fall back to the heading hue.
    if contrast(accent, text) < 1.4:
        accent = heading
    danger = readable(theme.first_fg("error", "diagnostic.error", "keyword")) or link

    sel_text = text

    tok = {
        "--bg": bg,
        "--bg-raised": raised,
        "--bg-inset": inset,
        "--surface-selection": selection,
        "--border": border,
        "--border-strong": border_strong,
        "--text": text,
        "--text-muted": muted,
        "--text-faint": faint,
        "--heading": heading,
        "--link": link,
        "--link-hover": link_hover,
        "--accent": accent,
        "--accent-alt": danger,
        "--danger": danger,
        "--code-text": accent,
        "--quote-border": accent,
        "--selection-bg": selection,
        "--selection-text": sel_text,
    }
    out = {k: to_hex(v) for k, v in tok.items()}

    # accent rule: heading -> accent -> link, minus repeats (heading often ==
    # accent after the fallback above), padded so it's always a real gradient.
    stops: list[str] = []
    for c in (out["--heading"], out["--accent"], out["--link"], out["--accent-alt"]):
        if c not in stops:
            stops.append(c)
    out["--rule"] = f"linear-gradient(90deg, {', '.join(stops[:3])})"
    out["__dark__"] = dark  # consumed below, stripped from CSS
    return out


PRETTY_OVERRIDES = {
    "onedark": "One Dark",
    "onelight": "One Light",
    "tokyonight": "Tokyo Night",
    "tokyonight_storm": "Tokyo Night Storm",
    "tokyonight_moon": "Tokyo Night Moon",
    "papercolor-light": "PaperColor Light",
    "papercolor-dark": "PaperColor Dark",
}

# applied word-by-word after title-casing
WORD_FIXES = {
    "Github": "GitHub",
    "Vscode": "VS Code",
    "Gruvbox": "Gruvbox",
    "Nord": "Nord",
    "Ttc": "TTC",
    "Wal": "Wal",
    "Gtk": "GTK",
}


def prettify(theme_id: str) -> str:
    if theme_id in PRETTY_OVERRIDES:
        return PRETTY_OVERRIDES[theme_id]
    small = {"and", "of", "the"}
    words = theme_id.replace("_", " ").replace("-", " ").split()
    out = []
    for w in words:
        if w in small:
            out.append(w)
            continue
        cap = w[:1].upper() + w[1:]
        out.append(WORD_FIXES.get(cap, cap))
    return " ".join(out)


def token_block(selector: str, tokens: dict[str, str], dark: bool) -> str:
    decls = "\n".join(f"  {k}: {v};" for k, v in tokens.items())
    return (
        f"{selector} {{\n"
        f"  color-scheme: {'dark' if dark else 'light'};\n"
        f"{decls}\n}}"
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Map every Helix theme onto this site's design tokens.",
    )
    parser.add_argument(
        "themes_dir",
        type=pathlib.Path,
        help="path to a Helix checkout's runtime/themes directory",
    )
    parser.add_argument(
        "--default",
        default="horizon-dark",
        metavar="ID",
        help="theme whose tokens become the bare :root default (default: %(default)s)",
    )
    args = parser.parse_args(argv)

    theme_dir = args.themes_dir.expanduser().resolve()
    repo_root = pathlib.Path(__file__).resolve().parents[2]
    out_dir = repo_root / "site" / "src" / "themes"
    out_dir.mkdir(parents=True, exist_ok=True)

    raw = load_all(theme_dir)
    css_blocks: list[str] = []
    manifest: list[dict] = []
    skipped: list[str] = []
    tokens_by_id: dict[str, tuple[dict[str, str], bool]] = {}

    for theme_id in sorted(raw):
        table = resolve_inherits(theme_id, raw, frozenset())
        tokens = build_tokens(Theme(table))
        if tokens is None:
            skipped.append(theme_id)
            continue
        dark = tokens.pop("__dark__")
        tokens_by_id[theme_id] = (tokens, dark)
        css_blocks.append(
            token_block(f':root[data-theme="{theme_id}"]', tokens, dark)
        )
        manifest.append(
            {
                "id": theme_id,
                "name": prettify(theme_id),
                "dark": dark,
                # only what the picker's chip + label render; this ships to
                # the client as a fetched asset, so keep it lean.
                "swatch": {
                    "bg": tokens["--bg"],
                    "heading": tokens["--heading"],
                    "link": tokens["--link"],
                    "accent": tokens["--accent"],
                },
            }
        )

    if args.default not in tokens_by_id:
        parser.error(
            f"--default {args.default!r} is not among the generated themes"
        )
    default_tokens, default_dark = tokens_by_id[args.default]
    default_block = token_block(":root", default_tokens, default_dark)

    header = (
        "/* GENERATED by site/scripts/gen-helix-themes.py - do not edit by hand.\n"
        f"   {len(manifest)} themes from helix-editor/helix runtime/themes.\n"
        f"   The bare :root block is the {args.default!r} default (no-JS / pre-choice"
        " fallback). */\n"
    )
    (out_dir / "helix-themes.css").write_text(
        header + "\n" + default_block + "\n\n" + "\n\n".join(css_blocks) + "\n",
        encoding="utf-8",
    )
    (out_dir / "helix-themes.json").write_text(
        json.dumps(manifest, indent=1, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    print(f"themes written : {len(manifest)}")
    print(f"default :root   : {args.default}")
    print(f"skipped (no hex bg/fg): {len(skipped)}")
    if skipped:
        print("  " + ", ".join(skipped))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
