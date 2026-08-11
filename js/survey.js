/**
 * survey.js — Self-check survey with scoring + localStorage restore.
 */

import { escapeHtml } from "./dom.js";
import { readJson, writeJson } from "./storage.js";

const STORAGE_KEY = "eaa-self-check";

/**
 * Scores anonymous self-check answers and builds feedback copy.
 */
export class SelfCheckScorer {
  static SCORE_MAP = {
    q1: { rarely: 1, sometimes: 2, often: 3 },
    q2: { no: 1, some: 2, yes: 3 },
    q3: { maybe: 1, yes: 2, already: 3 },
  };

  /**
   * @param {Record<string, string>} answers
   * @returns {{ total: number, max: number, message: string }}
   */
  score(answers) {
    let total = 0;
    let max = 0;

    Object.entries(SelfCheckScorer.SCORE_MAP).forEach(([key, map]) => {
      max += 3;
      total += map[answers[key]] ?? 0;
    });

    let message =
      "Thanks for checking in. Keep exploring the glossary and myth cards when you want clearer language.";
    if (total >= 8) {
      message =
        "You already show strong awareness and willingness to share accurate info. Keep using trusted sources.";
    } else if (total >= 5) {
      message =
        "You are building awareness. A few more facts and conversations can make the science feel clearer.";
    } else {
      message =
        "This is a gentle starting point. Browse Myth vs Fact and the glossary for short, stigma-free explanations.";
    }

    return { total, max, message };
  }
}

/**
 * @param {HTMLFormElement} form
 * @param {Record<string, string>} answers
 */
function applyAnswersToForm(form, answers) {
  Object.entries(answers).forEach(([name, value]) => {
    const input = form.querySelector(`input[name="${name}"][value="${value}"]`);
    if (input instanceof HTMLInputElement) input.checked = true;
  });
}

/**
 * @param {HTMLElement|null} resultEl
 * @param {{ total: number, max: number, message: string, savedAt?: string }} result
 */
function showResult(resultEl, result) {
  if (!resultEl) return;
  const when = result.savedAt
    ? ` Saved ${new Date(result.savedAt).toLocaleString()}.`
    : "";
  resultEl.hidden = false;
  resultEl.innerHTML = `
    <p class="shell-label">Your check-in</p>
    <p><strong>Awareness score:</strong> ${result.total} / ${result.max}</p>
    <p>${escapeHtml(result.message)}</p>
    <p class="media-card__meta">Stored only in this browser (localStorage).${escapeHtml(when)}</p>
  `;
}

/**
 * Bootstrap Self-Check survey page.
 * @returns {void}
 */
export function initSurveyPage() {
  const form = document.getElementById("self-check-form");
  const resultEl = document.getElementById("survey-result");
  const note = document.getElementById("survey-note");
  const scorer = new SelfCheckScorer();
  if (!(form instanceof HTMLFormElement)) return;

  form.querySelectorAll("input, button").forEach((el) => {
    el.disabled = false;
  });

  if (note) {
    note.textContent =
      "Answers stay on this device. Nothing is sent to a server.";
  }

  const saved = readJson(STORAGE_KEY, null);
  if (saved?.answers) {
    applyAnswersToForm(form, saved.answers);
    showResult(resultEl, saved);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const answers = {
      q1: String(formData.get("q1") || ""),
      q2: String(formData.get("q2") || ""),
      q3: String(formData.get("q3") || ""),
    };

    if (!answers.q1 || !answers.q2 || !answers.q3) {
      if (resultEl) {
        resultEl.hidden = false;
        resultEl.innerHTML =
          '<p class="shell-label">Almost there</p><p>Please answer all three questions before saving.</p>';
      }
      return;
    }

    const scored = scorer.score(answers);
    const payload = {
      answers,
      ...scored,
      savedAt: new Date().toISOString(),
    };

    writeJson(STORAGE_KEY, payload);
    showResult(resultEl, payload);
  });

  const resetBtn = document.getElementById("survey-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      form.reset();
      if (resultEl) {
        resultEl.hidden = true;
        resultEl.replaceChildren();
      }
    });
  }
}
