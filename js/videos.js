/**
 * videos.js — render YouTube search results (or local fallback) on the Videos page.
 */

import { fetchYouTubeVideos } from "./api.js";
import { escapeHtml } from "./dom.js";

/**
 * @param {object} item
 * @returns {HTMLElement}
 */
function createVideoCard(item) {
  const videoId = item.id?.videoId;
  const snippet = item.snippet || {};
  const title = escapeHtml(snippet.title || "Untitled video");
  const channel = escapeHtml(snippet.channelTitle || "Unknown channel");
  const description = escapeHtml(snippet.description || "");
  const thumb = escapeHtml(
    snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      ""
  );
  const href = videoId
    ? `https://www.youtube.com/watch?v=${escapeHtml(videoId)}`
    : "#";

  const article = document.createElement("article");
  article.className = "media-card media-card--video";

  article.innerHTML = `
    <a class="media-card__thumb-link" href="${href}" target="_blank" rel="noopener noreferrer">
      ${
        thumb
          ? `<img class="media-card__image" src="${thumb}" alt="" loading="lazy" width="320" height="180" />`
          : `<div class="media-card__image media-card__image--empty" aria-hidden="true"></div>`
      }
      <span class="visually-hidden">Watch: ${title}</span>
    </a>
    <div class="media-card__body">
      <h3 class="media-card__title">
        <a href="${href}" target="_blank" rel="noopener noreferrer">${title}</a>
      </h3>
      <p class="media-card__meta">${channel}</p>
      ${description ? `<p class="media-card__desc">${description}</p>` : ""}
    </div>
  `;

  return article;
}

/**
 * Bootstrap Videos page.
 * @returns {Promise<void>}
 */
export async function initVideosPage() {
  const grid = document.getElementById("videos-grid");
  const statusEl = document.getElementById("api-status");
  if (!grid) return;

  if (statusEl) statusEl.textContent = "Loading videos…";
  grid.setAttribute("aria-busy", "true");

  const result = await fetchYouTubeVideos();
  const items = result.data?.items ?? [];

  grid.replaceChildren();
  if (!items.length) {
    grid.innerHTML =
      '<p class="dev-note" role="alert">No videos available right now.</p>';
  } else {
    items.forEach((item) => grid.appendChild(createVideoCard(item)));
  }

  grid.setAttribute("aria-busy", "false");

  if (!statusEl) return;

  if (!result.data) {
    statusEl.textContent = "Could not load videos right now. Please try again later.";
  } else if (result.source === "api") {
    statusEl.textContent = `Showing ${items.length} video${items.length === 1 ? "" : "s"}.`;
  } else {
    statusEl.textContent = `Showing ${items.length} curated sample video${items.length === 1 ? "" : "s"}.`;
  }
}
