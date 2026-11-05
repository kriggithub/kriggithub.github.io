/* ---------- Icons ---------- */
const ICONS = {
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.13C19.54 3.55 12 3.55 12 3.55s-7.54 0-9.4.52A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.13c1.86.52 9.4.52 9.4.52s7.54 0 9.4-.52a3 3 0 0 0 2.1-2.13A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.57V8.43L15.82 12 9.6 15.57Z"/></svg>',
  email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm10 8.2L2.4 6v.3L12 12.6l9.6-6.3V6L12 12.2ZM2 8.7V18h20V8.7l-10 6.5L2 8.7Z"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
};
const LABELS = { github: "GitHub", linkedin: "LinkedIn", youtube: "YouTube", email: "Email" };

/* ---------- Social icons (any element with data-socials) ---------- */
document.querySelectorAll("[data-socials]").forEach((el) => {
  el.innerHTML = Object.entries(SITE.links)
    .map(([k, url]) => {
      const ext = k === "email" ? "" : ' target="_blank" rel="noopener"';
      return `<a class="social" href="${url}"${ext} aria-label="${LABELS[k]}" title="${LABELS[k]}">${ICONS[k]}</a>`;
    })
    .join("");
});
document.querySelectorAll("[data-link]").forEach((el) => { el.href = SITE.links[el.dataset.link]; });

/* ---------- Active tab ---------- */
const page = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".tabs a").forEach((a) => {
  if (a.getAttribute("href") === page) a.classList.add("active");
});

/* ---------- Typing effect ---------- */
const typedEl = document.querySelector(".typed");
if (typedEl) {
  const words = SITE.roles;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = 0, i = 0, deleting = false;
  const article = (word) => (/^[aeiou]/i.test(word) ? "an" : "a");
  const articleEl = document.querySelector(".article");

  const tick = () => {
    const word = words[w];
    if (articleEl) articleEl.textContent = article(word);
    if (reduce) { typedEl.textContent = word; w = (w + 1) % words.length; return setTimeout(tick, 2500); }

    i += deleting ? -1 : 1;
    typedEl.textContent = word.slice(0, i);

    let delay = deleting ? 55 : 110;
    if (!deleting && i === word.length) { delay = 1800; deleting = true; }
    else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 400; }
    setTimeout(tick, delay);
  };
  tick();
}

/* ---------- YouTube page ---------- */
const thumb = (v, label) =>
  v.id
    ? `<img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy">`
    : `<div class="thumb-ph"><div class="play">${ICONS.play}</div><span class="ph-label">${label}</span></div>`;

const featuredEl = document.getElementById("featured");
if (featuredEl) {
  const f = VIDEOS.featured;
  featuredEl.innerHTML = f.id
    ? `<iframe src="https://www.youtube-nocookie.com/embed/${f.id}" title="${f.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    : thumb(f, "// featured video placeholder");
  const t = document.getElementById("featured-title");
  if (t) t.textContent = f.title;
}

const gridEl = document.getElementById("video-grid");
const filtersEl = document.getElementById("filters");
if (gridEl) {
  const render = (cat) => {
    gridEl.innerHTML = VIDEOS.list
      .filter((v) => cat === "All" || v.category === cat)
      .map((v) => {
        const href = v.id ? `https://www.youtube.com/watch?v=${v.id}` : SITE.links.youtube;
        return `<a class="video-card reveal visible" href="${href}" target="_blank" rel="noopener">
          <div class="video-thumb">${thumb(v, "// thumbnail")}${v.duration ? `<span class="duration">${v.duration}</span>` : ""}</div>
          <div class="video-body">
            <span class="tag">${v.category}</span>
            <h3>${v.title}</h3>
            <p>${v.date || ""}</p>
          </div>
        </a>`;
      })
      .join("");
  };
  const cats = ["All", ...new Set(VIDEOS.list.map((v) => v.category))];
  filtersEl.innerHTML = cats.map((c, n) => `<button class="filter${n ? "" : " active"}" data-cat="${c}">${c}</button>`).join("");
  filtersEl.addEventListener("click", (e) => {
    const b = e.target.closest(".filter");
    if (!b) return;
    filtersEl.querySelectorAll(".filter").forEach((x) => x.classList.toggle("active", x === b));
    render(b.dataset.cat);
  });
  render("All");
}

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal:not(.visible)").forEach((el) => io.observe(el));

/* ---------- Footer year ---------- */
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
