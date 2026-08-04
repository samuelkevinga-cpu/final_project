/**
 * mythFact.js — interactive Myth vs Fact flip cards + localStorage progress.
 */

import { escapeHtml } from "./dom.js";
import { readJson, writeJson } from "./storage.js";

const STORAGE_KEY = "eaa-myth-progress";

/**
 * @returns {Record<string, boolean>}
 */
function loadProgress() {
  const saved = readJson(STORAGE_KEY, {});
  return saved && typeof saved === "object" ? saved : {};
}

/**
 * @param {Record<string, boolean>} progress
 */
function saveProgress(progress) {
  writeJson(STORAGE_KEY, progress);
}

/**
 * @param {number} total
 */
function updateProgressUi(total) {
  const status = document.getElementById("myth-progress");
  if (!status) return;

  const seen = Object.keys(loadProgress()).length;
  const clamped = Math.min(seen, total);
  status.textContent =
    total === 0
      ? ""
      : `Progress: ${clamped} of ${total} facts revealed (saved on this device).`;
}

/**
 * @param {object} card
 * @param {boolean} seen
 * @param {number} total
 * @returns {HTMLElement}
 */
function createFlipCard(card, seen, total) {
  const article = document.createElement("article");
  article.className = "flip-card";
  article.dataset.cardId = card.id;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "flip-card__button";
  button.setAttribute(
    "aria-label",
    `Myth versus fact card: ${card.myth}. Activate to flip.`
  );
  button.setAttribute("aria-pressed", String(seen));

  button.innerHTML = `
    <span class="flip-card__inner">
      <span class="flip-card__face flip-card__face--front">
        <span class="flip-card__badge">Myth</span>
        <span class="flip-card__text">${escapeHtml(card.myth)}</span>
        <span class="flip-card__hint">Tap to reveal the fact</span>
      </span>
      <span class="flip-card__face flip-card__face--back">
        <span class="flip-card__badge flip-card__badge--fact">Fact</span>
        <span class="flip-card__text">${escapeHtml(card.fact)}</span>
      </span>
    </span>
  `;

  if (seen) button.classList.add("is-flipped");

  button.addEventListener("click", () => {
    const nowFlipped = !button.classList.contains("is-flipped");
    button.classList.toggle("is-flipped", nowFlipped);
    button.setAttribute("aria-pressed", String(nowFlipped));

    const progress = loadProgress();
    if (nowFlipped) {
      progress[card.id] = true;
    } else {
      delete progress[card.id];
    }
    saveProgress(progress);
    updateProgressUi(total);
  });

  article.appendChild(button);
  return article;
}

/**
 * Bootstrap Myth vs Fact page.
 * @returns {Promise<void>}
 */
export async function initMythFactPage() {
  const grid = document.getElementById("flip-grid");
  if (!grid) return;

  const status = document.getElementById("myth-progress");
  if (status) status.textContent = "Loading cards…";

  try {
    const response = await fetch("data/myths.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const cards = payload.cards ?? [];
    const progress = loadProgress();

    grid.replaceChildren();
    cards.forEach((card) => {
      grid.appendChild(
        createFlipCard(card, Boolean(progress[card.id]), cards.length)
      );
    });

    updateProgressUi(cards.length);
  } catch (error) {
    console.error("[mythFact] Failed to load cards:", error);
    grid.innerHTML =
      '<p class="dev-note" role="alert">Could not load myth/fact cards. Check <code>data/myths.json</code>.</p>';
  }

  const copyBtn = document.getElementById("copy-page-link");
  if (copyBtn) {
    copyBtn.disabled = false;
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        copyBtn.textContent = "Link copied";
        setTimeout(() => {
          copyBtn.textContent = "Copy link";
        }, 1600);
      } catch {
        copyBtn.textContent = "Copy failed";
      }
    });
  }
}
