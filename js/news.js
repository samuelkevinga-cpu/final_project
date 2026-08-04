/**
 * news.js — render News API (or fallback) articles + topic filters.
 */

import { fetchNewsArticles, filterArticlesByTopic } from "./api.js";
import { escapeHtml } from "./dom.js";

/**
 * @param {string|undefined} iso
 * @returns {string}
 */
function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * @param {object} article
 * @returns {HTMLElement}
 */
function createArticleCard(article) {
  const item = document.createElement("article");
  item.className = "media-card";

  const imageUrl = article.urlToImage || "";
  const title = escapeHtml(article.title || "Untitled article");
  const source = escapeHtml(
    article.source?.name || article.author || "Unknown source"
  );
  const date = formatDate(article.publishedAt);
  const description = escapeHtml(article.description || "");
  const href = escapeHtml(article.url || "#");
  const safeImage = escapeHtml(imageUrl);

  item.innerHTML = `
    ${
      imageUrl
        ? `<img class="media-card__image" src="${safeImage}" alt="" loading="lazy" width="640" height="360" />`
        : `<div class="media-card__image media-card__image--empty" aria-hidden="true"></div>`
    }
    <div class="media-card__body">
      <h3 class="media-card__title">
        <a href="${href}" target="_blank" rel="noopener noreferrer">${title}</a>
      </h3>
      <p class="media-card__meta">${source}${date ? ` · ${date}` : ""}</p>
      ${description ? `<p class="media-card__desc">${description}</p>` : ""}
    </div>
  `;

  const img = item.querySelector("img");
  if (img) {
    img.addEventListener("error", () => {
      const placeholder = document.createElement("div");
      placeholder.className = "media-card__image media-card__image--empty";
      placeholder.setAttribute("aria-hidden", "true");
      img.replaceWith(placeholder);
    });
  }

  return item;
}

/**
 * @param {HTMLElement} grid
 * @param {object[]} articles
 */
function renderArticles(grid, articles) {
  grid.replaceChildren();
  if (!articles.length) {
    const empty = document.createElement("p");
    empty.className = "dev-note";
    empty.textContent = "No articles matched this filter. Try another topic.";
    grid.appendChild(empty);
    return;
  }
  articles.forEach((article) => grid.appendChild(createArticleCard(article)));
}

/**
 * @param {HTMLElement|null} statusEl
 * @param {string} message
 */
function setStatus(statusEl, message) {
  if (statusEl) statusEl.textContent = message;
}

/**
 * Bootstrap News page.
 * @returns {Promise<void>}
 */
export async function initNewsPage() {
  const grid = document.getElementById("articles-grid");
  const statusEl = document.getElementById("api-status");
  const filterGroup = document.querySelector('[role="group"][aria-label="Topic filters"]');
  if (!grid) return;

  /**
   * @param {string} topic
   */
  async function loadTopic(topic) {
    setStatus(statusEl, "Loading articles…");
    grid.setAttribute("aria-busy", "true");

    const result = await fetchNewsArticles(topic);
    const articles = result.data?.articles ?? [];

    const visible =
      result.source === "fallback"
        ? filterArticlesByTopic(articles, topic)
        : articles;

    renderArticles(grid, visible);
    grid.setAttribute("aria-busy", "false");

    if (!result.data) {
      setStatus(statusEl, `Could not load articles. ${result.error || ""}`.trim());
      return;
    }

    if (result.source === "api") {
      setStatus(
        statusEl,
        `Showing ${visible.length} live article${visible.length === 1 ? "" : "s"} (News API via CORS proxy).`
      );
    } else {
      setStatus(
        statusEl,
        `Showing ${visible.length} sample article${visible.length === 1 ? "" : "s"} from local fallback. Add a News API key in js/api.js for live data. ${result.error ? `(${result.error})` : ""}`.trim()
      );
    }
  }

  if (filterGroup) {
    const buttons = filterGroup.querySelectorAll("button[data-topic]");
    buttons.forEach((button) => {
      button.disabled = false;
      button.addEventListener("click", () => {
        buttons.forEach((btn) => {
          btn.classList.toggle("is-active", btn === button);
          btn.setAttribute("aria-pressed", String(btn === button));
        });
        loadTopic(button.dataset.topic || "all");
      });
    });

    const initial = filterGroup.querySelector('button[data-topic="all"]');
    if (initial) {
      initial.classList.add("is-active");
      initial.setAttribute("aria-pressed", "true");
    }
  }

  await loadTopic(activeTopic);

  // silence unused lint-style warnings in some editors
  void lastSource;
}
