/**
 * api.js — News API (CORS proxy + fallback) and YouTube Data API helpers.
 *
 * Keys can be set in this file, or saved in the browser:
 *   localStorage.setItem("eaa-news-api-key", "YOUR_KEY")
 *   localStorage.setItem("eaa-youtube-api-key", "YOUR_KEY")
 *
 * News API blocks most browser origins (CORS). Flow:
 * 1) Request through a public CORS proxy
 * 2) If that fails (or keys are missing), load local fallback JSON
 */

/** @type {string} Optional hardcoded News API key (prefer localStorage on public repos). */
export const NEWS_API_KEY = "95d49816b93b4e50b106dc9b733f657a";

/** @type {string} Optional hardcoded YouTube Data API key. */
export const YOUTUBE_API_KEY = "AIzaSyAsMiSF6rGofVYABX_-MIbctOAkGIAeHlc";

const NEWS_KEY_STORAGE = "eaa-news-api-key";
const YOUTUBE_KEY_STORAGE = "eaa-youtube-api-key";

/** Public read-through proxy so browser pages can reach newsapi.org */
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

const TOPIC_QUERIES = {
  all: "addiction OR psychology health",
  digital: "digital addiction OR screen addiction OR internet addiction",
  chemical: "substance addiction OR drug addiction OR alcohol addiction",
  "mental-health": "mental health addiction OR addiction recovery psychology",
};

/**
 * @param {string} storageKey
 * @param {string} fallback
 * @returns {string}
 */
function resolveApiKey(storageKey, fallback) {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // localStorage may be blocked in some privacy modes
  }
  return fallback;
}

/**
 * @returns {string}
 */
function getNewsKey() {
  return resolveApiKey(NEWS_KEY_STORAGE, NEWS_API_KEY);
}

/**
 * @returns {string}
 */
function getYouTubeKey() {
  return resolveApiKey(YOUTUBE_KEY_STORAGE, YOUTUBE_API_KEY);
}

/**
 * @param {string} topic
 * @returns {string}
 */
function newsQueryForTopic(topic) {
  return TOPIC_QUERIES[topic] ?? TOPIC_QUERIES.all;
}

/**
 * @param {string} targetUrl
 * @returns {Promise<Response>}
 */
async function fetchViaCorsProxy(targetUrl) {
  const proxied = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
  console.log("[api] Fetching via CORS proxy…");
  return fetch(proxied);
}

/**
 * @param {string} key
 * @returns {boolean}
 */
function isConfiguredKey(key) {
  return Boolean(key) && key !== "YOUR_NEWS_API_KEY" && key !== "YOUR_YOUTUBE_API_KEY";
}

/**
 * Load local fallback articles (always available offline / without keys).
 * @returns {Promise<object>}
 */
export async function fetchNewsFallback() {
  const response = await fetch("data/news-fallback.json");
  if (!response.ok) {
    throw new Error(`Fallback news HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Load local fallback videos.
 * @returns {Promise<object>}
 */
export async function fetchVideosFallback() {
  const response = await fetch("data/videos-fallback.json");
  if (!response.ok) {
    throw new Error(`Fallback videos HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Fetch news articles for a topic. Uses proxy + fallback.
 * @param {string} [topic="all"]
 * @returns {Promise<{ data: object|null, source: "api"|"fallback", error?: string }>}
 */
export async function fetchNewsArticles(topic = "all") {
  const apiKey = getNewsKey();
  const query = encodeURIComponent(newsQueryForTopic(topic));
  const endpoint = `https://newsapi.org/v2/everything?q=${query}&language=en&pageSize=6&sortBy=publishedAt&apiKey=${apiKey}`;

  if (!isConfiguredKey(apiKey)) {
    console.warn("[api] News API key missing — using local fallback.");
    try {
      const data = await fetchNewsFallback();
      return { data, source: "fallback", error: "Missing News API key" };
    } catch (error) {
      console.error("[api] Fallback news failed:", error);
      return { data: null, source: "fallback", error: String(error) };
    }
  }

  try {
    // Direct browser calls to News API usually fail CORS on GitHub Pages.
    const response = await fetchViaCorsProxy(endpoint);
    console.log("[api] News proxy status:", response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[api] News API error body:", errorBody);
      throw new Error(`News API HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.articles?.length) {
      throw new Error("News API returned no articles");
    }

    console.log("[api] News API article count:", data.articles.length);
    return { data, source: "api" };
  } catch (error) {
    console.error("[api] News fetch failed — using fallback:", error);
    try {
      const data = await fetchNewsFallback();
      return { data, source: "fallback", error: String(error.message || error) };
    } catch (fallbackError) {
      return { data: null, source: "fallback", error: String(fallbackError) };
    }
  }
}

/**
 * Fetch educational video search results from YouTube Data API.
 * @param {string} [query="addiction science explained"]
 * @returns {Promise<{ data: object|null, source: "api"|"fallback", error?: string }>}
 */
export async function fetchYouTubeVideos(query = "addiction science explained") {
  const apiKey = getYouTubeKey();
  const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&type=video&q=${encodeURIComponent(query)}&key=${apiKey}`;

  if (!isConfiguredKey(apiKey)) {
    console.warn("[api] YouTube API key missing — using local fallback.");
    try {
      const data = await fetchVideosFallback();
      return { data, source: "fallback", error: "Missing YouTube API key" };
    } catch (error) {
      return { data: null, source: "fallback", error: String(error) };
    }
  }

  try {
    console.log("[api] Fetching YouTube Data API…", endpoint.replace(apiKey, "***"));
    const response = await fetch(endpoint);
    console.log("[api] YouTube status:", response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[api] YouTube error body:", errorBody);
      throw new Error(`YouTube HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.items?.length) {
      throw new Error("YouTube returned no videos");
    }

    console.log("[api] YouTube result count:", data.items.length);
    return { data, source: "api" };
  } catch (error) {
    console.error("[api] YouTube fetch failed — using fallback:", error);
    try {
      const data = await fetchVideosFallback();
      return { data, source: "fallback", error: String(error.message || error) };
    } catch (fallbackError) {
      return { data: null, source: "fallback", error: String(fallbackError) };
    }
  }
}

/**
 * Filter fallback (or API) articles by topic tags when present.
 * @param {object[]} articles
 * @param {string} topic
 * @returns {object[]}
 */
export function filterArticlesByTopic(articles, topic) {
  if (!Array.isArray(articles) || topic === "all") return articles ?? [];

  const keywords = {
    digital: ["digital", "screen", "internet", "social media", "app", "phone"],
    chemical: ["substance", "drug", "alcohol", "chemical", "nicotine", "opioid"],
    "mental-health": ["mental", "stigma", "psychology", "recovery", "brain", "health"],
  }[topic];

  if (!keywords) return articles;

  return articles.filter((article) => {
    if (article.topic === topic) return true;
    const haystack = [
      article.title,
      article.description,
      article.content,
      article.source?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return keywords.some((word) => haystack.includes(word));
  });
}
