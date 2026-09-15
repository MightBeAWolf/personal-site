/**
 * Adds a "copy to clipboard" button to every fenced code block (a Shiki
 * `<pre><code>`) under `root`. Idempotent, so it's safe to re-scan: called
 * once for the whole document on load, and again scoped to just the markup
 * a GlossaryPopup card fetches and injects via innerHTML afterward (see
 * GlossaryPopup.astro) - that content has no button until this runs on it.
 */

const COPY_ICON =
  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
  '<rect x="4" y="3" width="8" height="11" rx="1.3" fill="none" stroke="currentColor" stroke-width="1.4"></rect>' +
  '<path d="M6 3V2.3A1.3 1.3 0 0 1 7.3 1h1.4A1.3 1.3 0 0 1 10 2.3V3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"></path>' +
  "</svg>";

const CHECK_ICON =
  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
  '<path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>' +
  "</svg>";

const RESET_MS = 1500;

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API unavailable (old browser, insecure context) - fall back
    // to the classic hidden-textarea + execCommand trick.
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      return true;
    } catch {
      return false;
    }
  }
}

export function initCodeCopy(root: ParentNode): void {
  for (const pre of root.querySelectorAll<HTMLPreElement>("pre")) {
    if (pre.querySelector(":scope > .code-copy")) continue; // already wired
    const code = pre.querySelector(":scope > code");
    if (!code) continue;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy";
    button.setAttribute("aria-label", "Copy code");
    button.innerHTML = COPY_ICON;

    let resetTimer = 0;
    button.addEventListener("click", async () => {
      const ok = await copyText(code.textContent ?? "");
      window.clearTimeout(resetTimer);
      button.classList.toggle("is-copied", ok);
      button.innerHTML = ok ? CHECK_ICON : COPY_ICON;
      button.setAttribute("aria-label", ok ? "Copied" : "Copy failed");
      resetTimer = window.setTimeout(() => {
        button.classList.remove("is-copied");
        button.innerHTML = COPY_ICON;
        button.setAttribute("aria-label", "Copy code");
      }, RESET_MS);
    });

    pre.appendChild(button);
  }
}
