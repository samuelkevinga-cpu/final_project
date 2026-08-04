/**
 * main.js — Week 6 site bootstrap
 * Marks the current nav link and starts the page-specific module.
 */

import { initMythFactPage } from "./mythFact.js";
import { initNewsPage } from "./news.js";
import { initVideosPage } from "./videos.js";
import { initGlossaryPage } from "./glossary.js";
import { initSurveyPage } from "./survey.js";

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
 * @returns {string}
 */
function currentPage() {
  return window.location.pathname.split("/").pop() || "index.html";
}

async function init() {
  setActiveNav();

  const page = currentPage();

  switch (page) {
    case "myth-fact.html":
      await initMythFactPage();
      break;
    case "news.html":
      await initNewsPage();
      break;
    case "videos.html":
      await initVideosPage();
      break;
    case "glossary.html":
      await initGlossaryPage();
      break;
    case "survey.html":
      initSurveyPage();
      break;
    default:
      break;
  }
}

init();
