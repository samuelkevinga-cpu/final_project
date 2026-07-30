# Everything about Addiction

Educational web app for **WDD 330** — clear facts, myth-busting, and hopeful learning about addiction science.

**Live site (GitHub Pages, `main` branch root):**  
https://samuelkevinga-cpu.github.io/final_project/

**Repository:**  
https://github.com/samuelkevinga-cpu/final_project

## Week 5 goals (this commit)

- Multi-page HTML structure (Home, Myth vs Fact, News, Glossary, Self-Check, Videos)
- Hopeful blue/green CSS shell with Montserrat
- ES module JS (`main.js`, `api.js`) with **placeholder API keys**
- Console-only News API + YouTube Data API fetch attempts
- Local starter data in `data/glossary.json`

Interactive features (flip cards, filters, survey save, rendering API data on the page) are scheduled for **Week 6**.

## Project structure

```
index.html          Home
myth-fact.html      Myth vs Fact shell
news.html           News feed shell
glossary.html       Glossary shell
survey.html         Self-check survey shell
videos.html         Video hub shell
css/styles.css      Layout and graphic identity
js/main.js          Nav + page bootstrap
js/api.js           External API fetch helpers
data/glossary.json  Local glossary terms
```

## How to preview locally

Because the project uses ES modules, open it with a simple local server (not `file://`):

```bash
# from the project root
python3 -m http.server 5500
```

Then visit `http://localhost:5500`.

Open the browser **console (F12)** on Home, News, or Videos to see API log output.

## API keys (placeholders)

In `js/api.js` replace:

- `YOUR_NEWS_API_KEY`
- `YOUR_YOUTUBE_API_KEY`

Register keys at:

- [News API](https://newsapi.org/)
- [Google Cloud / YouTube Data API](https://developers.google.com/youtube/v3)

Do not paste production secrets into a public repo if you can avoid it.

## Note for Week 6 — News API CORS

Calling News API **directly from the browser** often fails with a **CORS** error, even with a valid key.  
**Plan for next week:** use a small proxy, serverless function, or another course-approved approach so article JSON can load and render on the page. Until then, treat console errors from News API as expected during local/GitHub Pages testing.

## Trello

https://trello.com/b/InsysM2P/team-01-trello-board

## Course requirements (final target)

Vanilla HTML/CSS/JS (no JS frameworks), at least two third-party APIs, static + dynamic markup, CSS animation, modules/organization, accessible valid markup. See:  
https://byui-cse.github.io/wdd330-ww-course/week07/final-project-requirements.html
