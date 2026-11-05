# Kurt Riggin — Personal Portfolio

Static site (plain HTML/CSS/JS, no build step) with three tabs: **Home**, **Academic**, **YouTube**.

## Edit content
- **Links, typing words, videos:** `js/config.js`
  - YouTube videos **sync automatically**: the `YouTube sync` GitHub Action (every 6 hours, or Actions → YouTube sync → Run workflow) writes `js/youtube-data.js` from the channel. Optional repo secret `YOUTUBE_API_KEY` adds views, durations, subscriber count and full history. To pin a featured video, set `VIDEOS.featured.id`.
- **Research / publications:** `academic.html`
- **Styling / colors:** `css/style.css` (dark theme variables at the top, light overrides under `:root[data-theme="light"]`). The sun/moon button in the nav switches themes; first visit follows the visitor's system setting, and their choice is remembered.

## Preview locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Deploy (GitHub Pages)
Live at **https://kriggithub.github.io**: every push to `main` deploys (Settings → Pages → *Deploy from a branch* → `main` / root).

This site started as the 30-minute speedrun from my YouTube video and has changed since. The version frozen at the end of the video, which you can copy, is at
[kriggithub/YT_Portfolio_Website_Template](https://github.com/kriggithub/YT_Portfolio_Website_Template).
