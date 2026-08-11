/**
 * glossary.js — render glossary terms from data/glossary.json.
 */

/**
 * @param {HTMLElement} listEl
 * @param {{ term: string, definition: string }[]} terms
 */
function renderTerms(listEl, terms) {
  listEl.replaceChildren();

  if (!terms.length) {
    listEl.innerHTML = "<p>No terms matched your search.</p>";
    return;
  }

  const dl = document.createElement("dl");
  terms.forEach(({ term, definition }) => {
    const dt = document.createElement("dt");
    dt.textContent = term;
    const dd = document.createElement("dd");
    dd.textContent = definition;
    dl.append(dt, dd);
  });
  listEl.appendChild(dl);
}

/**
 * Bootstrap Glossary page.
 * @returns {Promise<void>}
 */
export async function initGlossaryPage() {
  const mount = document.getElementById("glossary-list");
  const search = document.getElementById("glossary-search");
  const status = document.getElementById("glossary-status");
  if (!mount) return;

  if (status) status.textContent = "Loading glossary…";

  try {
    const response = await fetch("data/glossary.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    /** @type {{ term: string, definition: string }[]} */
    const allTerms = payload.terms ?? [];

    /**
     * @param {string} query
     */
    const applyFilter = (query) => {
      const q = query.trim().toLowerCase();
      const filtered = !q
        ? allTerms
        : allTerms.filter(
            (item) =>
              item.term.toLowerCase().includes(q) ||
              item.definition.toLowerCase().includes(q)
          );
      renderTerms(mount, filtered);
      if (status) {
        status.textContent = `Showing ${filtered.length} of ${allTerms.length} terms.`;
      }
    };

    applyFilter("");

    if (search) {
      search.addEventListener("input", () => applyFilter(search.value));
    }
  } catch (error) {
    console.error("[glossary] Failed to load:", error);
    mount.innerHTML =
      '<p class="dev-note" role="alert">Could not load <code>data/glossary.json</code>.</p>';
    if (status) status.textContent = "Glossary failed to load.";
  }
}
