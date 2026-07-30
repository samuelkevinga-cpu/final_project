/**
 * api.js — Week 5
 * Fetches from News API and YouTube Data API using placeholder keys.
 * Results are logged to the console only (page rendering comes in Week 6).
 *
 * NOTE FOR WEEK 6:
 * News API often blocks browser requests with CORS errors when called
 * directly from the frontend. Plan: use a small proxy, serverless function,
 * or another allowed fetch pattern so articles can load on the live page.
 */

/** @type {string} Replace with your News API key (do not commit real keys). */
export const NEWS_API_KEY = "YOUR_NEWS_API_KEY";

/** @type {string} Replace with your YouTube Data API key (do not commit real keys). */
export const YOUTUBE_API_KEY = "YOUR_YOUTUBE_API_KEY";

const NEWS_ENDPOINT =
  "https://newsapi.org/v2/everything?q=addiction%20OR%20psychology%20health&language=en&pageSize=6&sortBy=publishedAt";

const YOUTUBE_ENDPOINT =
  "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&type=video&q=addiction%20science%20explained";

/**
 * Fetch recent health/psychology articles from News API.
 * @returns {Promise<object|null>}
 */
export async function fetchNewsArticles() {
  const url = `${NEWS_ENDPOINT}&apiKey=${NEWS_API_KEY}`;
  console.log("[api] Fetching News API…", url.replace(NEWS_API_KEY, "***"));

  try {
    const response = await fetch(url);
    console.log("[api] News API status:", response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[api] News API error body:", errorBody);
      return null;
    }

    const data = await response.json();
    console.log("[api] News API JSON:", data);
    console.log("[api] Article count:", data.articles?.length ?? 0);
    return data;
  } catch (error) {
    console.error("[api] News API fetch failed (see Week 6 CORS note):", error);
    return null;
  }
}

/**
 * Fetch educational video search results from YouTube Data API.
 * @returns {Promise<object|null>}
 */
export async function fetchYouTubeVideos() {
  const url = `${YOUTUBE_ENDPOINT}&key=${YOUTUBE_API_KEY}`;
  console.log("[api] Fetching YouTube Data API…", url.replace(YOUTUBE_API_KEY, "***"));

  try {
    const response = await fetch(url);
    console.log("[api] YouTube status:", response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[api] YouTube error body:", errorBody);
      return null;
    }

    const data = await response.json();
    console.log("[api] YouTube JSON:", data);
    console.log("[api] Video result count:", data.items?.length ?? 0);
    return data;
  } catch (error) {
    console.error("[api] YouTube fetch failed:", error);
    return null;
  }
}

/**
 * Run both API checks and log a short summary for Week 5.
 * @returns {Promise<{ news: object|null, videos: object|null }>}
 */
export async function loadExternalDataToConsole() {
  console.log("[api] Week 5 console data load starting…");
  const [news, videos] = await Promise.all([
    fetchNewsArticles(),
    fetchYouTubeVideos(),
  ]);
  console.log("[api] Week 5 console data load finished.", { news, videos });
  return { news, videos };
}
