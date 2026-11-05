# Kurt Riggin — Personal Portfolio

Static site (plain HTML/CSS/JS, no build step) with three tabs: **Home**, **Academic**, **YouTube**.

## Edit content
- **Links, typing words, videos:** `js/config.js`
  - Add a YouTube video by pasting its ID (the part after `watch?v=`) into `id`. Thumbnails and links fill in automatically; empty IDs show placeholders.
- **Research / publications:** `academic.html`
- **Styling / colors:** `css/style.css` (theme variables at the top)

## Preview locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Deploy (GitHub Pages)
Live at **https://kriggithub.github.io**: every push to `main` deploys (Settings → Pages → *Deploy from a branch* → `main` / root).

This site started as the 30-minute speedrun from my YouTube video and has changed since. The version frozen at the end of the video, which you can copy, is at
[kriggithub/YT_Portfolio_Website_Template](https://github.com/kriggithub/YT_Portfolio_Website_Template).
