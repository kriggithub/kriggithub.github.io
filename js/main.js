/* ---------- Light / dark theme ----------
   With no saved choice the CSS follows the system setting. The button saves
   an explicit choice (data-theme on <html>), which the inline script in each
   page's <head> re-applies before first paint. */
const Theme = (() => {
  const root = document.documentElement;
  const sys = matchMedia("(prefers-color-scheme: dark)");
  const meta = document.querySelector('meta[name="theme-color"]');
  const btn = document.getElementById("theme-toggle");
  const current = () => root.dataset.theme || (sys.matches ? "dark" : "light");
  const sync = () => {
    const t = current();
    if (meta) meta.content = t === "dark" ? "#111515" : "#fafbfb";
    if (btn) {
      btn.textContent = t === "dark" ? "Light" : "Dark";
      btn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
    dispatchEvent(new CustomEvent("themechange", { detail: t }));
  };
  btn?.addEventListener("click", () => {
    const t = current() === "dark" ? "light" : "dark";
    root.dataset.theme = t;
    try { localStorage.setItem("theme", t); } catch (e) {}
    sync();
  });
  sys.addEventListener("change", sync);
  sync();
  return { current };
})();

/* ---------- Links ---------- */
const LABELS = { github: "GitHub", linkedin: "LinkedIn", youtube: "YouTube", email: "Email" };
document.querySelectorAll("[data-socials]").forEach((el) => {
  el.innerHTML = Object.entries(SITE.links)
    .map(([k, url]) => {
      const ext = k === "email" ? "" : ' target="_blank" rel="noopener"';
      return `<a href="${url}"${ext}>${LABELS[k]}</a>`;
    })
    .join("");
});
document.querySelectorAll("[data-link]").forEach((el) => { el.href = SITE.links[el.dataset.link]; });

/* Email address shown as text, with a copy button */
const address = SITE.links.email.replace("mailto:", "");
document.querySelectorAll("[data-email]").forEach((el) => (el.textContent = address));
const copyBtn = document.getElementById("copy-email");
copyBtn?.addEventListener("click", () => {
  const done = (msg) => { copyBtn.textContent = msg; setTimeout(() => (copyBtn.textContent = "Copy address"), 1800); };
  navigator.clipboard?.writeText(address).then(() => done("Copied"), () => done("Select it above"));
});

/* ---------- Active nav link ---------- */
const page = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav a").forEach((a) => {
  if (a.getAttribute("href").split("/").pop() === page) a.classList.add("active");
});

/* ---------- YouTube data ----------
   Synced videos (js/youtube-data.js, written by the "YouTube sync" GitHub
   Action) win; VIDEOS in config.js is the fallback and can pin a featured
   video. */
const SYNC = window.YT_SYNC || null;
if (typeof VIDEOS !== "undefined") {
  const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtNum = (n) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  const synced = (SYNC && SYNC.videos ? SYNC.videos : []).map((v) => ({
    id: v.id,
    title: v.title,
    category: v.short ? "Shorts" : "Videos",
    duration: v.duration,
    date: [fmtDate(v.published), v.views != null ? `${fmtNum(v.views)} views` : ""].filter(Boolean).join(" · "),
    url: v.short ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`,
  }));
  const longForm = synced.filter((v) => v.category === "Videos");
  const featured = VIDEOS.featured.id ? VIDEOS.featured : longForm[0] || VIDEOS.featured;
  const videoList = synced.length ? synced.filter((v) => v.id !== featured.id) : VIDEOS.list;

  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const thumb = (v, label) =>
    v.id
      ? `<img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy">`
      : `<div class="thumb-ph"><span>${esc(label)}</span></div>`;
  const videoCard = (v) => {
    const href = v.url || (v.id ? `https://www.youtube.com/watch?v=${v.id}` : SITE.links.youtube);
    return `<a class="video-card" href="${href}" target="_blank" rel="noopener">
      <div class="video-thumb">${thumb(v, "Thumbnail")}${v.duration ? `<span class="duration">${v.duration}</span>` : ""}</div>
      <h3>${esc(v.title)}</h3>
      <p class="meta">${esc([v.category, v.date].filter(Boolean).join(" · "))}</p>
    </a>`;
  };

  /* Channel stats line */
  const chStats = document.getElementById("channel-stats");
  if (chStats && SYNC && SYNC.channel && (synced.length || SYNC.channel.subscribers)) {
    const c = SYNC.channel, bits = [chStats.dataset.handle];
    if (c.subscribers != null) bits.push(`${fmtNum(c.subscribers)} subscribers`);
    bits.push(`${c.video_count != null ? c.video_count : synced.length} videos`);
    chStats.textContent = bits.join(" · ");
  }

  /* Featured video */
  const featuredEl = document.getElementById("featured");
  if (featuredEl) {
    featuredEl.innerHTML = featured.id
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${featured.id}" title="${esc(featured.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
      : thumb(featured, featured.label || "Coming soon");
    const t = document.getElementById("featured-title");
    if (t) t.textContent = featured.title;
  }

  /* Video grid + filters */
  const gridEl = document.getElementById("video-grid");
  const filtersEl = document.getElementById("filters");
  if (gridEl && !videoList.length) {
    gridEl.closest("section").hidden = true;
  } else if (gridEl) {
    const render = (cat) => {
      gridEl.innerHTML = videoList.filter((v) => cat === "All" || v.category === cat).map(videoCard).join("");
    };
    const cats = ["All", ...new Set(videoList.map((v) => v.category))];
    filtersEl.hidden = cats.length < 3;
    filtersEl.innerHTML = cats.map((c, n) => `<button class="filter${n ? "" : " active"}" type="button" data-cat="${c}">${c}</button>`).join("");
    filtersEl.addEventListener("click", (e) => {
      const b = e.target.closest(".filter");
      if (!b) return;
      filtersEl.querySelectorAll(".filter").forEach((x) => x.classList.toggle("active", x === b));
      render(b.dataset.cat);
    });
    render("All");
  }

  /* Home page: latest uploads */
  const latestEl = document.getElementById("latest-videos");
  if (latestEl) {
    const latest = [...longForm.slice(0, 2), ...synced.filter((v) => v.category === "Shorts").slice(0, 1)].slice(0, 3);
    if (latest.length) latestEl.innerHTML = latest.map(videoCard).join("");
    else latestEl.closest("section").hidden = true;
  }
}

/* ---------- Footer year ---------- */
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
