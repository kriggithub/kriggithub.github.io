# Kurt Riggin — Personal Portfolio

Static site (plain HTML/CSS/JS, no build step) with three tabs: **Home**, **Academic**, **YouTube**.

## Edit content
- **Links, videos:** `js/config.js`
  - YouTube videos **sync automatically**: the `YouTube sync` GitHub Action (every 6 hours, or Actions → YouTube sync → Run workflow) writes `js/youtube-data.js` from the channel. Optional repo secret `YOUTUBE_API_KEY` adds views, durations, subscriber count and full history. To pin a featured video, set `VIDEOS.featured.id`.
- **Research / publications:** `academic.html`
- **Styling / colors:** `css/style.css`. Light palette at the top of the file, dark palette below it (twice: once for the system setting, once for the toggle; keep them in sync). The Dark/Light button in the nav saves the visitor's choice; with none saved, the site follows their system setting.
- **Figure 1 (the live CLT histogram):** `js/clt.js`, drawn in ggplot2's `theme_grey` style from the CSS colour tokens.

## Preview locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Deploy (GitHub Pages)
Live at **https://kriggithub.github.io**: every push to `main` deploys (Settings → Pages → *Deploy from a branch* → `main` / root).

This site started as the 30-minute speedrun from my YouTube video and has changed since. The version frozen at the end of the video, which you can copy, is at
[kriggithub/YT_Portfolio_Website_Template](https://github.com/kriggithub/YT_Portfolio_Website_Template).
