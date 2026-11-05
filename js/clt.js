/* =========================================================
   Figure 1: the central limit theorem, drawn the way ggplot2's
   theme_grey draws a histogram (grey panel, white major and minor
   gridlines, ticks outside the panel). Colours come from the CSS
   tokens, so it follows the light/dark theme.
   ========================================================= */
(() => {
  const cv = document.getElementById("clt");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const K = 12;                       // draws per sample mean
  const LO = -4, HI = 4, BW = 0.2;    // histogram range and bin width (z units)
  const BINS = Math.round((HI - LO) / BW);
  const RESET_AT = 8000;

  let bins, n, sum, sum2, falling, yMax = 40;
  const reset = () => { bins = new Array(BINS).fill(0); n = 0; sum = 0; sum2 = 0; falling = []; yMax = 40; };
  reset();

  const C = {};
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    for (const k of ["panel", "grid", "ink", "ink-2", "teal", "salmon"]) C[k] = cs.getPropertyValue("--" + k).trim();
  };
  readColors();
  addEventListener("themechange", () => { readColors(); if (reduce) draw(); });

  let W = 0, H = 0;
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener("resize", () => { size(); if (reduce) draw(); });

  const sampleZ = () => {
    let m = 0;
    for (let i = 0; i < K; i++) m += Math.random();
    m /= K;
    return (m - 0.5) / Math.sqrt(1 / 12 / K);
  };
  const add = (z, animate) => {
    n++; sum += z; sum2 += z * z;
    const b = Math.floor((z - LO) / BW);
    if (b < 0 || b >= BINS) return;
    if (animate) falling.push({ b, y: 0, v: 1.5 + Math.random() * 2 });
    else bins[b]++;
  };

  // "Nice" tick step, as scales::extended_breaks would roughly choose
  const niceStep = (range, target) => {
    const raw = range / target, p = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / p;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  };

  const $n = document.getElementById("clt-n"), $mu = document.getElementById("clt-mu"), $sd = document.getElementById("clt-sd");
  const fmt = new Intl.NumberFormat("en-US");

  function draw() {
    const font = getComputedStyle(document.body).fontFamily;
    const small = W < 420;
    const fs = small ? 10 : 11;
    const L = small ? 38 : 46, R = 8, T = 8, B = small ? 40 : 46;   // plot margins
    const pw = W - L - R, ph = H - T - B;
    const px = (z) => L + ((z - LO) / (HI - LO)) * pw;

    const top = Math.max(...bins, 1);
    const target = Math.max(40, top * 1.12);
    yMax += (target - yMax) * (reduce ? 1 : 0.08);
    const py = (c) => T + ph - (c / yMax) * ph;

    ctx.clearRect(0, 0, W, H);
    // panel
    ctx.fillStyle = C.panel; ctx.fillRect(L, T, pw, ph);

    // gridlines: minor first (thinner), then major
    const yStep = niceStep(yMax, 4);
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let z = LO + 1; z < HI; z += 2) { ctx.moveTo(px(z), T); ctx.lineTo(px(z), T + ph); }
    for (let c = yStep / 2; c < yMax; c += yStep) { ctx.moveTo(L, py(c)); ctx.lineTo(L + pw, py(c)); }
    ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let z = LO; z <= HI; z += 2) { ctx.moveTo(px(z), T); ctx.lineTo(px(z), T + ph); }
    for (let c = 0; c < yMax; c += yStep) { ctx.moveTo(L, py(c)); ctx.lineTo(L + pw, py(c)); }
    ctx.stroke();

    // bars
    ctx.fillStyle = C.teal;
    bins.forEach((c, i) => {
      if (!c) return;
      const x0 = px(LO + i * BW), x1 = px(LO + (i + 1) * BW);
      ctx.fillRect(x0, py(c), x1 - x0 - 0.5, T + ph - py(c));
    });

    // falling samples
    if (falling.length) {
      ctx.fillStyle = C.teal;
      falling = falling.filter((d) => {
        d.y += d.v; d.v += 0.3;
        const stop = py(bins[d.b]) - T;
        if (d.y >= stop) { bins[d.b]++; return false; }
        ctx.beginPath(); ctx.arc(px(LO + (d.b + 0.5) * BW), T + d.y, 1.8, 0, 7); ctx.fill();
        return true;
      });
    }

    // N(0,1) density scaled to counts: n * binwidth * dnorm(z)
    const landed = bins.reduce((a, b) => a + b, 0);
    if (landed > 30) {
      ctx.save();
      ctx.beginPath(); ctx.rect(L, T, pw, ph); ctx.clip();
      ctx.strokeStyle = C.salmon; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
      ctx.beginPath();
      for (let z = LO; z <= HI + 1e-9; z += 0.05) {
        const y = py(landed * BW * Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI));
        z === LO ? ctx.moveTo(px(z), y) : ctx.lineTo(px(z), y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // ticks + tick labels (outside the panel, as in theme_grey)
    ctx.strokeStyle = C["ink-2"]; ctx.lineWidth = 1;
    ctx.fillStyle = C["ink-2"];
    ctx.font = `${fs}px ${font}`;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.beginPath();
    for (let z = LO; z <= HI; z += 2) {
      ctx.moveTo(px(z), T + ph); ctx.lineTo(px(z), T + ph + 3);
      ctx.fillText(z < 0 ? "−" + -z : String(z), px(z), T + ph + 5);
    }
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (let c = 0; c < yMax; c += yStep) {
      ctx.moveTo(L - 3, py(c)); ctx.lineTo(L, py(c));
      ctx.fillText(fmt.format(Math.round(c)), L - 5, py(c));
    }
    ctx.stroke();

    // axis titles
    ctx.fillStyle = C.ink;
    ctx.font = `${fs + 1}px ${font}`;
    ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    ctx.fillText("standardized sample mean (z)", L + pw / 2, H - 2);
    ctx.save();
    ctx.translate(11, T + ph / 2); ctx.rotate(-Math.PI / 2);
    ctx.textBaseline = "middle";
    ctx.fillText("count", 0, 0);
    ctx.restore();

    // caption numbers
    const mu = n ? sum / n : 0, sd = n > 1 ? Math.sqrt(Math.max(sum2 / n - mu * mu, 0)) : 0;
    $n.textContent = fmt.format(n);
    $mu.textContent = (mu < 0 ? "−" : "") + Math.abs(mu).toFixed(2);
    $sd.textContent = sd.toFixed(2);
  }

  document.getElementById("clt-reset")?.addEventListener("click", () => {
    reset();
    if (reduce) { for (let i = 0; i < 4000; i++) add(sampleZ(), false); draw(); }
  });

  if (reduce) {
    // No animation: show a finished histogram.
    for (let i = 0; i < 4000; i++) add(sampleZ(), false);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(draw);
    return;
  }

  // Start from a partly filled histogram so the first frame already reads as a chart.
  for (let i = 0; i < 400; i++) add(sampleZ(), false);
  let visible = true;
  new IntersectionObserver((e) => (visible = e[0].isIntersecting)).observe(cv);
  const step = () => {
    requestAnimationFrame(step);
    if (!visible || document.hidden) return;
    for (let s = 0; s < 3; s++) add(sampleZ(), true);
    if (n > RESET_AT) reset();
    draw();
  };
  step();
})();
