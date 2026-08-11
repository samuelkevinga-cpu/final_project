# Everything about Addiction

Educational web app for **WDD 330** — clear facts, myth-busting, and hopeful learning about addiction science.

**Live site:** https://samuelkevinga-cpu.github.io/final_project/  
**Repository:** https://github.com/samuelkevinga-cpu/final_project  
**Trello:** https://trello.com/b/InsysM2P/team-01-trello-board

## Features

- **Myth vs Fact** — flip cards with CSS animation and progress saved in `localStorage`
- **News** — topic filters + News API (CORS proxy) with curated local fallback
- **Videos** — YouTube Data API results with local fallback samples
- **Glossary** — terms loaded from JSON with search
- **Self-Check** — anonymous survey scored and saved on-device

## Stack

Vanilla HTML, CSS, and JavaScript (ES modules). No JS frameworks.

## Preview locally

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## API keys

Keys stay as placeholders in `js/api.js` so secrets are not forced into GitHub.

**Option A — browser only (recommended for a public repo):**

1. Open the live site
2. In the browser console:

```js
localStorage.setItem("eaa-news-api-key", "YOUR_NEWS_KEY");
localStorage.setItem("eaa-youtube-api-key", "YOUR_YOUTUBE_KEY");
```

3. Refresh News / Videos

**Option B — edit `js/api.js`:** replace `YOUR_NEWS_API_KEY` and `YOUR_YOUTUBE_API_KEY`.

Register keys at [News API](https://newsapi.org/) and [YouTube Data API](https://developers.google.com/youtube/v3).

Without keys, curated sample content still loads from `data/news-fallback.json` and `data/videos-fallback.json`.

## Lint

```bash
npm install
npm run lint
```

## Course requirements

https://byui-cse.github.io/wdd330-ww-course/week07/final-project-requirements.html
