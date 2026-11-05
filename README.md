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
Repo → Settings → Pages → Source: *Deploy from a branch* → pick the branch and `/ (root)`.
