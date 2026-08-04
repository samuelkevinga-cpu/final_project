# Everything about Addiction

Educational web app for **WDD 330** — clear facts, myth-busting, and hopeful learning about addiction science.

**Live site (GitHub Pages, `main` branch root):**  
https://samuelkevinga-cpu.github.io/final_project/

**Repository:**  
https://github.com/samuelkevinga-cpu/final_project

## Week 6 goals

- Interactive Myth vs Fact flip cards with CSS animation + `localStorage` progress
- News articles rendered on the page (topic filters, loading/error status)
- News API **CORS workaround** via `api.allorigins.win`, plus `data/news-fallback.json`
- YouTube videos rendered on the page, with `data/videos-fallback.json` when needed
- Glossary built dynamically from `data/glossary.json` (with search)
- Self-check survey enabled, scored, and saved in `localStorage`
- Page logic split into ES modules

## Project structure

```
index.html          Home
myth-fact.html      Myth vs Fact flip cards
news.html           News feed + filters
glossary.html       Glossary (JSON + search)
survey.html         Self-check survey
videos.html         Video hub
css/styles.css      Layout, flip cards, media cards
js/main.js          Nav + page router
js/api.js           News / YouTube fetch helpers
js/mythFact.js      Flip cards module
js/news.js          News render + filters
js/videos.js        YouTube render
js/glossary.js      Glossary render + search
js/survey.js        Survey + localStorage
js/storage.js       localStorage helpers
data/glossary.json  Glossary terms
data/myths.json     Myth / fact cards
data/news-fallback.json
data/videos-fallback.json
```

## How to preview locally

Because the project uses ES modules, open it with a simple local server (not `file://`):

```bash
# from the project root
python -m http.server 5500
```

Then visit `http://localhost:5500`.

## API keys (placeholders)

In `js/api.js` replace:

- `YOUR_NEWS_API_KEY`
- `YOUR_YOUTUBE_API_KEY`

Register keys at:

- [News API](https://newsapi.org/)
- [Google Cloud / YouTube Data API](https://developers.google.com/youtube/v3)

Do not paste production secrets into a public repo if you can avoid it.  
Until keys are set, News and Videos pages still work using the local fallback JSON files.

## News API CORS (Week 6)

Calling News API **directly from the browser** usually fails with a **CORS** error.  
This project requests News API through **AllOrigins** (`https://api.allorigins.win/raw?url=...`).  
If the proxy or key fails, the UI loads `data/news-fallback.json` so the page stays usable on GitHub Pages.

## Trello

https://trello.com/b/InsysM2P/team-01-trello-board

## Course requirements (final target)

Vanilla HTML/CSS/JS (no JS frameworks), at least two third-party APIs, static + dynamic markup, CSS animation, modules/organization, accessible valid markup. See:  
https://byui-cse.github.io/wdd330-ww-course/week07/final-project-requirements.html
