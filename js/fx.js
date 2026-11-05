/* =========================================================
   FX: cursor trail, spotlight, custom cursor, network,
   card glow + tilt, magnetic buttons, scramble, ⌘K palette,
   page transitions, scroll progress, easter egg.
   ========================================================= */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;
  const mouse = { x: -999, y: -999 };

  /* Canvas colours follow the theme: INK is the foreground RGB triplet, PAPER the background. */
  let INK = "255,255,255", PAPER = "5,5,5";
  const readTheme = () => {
    const cs = getComputedStyle(root);
    INK = cs.getPropertyValue("--ink").trim() || INK;
    PAPER = cs.getPropertyValue("--paper").trim() || PAPER;
  };
  readTheme(); addEventListener("themechange", readTheme);

  /* ---------- Spotlight + lit grid ---------- */
  addEventListener("pointermove", (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    root.style.setProperty("--mx", e.clientX + "px");
    root.style.setProperty("--my", e.clientY + "px");
  }, { passive: true });

  /* ---------- Custom cursor + trail ---------- */
  if (fine && !reduce) {
    root.classList.add("fine");
    const dot = Object.assign(document.createElement("div"), { className: "cursor-dot" });
    const ring = Object.assign(document.createElement("div"), { className: "cursor-ring" });
    const cv = Object.assign(document.createElement("canvas"), { id: "trail" });
    document.body.append(cv, ring, dot);
    const ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const size = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener("resize", size);

    const pts = []; const MAX = 28;
    let rx = 0, ry = 0;
    addEventListener("pointermove", (e) => pts.push({ x: e.clientX, y: e.clientY, t: performance.now() }), { passive: true });
    addEventListener("pointerdown", (e) => {
      ring.classList.add("down");
      const r = Object.assign(document.createElement("div"), { className: "ripple" });
      r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px";
      document.body.append(r); setTimeout(() => r.remove(), 700);
    });
    addEventListener("pointerup", () => ring.classList.remove("down"));
    document.addEventListener("pointerover", (e) => ring.classList.toggle("hover", !!e.target.closest("a, button, .filter, input")));
    document.addEventListener("mouseleave", () => { mouse.x = mouse.y = -999; });

    const loop = () => {
      const now = performance.now();
      while (pts.length && (now - pts[0].t > 450 || pts.length > MAX)) pts.shift();
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const life = 1 - (now - b.t) / 450;
        const k = i / pts.length;
        ctx.strokeStyle = `rgba(${INK},${0.55 * life * k})`;
        ctx.lineWidth = 1 + 5 * k * life;
        ctx.shadowColor = `rgba(${INK},.8)`; ctx.shadowBlur = 12 * life;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      rx += (mouse.x - rx) * 0.18; ry += (mouse.y - ry) * 0.18;
      dot.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Hero particle network ---------- */
  const net = document.getElementById("network");
  if (net && !reduce) {
    const ctx = net.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W, H, nodes = [];
    const init = () => {
      W = net.clientWidth; H = net.clientHeight;
      net.width = W * dpr; net.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(110, Math.floor((W * H) / 11000));
      nodes = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .6 }));
    };
    init(); addEventListener("resize", init);
    const draw = () => {
      const rect = net.getBoundingClientRect();
      const mx = mouse.x - rect.left, my = mouse.y - rect.top;
      ctx.clearRect(0, 0, W, H);
      for (const p of nodes) {
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
        if (d < 140 && d > 0) { p.x += (dx / d) * 1.2; p.y += (dy / d) * 1.2; } // gentle repel
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) { ctx.strokeStyle = `rgba(${INK},${(1 - d / 120) * 0.18})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        const dm = Math.hypot(a.x - mx, a.y - my);
        if (dm < 200) { ctx.strokeStyle = `rgba(${INK},${(1 - dm / 200) * 0.45})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke(); }
        ctx.fillStyle = `rgba(${INK},.7)`; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------- Card glow + 3D tilt ---------- */
  const glowSel = ".card, .video-card, .feature, .stat, .channel";
  document.addEventListener("pointermove", (e) => {
    const el = e.target.closest(glowSel);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    el.style.setProperty("--x", x + "px"); el.style.setProperty("--y", y + "px");
    if (fine && !reduce && !el.matches(".feature, .channel")) {
      el.classList.add("tilt");
      const rx = ((y / r.height) - .5) * -8, ry = ((x / r.width) - .5) * 8;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    }
  });
  document.addEventListener("pointerout", (e) => {
    const el = e.target.closest(glowSel);
    if (el && !el.contains(e.relatedTarget)) el.style.transform = "";
  });

  /* ---------- Magnetic buttons ---------- */
  if (fine && !reduce) {
    document.addEventListener("pointermove", (e) => {
      document.querySelectorAll(".btn, .social, .kbd-btn").forEach((b) => {
        const r = b.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy);
        b.style.translate = d < 90 ? `${dx * 0.25}px ${dy * 0.25}px` : "0 0";
      });
    }, { passive: true });
  }

  /* ---------- Text scramble ---------- */
  const glyphs = "!<>-_\\/[]{}—=+*^?#01σμβχ²";
  const scramble = (el) => {
    const final = el.textContent; let frame = 0;
    const total = 22;
    const tick = () => {
      el.textContent = final.split("").map((c, i) =>
        c === " " ? " " : i / final.length < frame / total ? c : glyphs[(Math.random() * glyphs.length) | 0]).join("");
      if (++frame <= total) requestAnimationFrame(tick); else el.textContent = final;
    };
    tick();
  };
  if (!reduce) {
    const so = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { scramble(e.target); so.unobserve(e.target); } }), { threshold: 0.5 });
    document.querySelectorAll(".eyebrow, [data-scramble]").forEach((el) => { if (el.children.length === 0) so.observe(el); });
    document.querySelectorAll(".logo").forEach((l) => l.addEventListener("mouseenter", () => {
      if (l.dataset.busy) return; l.dataset.busy = 1;
      const span = l.querySelector(".dot"); const orig = l.innerHTML; l.textContent = l.textContent; scramble(l);
      setTimeout(() => { l.innerHTML = orig; delete l.dataset.busy; }, 500);
    }));
  }

  /* ---------- Scroll progress ---------- */
  const prog = document.querySelector(".progress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    prog && prog.style.setProperty("--p", max > 0 ? scrollY / max : 0);
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- Page transitions ---------- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (!href || !/\.html$/.test(href)) return;
    e.preventDefault(); document.body.classList.add("leaving");
    setTimeout(() => (location.href = href), 300);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) document.body.classList.remove("leaving"); });

  /* ---------- Toast ---------- */
  const toast = (msg) => {
    let t = document.querySelector(".toast");
    if (!t) { t = Object.assign(document.createElement("div"), { className: "toast" }); document.body.append(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2000);
  };

  /* ---------- Command palette (⌘K / Ctrl+K / "/") ---------- */
  const email = SITE.links.email.replace("mailto:", "");
  const go = (u) => () => { document.body.classList.add("leaving"); setTimeout(() => (location.href = u), 250); };
  const open = (u) => () => window.open(u, "_blank", "noopener");
  const cmds = [
    { label: "Home", hint: "page", run: go("index.html") },
    { label: "Academic", hint: "page", run: go("academic.html") },
    { label: "YouTube", hint: "page", run: go("youtube.html") },
    { label: "GitHub", hint: "link", run: open(SITE.links.github) },
    { label: "LinkedIn", hint: "link", run: open(SITE.links.linkedin) },
    { label: "YouTube channel", hint: "link", run: open(SITE.links.youtube) },
    { label: "Work with me", hint: "section", run: go("index.html#work") },
    { label: "Copy this website (free template)", hint: "link", run: open("https://github.com/kriggithub/YT_Portfolio_Website_Template") },
    { label: "Send an email", hint: "mail", run: () => (location.href = SITE.links.email) },
    { label: "Copy email address", hint: "copy", run: () => navigator.clipboard.writeText(email).then(() => toast("Email copied ✓")) },
    { label: "Toggle light / dark theme", hint: "theme", run: () => Theme.toggle() },
    { label: "Make it rain (statistics)", hint: "fun", run: () => rain() },
  ];
  const bd = document.createElement("div");
  bd.className = "cmdk-backdrop";
  bd.innerHTML = `<div class="cmdk" role="dialog" aria-label="Command palette"><input placeholder="Type a command or search…" aria-label="Search commands"><ul></ul><div class="foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> select</span><span><kbd>esc</kbd> close</span></div></div>`;
  document.body.append(bd);
  const input = bd.querySelector("input"), list = bd.querySelector("ul");
  let sel = 0, shown = cmds;
  const render = () => {
    const q = input.value.toLowerCase();
    shown = cmds.filter((c) => c.label.toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    list.innerHTML = shown.map((c, i) => `<li class="${i === sel ? "sel" : ""}" data-i="${i}">${c.label}<small>${c.hint}</small></li>`).join("") || `<li>No results</li>`;
  };
  const openP = () => { bd.classList.add("open"); input.value = ""; sel = 0; render(); setTimeout(() => input.focus(), 10); };
  const closeP = () => bd.classList.remove("open");
  const runSel = () => { const c = shown[sel]; if (c) { closeP(); c.run(); } };
  document.getElementById("cmdk-open")?.addEventListener("click", openP);
  bd.addEventListener("click", (e) => { if (e.target === bd) closeP(); const li = e.target.closest("li[data-i]"); if (li) { sel = +li.dataset.i; runSel(); } });
  list.addEventListener("pointermove", (e) => { const li = e.target.closest("li[data-i]"); if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; render(); } });
  input.addEventListener("input", () => { sel = 0; render(); });
  addEventListener("keydown", (e) => {
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !bd.classList.contains("open") && document.activeElement.tagName !== "INPUT")) { e.preventDefault(); bd.classList.contains("open") ? closeP() : openP(); return; }
    if (!bd.classList.contains("open")) return;
    if (e.key === "Escape") closeP();
    else if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % shown.length; render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; render(); }
    else if (e.key === "Enter") runSel();
  });

  /* ---------- Easter egg: type "stats" anywhere ---------- */
  let buf = "";
  addEventListener("keydown", (e) => {
    if (document.activeElement.tagName === "INPUT" || e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-5);
    if (buf === "stats") rain();
  });
  function rain() {
    if (document.getElementById("rain")) return;
    toast("p < 0.05 — statistically significant ✓");
    const cv = Object.assign(document.createElement("canvas"), { id: "rain" });
    document.body.append(cv);
    const ctx = cv.getContext("2d");
    cv.width = innerWidth; cv.height = innerHeight;
    const chars = "01σμβαχλΣπ∫≈±√∞ρθŷx̄".split("");
    const fs = 16, cols = Math.ceil(innerWidth / fs), drops = Array(cols).fill(0).map(() => Math.random() * -40);
    const start = performance.now();
    const step = () => {
      const t = performance.now() - start;
      ctx.fillStyle = `rgba(${PAPER},.12)`; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.font = `${fs}px JetBrains Mono, monospace`;
      drops.forEach((y, i) => {
        ctx.fillStyle = Math.random() > .95 ? `rgb(${INK})` : `rgba(${INK},.55)`;
        ctx.fillText(chars[(Math.random() * chars.length) | 0], i * fs, y * fs);
        drops[i] = y * fs > cv.height && Math.random() > .97 ? 0 : y + 1;
      });
      if (t < 4000) requestAnimationFrame(step);
      else { cv.style.transition = "opacity .8s"; cv.style.opacity = 0; setTimeout(() => cv.remove(), 800); }
    };
    step();
  }

  /* ---------- Hello, devs ---------- */
  console.log("%cHi, I'm Kurt.", "font: 700 28px Inter, sans-serif; color: #fff; background: #000; padding: 8px 14px; border-radius: 8px;");
  console.log("%cBiostatistician · YouTuber · AI builder · " + SITE.links.github + "\nTry ⌘K, or type 'stats' anywhere.", "color: #888; font-family: monospace;");
})();

/* ---------- CLT simulation ---------- */
(() => {
  const cv = document.getElementById("clt");
  if (!cv) return;
  const ctx = cv.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2);
  let INK = "255,255,255";
  const readInk = () => { INK = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || INK; };
  readInk(); addEventListener("themechange", readInk);
  const BINS = 41, K = 12;
  let bins, n, sum, sum2, falling, W, H;
  const reset = () => { bins = new Array(BINS).fill(0); n = 0; sum = 0; sum2 = 0; falling = []; };
  const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  reset(); size(); addEventListener("resize", size);
  document.getElementById("clt-reset").addEventListener("click", reset);
  const $n = document.getElementById("clt-n"), $mu = document.getElementById("clt-mu"), $sd = document.getElementById("clt-sd");
  let visible = false;
  new IntersectionObserver((e) => (visible = e[0].isIntersecting)).observe(cv);
  const step = () => {
    requestAnimationFrame(step);
    if (!visible) return;
    for (let s = 0; s < 3; s++) {
      let m = 0; for (let i = 0; i < K; i++) m += Math.random(); m /= K;   // mean of K uniforms
      const z = (m - 0.5) / Math.sqrt(1 / 12 / K);                          // standardize
      const b = Math.round((z + 4) / 8 * (BINS - 1));
      if (b >= 0 && b < BINS) falling.push({ b, y: -6, v: 2 + Math.random() * 2 });
      n++; sum += z; sum2 += z * z;
    }
    const pad = 16, bw = (W - pad * 2) / BINS, max = Math.max(30, ...bins);
    const sy = (H - pad * 2) / (max * 1.15);
    ctx.clearRect(0, 0, W, H);
    // axis
    ctx.strokeStyle = `rgba(${INK},.12)`; ctx.beginPath(); ctx.moveTo(pad, H - pad); ctx.lineTo(W - pad, H - pad); ctx.stroke();
    // bars
    bins.forEach((c, i) => {
      const h = c * sy;
      ctx.fillStyle = `rgba(${INK},${0.25 + 0.6 * (c / max)})`;
      ctx.fillRect(pad + i * bw + 1, H - pad - h, bw - 2, h);
    });
    // falling dots
    falling = falling.filter((d) => {
      d.y += d.v; d.v += 0.35;
      const top = H - pad - bins[d.b] * sy;
      if (d.y >= top) { bins[d.b]++; return false; }
      ctx.fillStyle = `rgb(${INK})`; ctx.beginPath(); ctx.arc(pad + (d.b + .5) * bw, d.y, 2, 0, 7); ctx.fill();
      return true;
    });
    // theoretical normal curve
    const total = bins.reduce((a, b) => a + b, 0);
    if (total > 20) {
      ctx.strokeStyle = `rgba(${INK},.9)`; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath();
      for (let x = 0; x <= BINS - 1; x += 0.25) {
        const z = x / (BINS - 1) * 8 - 4, pdf = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
        const y = H - pad - pdf * total * (8 / (BINS - 1)) * sy;
        x ? ctx.lineTo(pad + (x + .5) * bw, y) : ctx.moveTo(pad + (x + .5) * bw, y);
      }
      ctx.stroke(); ctx.setLineDash([]);
    }
    $n.textContent = n.toLocaleString();
    const mu = sum / n; $mu.textContent = mu.toFixed(2);
    $sd.textContent = Math.sqrt(sum2 / n - mu * mu).toFixed(2);
    if (n > 6000) reset();
  };
  step();
})();

/* ---------- Count-up numbers ---------- */
(() => {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, t0 = performance.now();
    const tick = (t) => { const p = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }));
  document.querySelectorAll("[data-count]").forEach((el) => io.observe(el));
})();
