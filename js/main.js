/**
 * main.js — Week 5 site bootstrap
 * Marks the current nav link and optionally triggers API console loads.
 */

import { loadExternalDataToConsole } from "./api.js";

/**
 * Highlight the nav link that matches this page.
 */
function setActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll(".site-nav a");

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const file = href.split("/").pop();
    if (file === path || (path === "" && file === "index.html")) {
      link.setAttribute("aria-current", "page");
    }
  });
}

/**
 * Update a small on-page status line after console API attempts.
 * @param {HTMLElement|null} statusEl
 * @param {{ news: object|null, videos: object|null }} result
 */
function updateApiStatus(statusEl, result) {
  if (!statusEl) return;

  const newsOk = Boolean(result.news);
  const videosOk = Boolean(result.videos);

  if (newsOk && videosOk) {
    statusEl.textContent =
      "API check: both responses logged to the browser console.";
  } else if (!newsOk && !videosOk) {
    statusEl.textContent =
      "API check: requests finished with errors or placeholder keys. Open the console (F12) for details. News API CORS note is in README.";
  } else {
    statusEl.textContent =
      "API check: partial success. Open the console (F12) for full JSON / errors.";
  }
}

async function init() {
  setActiveNav();

  const shouldLoadApis = document.body.dataset.loadApis === "true";
  if (!shouldLoadApis) return;

  const statusEl = document.getElementById("api-status");
  if (statusEl) {
    statusEl.textContent = "API check: loading… check the browser console.";
  }

  const result = await loadExternalDataToConsole();
  updateApiStatus(statusEl, result);
}

init();
