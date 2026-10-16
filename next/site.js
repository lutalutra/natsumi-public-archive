(function () {
  "use strict";
  const A = window.ARCHIVE;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const T = {
    en: {
      "nav.index": "Index",
      info: "Works across information, editorial, and artistic practice. Based in Berlin, with a background in “Design” and “Public Art and New Artistic Strategies”.",
      contact: "Contact", close: "Close", all: "All", art: "Artistic/Research", design: "Design/Editorial",
      series: "Series", prev: "Previous", next: "Next", noImage: "No image", read: "Publication (PDF)", readJa: "Japanese edition (PDF)",
      open: "Open work", peekHint: "Point at a line to see the work. Lines run from the first to the last year of each project.",
      tracks: { art: ["Artistic practice", "Natsumi Sugiyama"], design: ["Design", "natyama"], projects: ["Studio projects", "studio natyama"] },
      status: { planned: "Planned", ongoing: "Ongoing", done: "Completed" }, since: "since",
      shelves: { authored: "Project documentation", collaborative: "Collaborative", layout_design: "Layout design" },
      facts: { venue: "Venue", medium: "Medium", role: "Role", collaborators: "With", funding: "Support", award: "Award", credit: "Credits", photo: "Photos", series: "Series" },
    },
    ja: {
      "nav.index": "インデックス",
      info: "このサイトには、展示やリサーチ、デザインプロジェクトの一部を収録しています。東京で環境デザイン、ドイツで現代美術に関する研究制作を経て、現在はUIや情報編集を軸に活動しています。",
      contact: "お問い合わせ", close: "閉じる", all: "すべて", art: "アート・リサーチ", design: "デザイン・編集",
      series: "シリーズ", prev: "前へ", next: "次へ", noImage: "画像なし", read: "出版物（PDF）", readJa: "日本語版（PDF）",
      open: "作品を見る", peekHint: "線に触れると作品が表示されます。線の長さは各プロジェクトの期間です。",
      tracks: { art: ["作家活動", "Natsumi Sugiyama"], design: ["デザイン", "natyama"], projects: ["スタジオのプロジェクト", "studio natyama"] },
      status: { planned: "準備中", ongoing: "進行中", done: "完了" }, since: "",
      shelves: { authored: "プロジェクト記録", collaborative: "共同制作", layout_design: "レイアウトデザイン" },
      facts: { venue: "会場", medium: "メディウム", role: "役割", collaborators: "協働", funding: "助成", award: "受賞", credit: "クレジット", photo: "撮影", series: "シリーズ" },
    },
  };
  let lang = "en";
  try { lang = localStorage.getItem("ns-lang") === "ja" ? "ja" : "en"; } catch (e) {}
  const t = k => T[lang][k];
  const L = o => (o && (o[lang] || o.en)) || "";

  const works = A.works.slice().sort((a, b) => b.y0 - a.y0 || a.id.localeCompare(b.id));
  const byId = Object.fromEntries(works.map(w => [w.id, w]));
  const place = w => [w.city, w.country].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ");
  const cover = w => w.images[0] || (w.book && w.book.cover) || null;
  const seriesOf = id => A.series.find(s => s.children.includes(id));

  /* ---------- opening slideshow ---------- */
  const top = $("#top"), hero = $("#hero"), foot = $("#heroFoot");
  const slides = A.hero.filter(h => byId[h.id]);
  const DUR = 6000;
  let cur = 0, timer = null, paused = false, pastHero = false;

  function buildHero() {
    $("#heroSlides").innerHTML = slides.map((s, i) =>
      `<img src="${esc(s.src)}" alt="" ${i ? 'loading="eager" decoding="async"' : 'fetchpriority="high"'} class="${i === 0 ? "is-on" : ""}">`).join("");
    $("#heroTicks").innerHTML = slides.map((s, i) =>
      `<button type="button" data-slide="${i}" aria-label="${i + 1}"><span></span></button>`).join("");
    $("#heroTicks").style.setProperty("--dur", DUR + "ms");
  }
  function tone(l) { return l < 0.5 ? "on-dark" : "on-light"; }
  function setSlide(i) {
    if (!slides.length) return;
    cur = (i + slides.length) % slides.length;
    const s = slides[cur], w = byId[s.id];
    document.querySelectorAll("#heroSlides img").forEach((im, k) => im.classList.toggle("is-on", k === cur));
    foot.classList.remove("on-dark", "on-light"); foot.classList.add(tone(s.lumBottom));
    if (!pastHero) { top.classList.remove("on-dark", "on-light"); top.classList.add(tone(s.lumTop)); }
    $("#heroCap").innerHTML = `<span class="y">${esc(w.year)}${place(w) ? ", " + esc(place(w)) : ""}</span><span class="t">${esc(L(w.title))}</span>`;
    $("#heroCap").dataset.open = w.id;
    $("#heroCount").textContent = `${cur + 1} / ${slides.length}`;
    document.querySelectorAll("#heroTicks button").forEach((b, k) => {
      b.classList.toggle("is-past", k < cur);
      b.classList.remove("is-on");
      if (k === cur && !reduced) { void b.offsetWidth; b.classList.add("is-on"); }
      if (k === cur) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (reduced || paused || document.hidden || slides.length < 2) return;
    timer = setTimeout(() => setSlide(cur + 1), DUR);
  }
  function pause(p) {
    paused = p; $("#heroTicks").classList.toggle("paused", p);
    if (p) clearTimeout(timer); else setSlide(cur);
  }
  $("#heroPrev").addEventListener("click", () => setSlide(cur - 1));
  $("#heroNext").addEventListener("click", () => setSlide(cur + 1));
  $("#heroTicks").addEventListener("click", e => { const b = e.target.closest("[data-slide]"); if (b) setSlide(+b.dataset.slide); });
  foot.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") pause(true); });
  foot.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") pause(false); });
  document.addEventListener("visibilitychange", schedule);
  let sx = null;
  hero.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener("touchend", e => {
    if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) setSlide(cur + (dx < 0 ? 1 : -1));
  });
  new IntersectionObserver(([en]) => {
    pastHero = !en.isIntersecting;
    top.classList.toggle("solid", pastHero);
    if (!pastHero) setSlide(cur); else clearTimeout(timer);
  }, { rootMargin: "-56px 0px 0px 0px", threshold: 0 }).observe(hero);

  /* ---------- archive ---------- */
  let area = "art", view = "grid";
  function renderFilters() {
    const n = k => k === "all" ? works.length : works.filter(w => w.area === k).length;
    $("#filters").innerHTML = ["all", "art", "design"].map(k =>
      `<button type="button" data-area="${k}" aria-pressed="${k === area}">${esc(t(k))} <span class="n">${n(k)}</span></button>`).join("");
    document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
  }
  function renderSheet() {
    const sheet = $("#sheet");
    const list = works.filter(w => area === "all" || w.area === area);
    if (view === "list") {
      sheet.innerHTML = `<ol class="list">${list.map(w =>
        `<li><button type="button" data-open="${w.id}"><span class="y">${esc(w.year)}</span><span>${esc(L(w.title))}</span><span class="p">${esc(place(w))}</span></button></li>`).join("")}</ol>`;
      return;
    }
    list.sort((a, b) => (!!cover(b)) - (!!cover(a)));
    const W = sheet.clientWidth, gap = W < 560 ? 8 : 12;
    const target = W < 560 ? 130 : W < 1000 ? 210 : 300;
    const items = list.map(w => { const im = cover(w); return { w, im, r: im ? Math.min(2.2, Math.max(0.55, im.w / im.h)) : 1.4 }; });
    const rows = []; let row = [], sum = 0;
    for (const it of items) {
      row.push(it); sum += it.r;
      if (sum * target + gap * (row.length - 1) >= W) { rows.push({ row, h: (W - gap * (row.length - 1)) / sum }); row = []; sum = 0; }
    }
    if (row.length) rows.push({ row, h: target });
    sheet.style.columnGap = gap + "px";
    sheet.innerHTML = rows.map(({ row, h }) => row.map(({ w, im, r }) =>
      `<button type="button" class="tile${im ? "" : " blank"}" data-open="${w.id}" style="width:${Math.floor(r * h)}px">
        <span class="frame" style="height:${Math.round(h)}px">${im ? `<img src="${esc(h > 260 ? im.src : im.thumb)}" alt="" loading="lazy" decoding="async">` : esc(t("noImage"))}</span>
        <span class="cap"><span class="y">${esc(w.y0)}</span><span>${esc(L(w.title))}</span></span>
      </button>`).join("")).join("");
  }
  $("#filters").addEventListener("click", e => { const b = e.target.closest("[data-area]"); if (b) { area = b.dataset.area; renderFilters(); renderSheet(); } });
  document.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => { view = b.dataset.view; renderFilters(); renderSheet(); }));

  /* ---------- bookshelf: all shelves at once ---------- */
  function renderShelves() {
    $("#shelves").innerHTML = ["authored", "collaborative", "layout_design"].map(k => {
      const books = A.works.filter(w => w.book && w.book.category === k).sort((a, b) => a.book.order - b.book.order);
      if (!books.length) return "";
      return `<div class="shelfrow"><h3>${esc(t("shelves")[k])}<span class="n">${books.length}</span></h3><div class="books">${books.map(w => {
        const c = w.book.cover;
        return `<button type="button" class="book" data-open="${w.id}">${c ? `<img src="${esc(c.thumb)}" alt="" loading="lazy" width="${c.w}" height="${c.h}">` : ""}<span>${esc(L(w.title))}</span></button>`;
      }).join("")}</div></div>`;
    }).join("");
  }

  /* ---------- chronological index ---------- */
  const Y0 = 2013, Y1 = Math.max(2027, ...A.projects.map(p => (p.end || p.start) + 1));
  const NY = Y1 - Y0 + 1;
  const xp = y => ((y - Y0) / NY * 100);
  const shown = { art: true, design: true, projects: true };
  let selected = null, lastPointer = "mouse";

  function lanes(items) {
    const lines = [];
    return items.sort((a, b) => a.y0 - b.y0 || a.y1 - b.y1).map(it => {
      let k = lines.findIndex(end => end < it.y0);
      if (k < 0) { k = lines.length; lines.push(0); }
      lines[k] = it.y1;
      return { ...it, line: k };
    }).concat([]).map((it, _, all) => ({ ...it, depth: Math.max(1, ...all.map(a => a.line + 1)) }));
  }
  function markHTML(it, cls) {
    const left = xp(it.y0), width = (it.y1 - it.y0 + 1) / NY * 100;
    return `<button type="button" class="mark ${cls}" data-mark="${esc(it.key)}" style="left:calc(${left}% + 2px);width:calc(${width}% - 4px);top:${10 + it.line * 14}px" aria-label="${esc(it.label)}"></button>`;
  }
  function laneHTML(label, items, cls) {
    const placed = lanes(items);
    const depth = placed.length ? placed[0].depth : 1;
    const grid = Array.from({ length: NY + 1 }, (_, i) => `<i style="left:${i / NY * 100}%"></i>`).join("");
    return `<div class="lane"><div class="lbl">${esc(label)}</div><div class="marks" style="height:${12 + depth * 14}px"><div class="grid-lines">${grid}</div>${placed.map(it => markHTML(it, cls)).join("")}</div></div>`;
  }
  function renderChrono() {
    const TR = t("tracks");
    $("#tracks").innerHTML = ["art", "design", "projects"].map(k =>
      `<button type="button" data-track="${k}" aria-pressed="${shown[k]}">${esc(TR[k][0])}</button>`).join("");
    const years = Array.from({ length: NY }, (_, i) => Y0 + i);
    let html = `<div class="axis"><div></div><div class="years">${years.map((y, i) =>
      `<span class="${i % 2 ? "odd" : ""}" style="left:${xp(y)}%">${i === 0 || y % 100 === 0 ? y : "’" + String(y).slice(2)}</span>`).join("")}</div></div>`;
    const workItem = w => ({ key: w.id, label: `${w.year}, ${L(w.title)}`, y0: w.y0, y1: Math.max(w.y0, w.y1) });
    if (shown.art) {
      html += `<div class="trackhead"><b>${esc(TR.art[0])}</b><span>${esc(TR.art[1])}</span></div>`;
      html += A.rows.art.map(r => {
        const items = works.filter(w => w.area === "art" && w.row === r.key).map(workItem);
        return items.length ? laneHTML(L(r), items, "art") : "";
      }).join("");
    }
    if (shown.design) {
      html += `<div class="trackhead"><b>${esc(TR.design[0])}</b><span>${esc(TR.design[1])}</span></div>`;
      html += A.rows.design.map(r => {
        const items = works.filter(w => w.area === "design" && w.row === r.key).map(workItem);
        return items.length ? laneHTML(L(r), items, "design") : "";
      }).join("");
    }
    if (shown.projects && A.projects.length) {
      html += `<div class="trackhead"><b>${esc(TR.projects[0])}</b><span>${esc(TR.projects[1])}</span></div>`;
      html += A.projects.map(p => laneHTML(p.title,
        [{ key: "p:" + p.id, label: p.title, y0: p.start, y1: p.end || Y1 - 1 }], "project")).join("");
    }
    $("#chart").innerHTML = html;
    peek(selected);
  }
  function peek(key) {
    selected = key;
    document.querySelectorAll(".mark").forEach(m => m.classList.toggle("is-on", m.dataset.mark === key));
    $("#chart").classList.toggle("dim", !!key);
    const el = $("#peek");
    if (!key) { el.innerHTML = `<p class="hint">${esc(t("peekHint"))}</p>`; return; }
    if (key.startsWith("p:")) {
      const p = A.projects.find(x => "p:" + x.id === key);
      el.innerHTML = `<p class="s">${esc(t("status")[p.status] || p.status)}, ${esc(t("since"))} ${p.start}</p><p class="t">${esc(p.title)}</p><p class="s">${esc(L(p.subtitle))}</p>`;
      return;
    }
    const w = byId[key], im = cover(w);
    el.innerHTML = `${im ? `<img src="${esc(im.thumb)}" alt="">` : ""}<p class="s">${esc(w.year)}</p><p class="t">${esc(L(w.title))}</p>${place(w) ? `<p class="s">${esc(place(w))}</p>` : ""}<button type="button" class="go" data-open="${w.id}">${esc(t("open"))}</button>`;
  }
  $("#tracks").addEventListener("click", e => {
    const b = e.target.closest("[data-track]"); if (!b) return;
    shown[b.dataset.track] = !shown[b.dataset.track];
    if (!Object.values(shown).some(Boolean)) shown[b.dataset.track] = true;
    renderChrono();
  });
  const chart = $("#chart");
  let preSelected = false;
  chart.addEventListener("pointerdown", e => {
    lastPointer = e.pointerType;
    const m = e.target.closest(".mark");
    preSelected = !!m && selected === m.dataset.mark;   // read before focus moves the selection
  });
  chart.addEventListener("pointerover", e => { const m = e.target.closest(".mark"); if (m && e.pointerType === "mouse") peek(m.dataset.mark); });
  chart.addEventListener("focusin", e => { const m = e.target.closest(".mark"); if (m) peek(m.dataset.mark); });
  chart.addEventListener("click", e => {
    const m = e.target.closest(".mark"); if (!m) return;
    const key = m.dataset.mark;
    if (key.startsWith("p:")) { peek(key); return; }
    if ((lastPointer !== "mouse" || matchMedia("(hover: none)").matches) && !preSelected) { peek(key); return; }   // first tap shows, second opens
    go("#work=" + key);
  });

  /* ---------- viewer ---------- */
  const viewer = $("#viewer"), vs = $("#vStrip");
  let current = null, lastFocus = null;

  function stripUI() {
    const figs = [...vs.querySelectorAll("figure")];
    $("#vUi").hidden = figs.length < 2;
    if (figs.length < 2) return;
    const sw = vs.scrollWidth, cw = vs.clientWidth;
    $("#vBar").style.width = Math.max(4, cw / sw * 100) + "%";
    $("#vBar").style.left = (vs.scrollLeft / sw * 100) + "%";
    let k = figs.findIndex(f => f.offsetLeft - vs.offsetLeft + f.offsetWidth / 2 > vs.scrollLeft);
    if (vs.scrollLeft + cw >= sw - 4) k = figs.length - 1;
    $("#vCount").textContent = `${Math.max(1, k + 1)} / ${figs.length}`;
  }
  function stripStep(dir) {
    const figs = [...vs.querySelectorAll("figure")];
    const base = vs.offsetLeft;
    const target = dir > 0
      ? figs.find(f => f.offsetLeft - base > vs.scrollLeft + 8)
      : figs.slice().reverse().find(f => f.offsetLeft - base < vs.scrollLeft - 8);
    if (target) vs.scrollTo({ left: target.offsetLeft - base - parseFloat(getComputedStyle(vs).paddingLeft) + 0, behavior: reduced ? "auto" : "smooth" });
  }
  vs.addEventListener("scroll", () => requestAnimationFrame(stripUI), { passive: true });
  $("#vLeft").addEventListener("click", () => stripStep(-1));
  $("#vRight").addEventListener("click", () => stripStep(1));

  function strip(figs) {
    vs.innerHTML = figs.length ? figs.join("") : `<div class="none">${esc(t("noImage"))}</div>`;
    vs.scrollLeft = 0;
    requestAnimationFrame(stripUI);
    vs.querySelectorAll("img").forEach(im => im.addEventListener("load", stripUI, { once: true }));
  }
  function openViewer() {
    if (viewer.hidden) lastFocus = document.activeElement;
    viewer.hidden = false;
    document.body.classList.add("locked");
    clearTimeout(timer);
    $("#vScroll").scrollTop = 0;
    $("#vClose").focus({ preventScroll: true });
  }
  function showWork(id) {
    const w = byId[id]; if (!w) return;
    current = { type: "work", id };
    strip(w.images.map((m, i) => `<figure><img src="${esc(m.src)}" alt="${esc(L(w.title))}, ${i + 1}" width="${m.w}" height="${m.h}"${i > 1 ? ' loading="lazy"' : ""}></figure>`));
    $("#vTitle").textContent = L(w.title);
    $("#vSub").textContent = [w.year, place(w)].filter(Boolean).join(", ");
    const text = L(w.long) || L(w.desc);
    const pdf = w.pdfs.map(p => `<a href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.lang === "ja" ? t("readJa") : t("read"))}</a>`).join("　");
    const s = seriesOf(id);
    $("#vBody").innerHTML = text.split(/\n+/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join("")
      + (pdf ? `<p class="pdf">${pdf}</p>` : "")
      + (s && s.children.length > 1 ? `<p class="lnk">${esc(t("series"))}: <button type="button" data-series="${s.id}">${esc(L(s.title))}</button></p>` : "");
    const F = t("facts");
    $("#vFacts").innerHTML = [["venue", w.venue], ["medium", w.medium.join(", ")], ["role", w.role], ["collaborators", w.collaborators],
      ["funding", w.funding], ["award", w.award], ["credit", w.credit], ["photo", w.photoCredit]]
      .filter(f => f[1]).map(([k, v]) => `<div><dt>${esc(F[k])}</dt><dd>${esc(v)}</dd></div>`).join("");
    const i = works.findIndex(x => x.id === id);
    const prev = works[(i - 1 + works.length) % works.length], next = works[(i + 1) % works.length];
    $("#vPrev").innerHTML = `<small>${esc(t("prev"))}</small>${esc(L(prev.title))}`; $("#vPrev").dataset.go = prev.id; $("#vPrev").hidden = false;
    $("#vNext").innerHTML = `<small>${esc(t("next"))}</small>${esc(L(next.title))}`; $("#vNext").dataset.go = next.id; $("#vNext").hidden = false;
    openViewer();
  }
  function showSeries(sid) {
    const s = A.series.find(x => x.id === sid); if (!s) return;
    current = { type: "series", id: sid };
    const kids = s.children.map(id => byId[id]).filter(Boolean);
    strip(kids.map(w => { const im = cover(w); return im ? `<figure><button type="button" data-open="${w.id}"><img src="${esc(im.src)}" alt="${esc(L(w.title))}" width="${im.w}" height="${im.h}"></button><figcaption>${esc(w.y0)}　${esc(L(w.title))}</figcaption></figure>` : ""; }).filter(Boolean));
    $("#vTitle").textContent = L(s.title);
    $("#vSub").textContent = t("series") + (kids.length ? ", " + Math.min(...kids.map(k => k.y0)) + "–" + Math.max(...kids.map(k => k.y1)) : "");
    $("#vBody").innerHTML = kids.map(w => `<p class="lnk"><button type="button" data-open="${w.id}">${esc(L(w.title))}</button> <span style="color:var(--quiet)">${esc(w.year)}</span></p>`).join("");
    $("#vFacts").innerHTML = "";
    $("#vPrev").hidden = $("#vNext").hidden = true;
    openViewer();
  }
  function go(hash) { if (location.hash !== hash) history.pushState(null, "", hash); route(); }
  function closeViewer(fromHistory) {
    if (viewer.hidden) return;
    viewer.hidden = true; current = null;
    document.body.classList.remove("locked");
    if (!fromHistory) history.pushState(null, "", location.pathname + location.search);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    if (!pastHero) schedule();
  }
  function route() {
    const m = location.hash.match(/^#(work|series)=([\w-]+)/);
    if (!m) return closeViewer(true);
    m[1] === "work" ? showWork(m[2]) : showSeries(m[2]);
  }
  document.addEventListener("click", e => {
    const o = e.target.closest("[data-open]");
    if (o && !o.classList.contains("mark")) { e.preventDefault(); go("#work=" + o.dataset.open); return; }
    const s = e.target.closest("[data-series]"); if (s) go("#series=" + s.dataset.series);
  });
  $("#vClose").addEventListener("click", () => closeViewer());
  $("#vPrev").addEventListener("click", e => go("#work=" + e.currentTarget.dataset.go));
  $("#vNext").addEventListener("click", e => go("#work=" + e.currentTarget.dataset.go));
  window.addEventListener("popstate", () => route());
  document.addEventListener("keydown", e => {
    if (viewer.hidden) {
      if (!pastHero && (e.key === "ArrowRight" || e.key === "ArrowLeft") && !e.target.closest("input, textarea")) setSlide(cur + (e.key === "ArrowRight" ? 1 : -1));
      return;
    }
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); stripStep(e.key === "ArrowRight" ? 1 : -1); }
    if (e.key === "Tab") {
      const f = [...viewer.querySelectorAll("button, a[href], [tabindex='0']")].filter(x => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- language, resize, start ---------- */
  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dataset.lang = lang;
    document.querySelectorAll("[data-t]").forEach(el => { const v = T[lang][el.dataset.t]; if (typeof v === "string") el.textContent = v; });
    document.querySelectorAll("[data-set-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.setLang === lang)));
    renderFilters(); renderSheet(); renderShelves(); renderChrono();
    setSlide(cur);
    if (current) current.type === "work" ? showWork(current.id) : showSeries(current.id);
  }
  document.querySelectorAll("[data-set-lang]").forEach(b => b.addEventListener("click", () => {
    lang = b.dataset.setLang; try { localStorage.setItem("ns-lang", lang); } catch (e) {} applyLang();
  }));
  const setHdr = () => document.documentElement.style.setProperty("--hdr", top.offsetHeight + "px");
  let rz, lastW = 0;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { setHdr(); const w = $("#sheet").clientWidth; if (w !== lastW) { lastW = w; renderSheet(); } stripUI(); }, 150); });

  buildHero();
  applyLang();
  setHdr();
  lastW = $("#sheet").clientWidth;
  route();
})();
