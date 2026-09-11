# TODO

Deferred polish from the theme-system review. None of this blocks a commit.

## Small fixes

- [ ] **ThemePicker: clear stale `aria-activedescendant` on empty filter.**
  In `refilter()`, when `visible` is empty, `setActive()` early-returns and the
  search input keeps `aria-activedescendant` pointing at a now-hidden option.
  Remove the attribute in the no-matches branch.

- [ ] **gen-helix-themes.py: drop dead `WORD_FIXES` entries.**
  `"Gruvbox"`, `"Nord"`, `"Wal"` are no-ops. Keep only the ones that rewrite
  (`Github`, `Vscode`, `Ttc`, `Gtk`).

- [ ] **gen-helix-themes.py: fix `mix()` type hint.**
  Annotated `tuple[int, int, int]` but returns floats (`to_hex` rounds later).
  Change to `tuple[float, float, float]`.

- [ ] **ThemePicker: comment the double JSON import.**
  Frontmatter imports `helix-themes.json` twice — once as data (SSR counts),
  once as `?url` (lazy fetch). Add a line so it doesn't read as a mistake.

## Optional polish

- [ ] **Live `<meta name="theme-color">`.**
  Currently frozen at `#1c1e26` / `#fdf0ed`; won't match e.g. Dracula on
  mobile. Update from `--bg` in `apply()` (~4 lines). Gap: a returning visitor
  who never opens the picker keeps the default tint until they do.

- [ ] **Move ThemePicker `<style is:global>` to a sibling `ThemePicker.css`.**
  Same result, but "deliberately global" becomes structural rather than a
  directive to notice. No behaviour change.

- [ ] **`mise` task for theme regeneration.**
  The Helix-checkout -> `gen-helix-themes.py` workflow lives only in the script
  docstring. A `gen:themes` task would make it discoverable and pin the ref in
  one place.

- [ ] **Inline the ~6 name overrides into the JS `prettify`.**
  Closes the pre-list-load label gap ("Github Light" -> "GitHub Light"). Only
  real-world case: a first-time visitor whose OS prefers light landing on
  `github_light` before opening the picker. Low value; probably skip.
