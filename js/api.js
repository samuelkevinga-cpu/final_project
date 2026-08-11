/**
 * api.js — News (Cloudflare Worker + fallback) and YouTube Data API helpers.
 */

/** @type {string} YouTube Data API key. */
export const YOUTUBE_API_KEY = "AIzaSyAsMiSF6rGofVYABX_-MIbctOAkGIAeHlc";

/** Cloudflare Worker URL for News (no trailing slash). */
export const NEWS_PROXY_URL = "https://finalproject.kpachecogarcia.workers.dev";

const YOUTUBE_KEY_STORAGE = "eaa-youtube-api-key";
const NEWS_PROXY_STORAGE = "eaa-news-proxy-url";

/**
 * @param {string} storageKey
 * @param {string} fallback
 * @returns {string}
 */
function resolveStoredValue(storageKey, fallback) {
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
function getYouTubeKey() {
  return resolveStoredValue(YOUTUBE_KEY_STORAGE, YOUTUBE_API_KEY);
}

/**
 * @returns {string}
 */
function getNewsProxyUrl() {
  return resolveStoredValue(NEWS_PROXY_STORAGE, NEWS_PROXY_URL).replace(/\/$/, "");
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
 * Fetch news through the Cloudflare Worker proxy.
 * @param {string} topic
 * @param {string} proxyBase
 * @returns {Promise<object>}
 */
async function fetchNewsViaWorker(topic, proxyBase) {
  const url = `${proxyBase}/?topic=${encodeURIComponent(topic)}&pageSize=6`;
  console.log("[api] Fetching News via Worker…", proxyBase);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    console.log("[api] News worker status:", response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[api] News worker error body:", errorBody);
      throw new Error(`News worker HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.articles?.length) {
      throw new Error(data.message || "News worker returned no articles");
    }

    console.log("[api] News article count:", data.articles.length);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch news articles for a topic. Uses Worker proxy + fallback.
 * @param {string} [topic="all"]
 * @returns {Promise<{ data: object|null, source: "api"|"fallback", error?: string }>}
 */
export async function fetchNewsArticles(topic = "all") {
  const proxyBase = getNewsProxyUrl();

  if (proxyBase) {
    try {
      const data = await fetchNewsViaWorker(topic, proxyBase);
      return { data, source: "api" };
    } catch (error) {
      console.error("[api] News worker failed — using fallback:", error);
      try {
        const data = await fetchNewsFallback();
        return {
          data,
          source: "fallback",
          error: String(error.message || error),
        };
      } catch (fallbackError) {
        return { data: null, source: "fallback", error: String(fallbackError) };
      }
    }
  }

  console.warn(
    "[api] NEWS_PROXY_URL is empty. Using local fallback."
  );
  try {
    const data = await fetchNewsFallback();
    return {
      data,
      source: "fallback",
      error: "NEWS_PROXY_URL not set",
    };
  } catch (error) {
    return { data: null, source: "fallback", error: String(error) };
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
