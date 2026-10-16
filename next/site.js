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
      contact: "Contact", close: "Close", all: "All", art: "Artistic practice", design: "Design", infoBtn: "Info", top: "Back to top", allMedia: "All media",
      series: "Series", prev: "Previous", next: "Next", noImage: "No image", read: "Publication (PDF)", readJa: "Japanese edition (PDF)",
      "all.images": "All images", "about.work": "About this work", "read.book": "Read the book", cover: "Cover",
      "book.open": "Click the cover to open the book", "book.nopages": "Only the cover is in the archive so far",
      open: "Open work", peekHint: "Point at a line to see the work. Lines run from the first to the last year of each project.",
      tracks: { art: ["Artistic practice", "Natsumi Sugiyama"], design: ["Design", "natyama"], projects: ["Studio projects", "studio natyama"] },
      status: { planned: "Planned", ongoing: "Ongoing", done: "Completed" }, since: "since",
      shelves: { authored: "Project documentation", collaborative: "Collaborative", layout_design: "Layout design" },
      facts: { venue: "Venue", medium: "Medium", role: "Role", collaborators: "With", funding: "Support", award: "Award", credit: "Credits", photo: "Photos", series: "Series" },
    },
    ja: {
      "nav.index": "インデックス",
      info: "このサイトには、展示やリサーチ、デザインプロジェクトの一部を収録しています。東京で環境デザイン、ドイツで現代美術に関する研究制作を経て、現在はUIや情報編集を軸に活動しています。",
      contact: "お問い合わせ", close: "閉じる", all: "すべて", art: "作家活動", design: "デザイン", infoBtn: "情報", top: "トップへ戻る", allMedia: "すべてのメディア",
      series: "シリーズ", prev: "前へ", next: "次へ", noImage: "画像なし", read: "出版物（PDF）", readJa: "日本語版（PDF）",
      "all.images": "すべての画像", "about.work": "作品について", "read.book": "本を開く", cover: "表紙",
      "book.open": "表紙をクリックすると本が開きます", "book.nopages": "アーカイブにはまだ表紙のみです",
      open: "作品を見る", peekHint: "線に触れると作品が表示されます。線の長さは各プロジェクトの期間です。",
      tracks: { art: ["作家活動", "Natsumi Sugiyama"], design: ["デザイン", "natyama"], projects: ["スタジオのプロジェクト", "studio natyama"] },
      status: { planned: "準備中", ongoing: "進行中", done: "完了" }, since: "",
      shelves: { authored: "プロジェクト記録", collaborative: "共同制作", layout_design: "レイアウトデザイン" },
      facts: { venue: "会場", medium: "メディウム", role: "役割", collaborators: "協働", funding: "助成", award: "受賞", credit: "クレジット", photo: "撮影", series: "シリーズ" },
    },
  };
  // texts.csv overrides the built-in wording
  Object.entries(A.texts || {}).forEach(([key, v]) => {
    ["en", "ja"].forEach(l => {
      if (!v[l] && l === "ja") return;
      const parts = key.split("."); let o = T[l];
      const nested = parts.length > 1 && typeof T.en[parts[0]] === "object" && !(key in T.en);
      if (nested) {
        for (let k = 0; k < parts.length - 1; k++) o = o[parts[k]] = o[parts[k]] || {};
        o[parts[parts.length - 1]] = v[l];
      } else T[l][key] = v[l];
    });
  });
  let lang = "en";
  try { lang = localStorage.getItem("ns-lang") === "ja" ? "ja" : "en"; } catch (e) {}
  const t = k => T[lang][k];
  const L = o => (o && (o[lang] || o.en)) || "";

  const works = A.works.slice().sort((a, b) => b.y0 - a.y0 || a.id.localeCompare(b.id));
  const byId = Object.fromEntries(works.map(w => [w.id, w]));
  // A place is shown only where it belongs to the work: an installation view, or research tied to a region.
  const PLACE_MEDIA = /installation|exhibition|field research|field observation|fieldwork|interview|participant observation|site/i;
  const place = w => (w.area === "art" && w.city && PLACE_MEDIA.test(w.medium.join(" "))) ? w.city : "";
  const mediumLabel = m => m.charAt(0).toLowerCase() + m.slice(1);
  const cover = w => w.images[0] || (w.book && w.book.cover) || null;
  const seriesOf = id => A.series.find(s => s.children.includes(id));

  /* ---------- opening slideshow ---------- */
  const top = $("#top"), hero = $("#hero"), foot = $("#heroFoot");
  const slides = A.hero.filter(h => byId[h.id]);
  const DUR = 5500;
  let cur = 0, timer = null, paused = false, pastHero = false;

  function buildHero() {
    $("#heroSlides").innerHTML = slides.map((s, i) =>
      `<img src="${esc(s.src)}" alt="" ${i ? 'loading="eager" decoding="async"' : 'fetchpriority="high"'} class="${i === 0 ? "is-on" : ""}${s.fit === "contain" ? " contain" : ""}">`).join("");
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
    const ser = s.link && A.series.find(x => x.id === s.link);
    hero.style.backgroundColor = s.fit === "contain" ? s.bg : "";
    if (ser) {
      const kids = ser.children.map(c => byId[c]).filter(Boolean);
      const yrs = kids.length ? Math.min(...kids.map(k => k.y0)) + "–" + Math.max(...kids.map(k => k.y1)) : "";
      $("#heroCap").innerHTML = `<span class="y">${esc(t("series"))}, ${esc(yrs)}</span><span class="t">${esc(L(ser.title))}</span>`;
      delete $("#heroCap").dataset.open; $("#heroCap").dataset.series = ser.id;
    } else {
      $("#heroCap").innerHTML = `<span class="y">${esc(w.year)}${place(w) ? ", " + esc(place(w)) : ""}</span><span class="t">${esc(L(w.title))}</span>`;
      delete $("#heroCap").dataset.series; $("#heroCap").dataset.open = w.id;
    }
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
  $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
  new IntersectionObserver(([en]) => {
    pastHero = !en.isIntersecting;
    $("#toTop").hidden = !pastHero;
    top.classList.toggle("solid", pastHero);
    if (!pastHero) setSlide(cur); else clearTimeout(timer);
  }, { rootMargin: "-56px 0px 0px 0px", threshold: 0 }).observe(hero);

  /* ---------- archive ---------- */
  let area = "art", view = "grid";
  let medium = null;
  // Design work is grouped into a few broad kinds; artistic work keeps its own media words.
  const kinds = w => {
    if (w.area === "art") return w.medium.map(mediumLabel);
    const m = w.medium.map(x => x.toLowerCase()), has = re => m.some(x => re.test(x)), out = [];
    if (has(/^(mobile app|website design|website|ui design)$/)) out.push("apps");
    if (has(/book|booklet|zine|publication|editorial design|layout/)) out.push("books");
    if (has(/logo|graphic|infographic/)) out.push("graphics");
    if (has(/content|workshop|coaching|visual|video/) || !out.length) out.push("content");
    return out.map(k => t("kind." + k));
  };
  const venueOf = w => w.venueShort || "";
  function renderFilters() {
    const n = k => k === "all" ? works.length : works.filter(w => w.area === k).length;
    $("#filters").innerHTML = ["all", "art", "design"].map(k =>
      `<button type="button" data-area="${k}" aria-pressed="${k === area}">${esc(t(k))} <span class="n">${n(k)}</span></button>`).join("");
    document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
    const pool = works.filter(w => area === "all" || w.area === area), counts = {}, side = {};
    pool.forEach(w => kinds(w).forEach(k => { counts[k] = (counts[k] || 0) + 1; side[k] = w.area; }));
    const keys = Object.keys(counts).sort((a, b) => (side[a] === side[b] ? 0 : side[a] === "art" ? -1 : 1) || counts[b] - counts[a] || a.localeCompare(b));
    if (medium && !counts[medium]) medium = null;
    $("#media").innerHTML = `<button type="button" data-medium="" aria-pressed="${!medium}">${esc(t("allMedia"))}</button>`
      + keys.map(k => `<button type="button" data-medium="${esc(k)}" aria-pressed="${medium === k}">${esc(k)} <span class="n">${counts[k]}</span></button>`).join("");
  }
  function renderSheet() {
    const sheet = $("#sheet");
    const list = works.filter(w => (area === "all" || w.area === area) && (!medium || kinds(w).includes(medium)));
    if (view === "list") {
      sheet.innerHTML = `<ol class="list">${list.map(w =>
        `<li><button type="button" data-open="${w.id}"><span class="t">${esc(L(w.title))}</span><span class="m">${esc(kinds(w).join(", "))}</span><span class="y">${esc(w.year)}</span></button></li>`).join("")}</ol>`;
      return;
    }
    list.sort((a, b) => (!!cover(b)) - (!!cover(a)));
    sheet.innerHTML = justified(list, sheet.clientWidth);
  }
  function justified(list, W) {
    const gap = W < 560 ? 8 : 12;
    const target = W < 560 ? 130 : W < 1000 ? 210 : 300;
    const items = list.map(w => { const im = cover(w); return { w, im, r: im ? Math.min(2.2, Math.max(0.55, im.w / im.h)) : 1.4 }; });
    const rows = []; let row = [], sum = 0;
    for (const it of items) {
      row.push(it); sum += it.r;
      if (sum * target + gap * (row.length - 1) >= W) { rows.push({ row, h: (W - gap * (row.length - 1)) / sum }); row = []; sum = 0; }
    }
    if (row.length) rows.push({ row, h: target });
    return rows.map(({ row, h }) => row.map(({ w, im, r }) =>
      `<button type="button" class="tile${im ? "" : " blank"}" data-open="${w.id}" style="width:${Math.floor(r * h)}px">
        <span class="frame" style="height:${Math.round(h)}px">${im ? `<img src="${esc(h > 260 ? im.src : im.thumb)}" alt="" loading="lazy" decoding="async">` : esc(t("noImage"))}</span>
        <span class="cap"><span class="y">${esc(w.y0)}</span><span>${esc(L(w.title))}</span></span>
        <span class="med">${esc([w.area === "art" ? venueOf(w) : "", kinds(w).slice(0, 3).join(" · ")].filter(Boolean).join(" — "))}</span>
      </button>`).join("")).join("");
  }
  $("#filters").addEventListener("click", e => { const b = e.target.closest("[data-area]"); if (b) { area = b.dataset.area; renderFilters(); renderSheet(); } });
  $("#media").addEventListener("click", e => { const b = e.target.closest("[data-medium]"); if (b) { medium = b.dataset.medium || null; renderFilters(); renderSheet(); } });
  document.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => { view = b.dataset.view; renderFilters(); renderSheet(); }));

  /* ---------- bookshelf: all shelves at once ---------- */
  function renderShelves() {
    $("#shelves").innerHTML = ["authored", "collaborative", "layout_design"].map(k => {
      const books = A.works.filter(w => w.book && w.book.category === k).sort((a, b) => a.book.order - b.book.order);
      if (!books.length) return "";
      return `<div class="shelfrow"><h3>${esc(t("shelves")[k])}<span class="n">${books.length}</span></h3><div class="books">${books.map(w => {
        const c = w.book.cover;
        return `<button type="button" class="book" data-book="${w.id}">${c ? `<img src="${esc(c.thumb)}" alt="" loading="lazy" width="${c.w}" height="${c.h}">` : ""}<span>${esc(L(w.title))}</span></button>`;
      }).join("")}</div></div>`;
    }).join("");
  }

  /* ---------- chronological index ---------- */
  const Y0 = 2013, Y1 = Math.max(2027, ...A.projects.map(p => (p.end || p.start) + 1));
  const NY = Y1 - Y0 + 1;
  const xp = y => ((y - Y0) / NY * 100);
  const shown = { art: true, design: true, projects: true, floating: true };
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
    $("#tracks").innerHTML = ["art", "design", "projects", "floating"].filter(k => k !== "floating" || (A.floating || []).length).map(k =>
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
      html += `<div class="trackhead"><b>${esc(TR.projects[0])}</b><span>${esc(TR.projects[1])}</span><span class="soon">${esc(t("status.planned"))}</span></div>`;
    }
    if (shown.floating && (A.floating || []).length) {
      html += `<div class="trackhead"><b>${esc(TR.floating[0])}</b><span>${esc(TR.floating[1])}</span></div>`;
      // a stable pseudo-random scatter, so the dots keep their places between renders
      let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
      const dots = A.floating.map((f, i) => {
        const x = f.y0 ? xp(f.y0 + (Math.max(f.y0, f.y1 || f.y0) - f.y0 + 1) / 2) : 4 + rnd() * 92;
        const y = 14 + rnd() * 56, d = (rnd() * 6).toFixed(2), dur = (5 + rnd() * 4).toFixed(2);
        return `<button type="button" class="float${f.label ? " named" : ""}" data-mark="f:${i}" style="left:calc(${x}% - 4px);top:${y}px;animation-delay:-${d}s;animation-duration:${dur}s" aria-label="${esc(f.label ? L(f.label) : t("float." + f.kind))}"></button>`;
      }).join("");
      const grid = Array.from({ length: NY + 1 }, (_, i) => `<i style="left:${i / NY * 100}%"></i>`).join("");
      html += `<div class="lane floating"><div class="lbl"></div><div class="marks" style="height:84px"><div class="grid-lines">${grid}</div>${dots}</div></div>`;
    }
    $("#chart").innerHTML = html;
    peek(selected);
  }
  function peek(key) {
    selected = key;
    document.querySelectorAll(".mark, .float").forEach(m => m.classList.toggle("is-on", m.dataset.mark === key));
    $("#chart").classList.toggle("dim", !!key);
    const el = $("#peek");
    if (!key) { el.innerHTML = `<p class="hint">${esc(t("peekHint"))}</p>`; return; }
    if (key.startsWith("f:")) {
      const f = A.floating[+key.slice(2)];
      const yrs = f.y0 ? (f.y1 && f.y1 !== f.y0 ? `${f.y0}–${f.y1}` : `${f.y0}`) : "";
      el.innerHTML = `${yrs ? `<p class="s">${esc(yrs)}</p>` : ""}<p class="t">${esc(f.label ? L(f.label) : t("float." + f.kind))}</p>${f.label ? `<p class="s">${esc(t("float." + f.kind))}</p>` : ""}`;
      return;
    }
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
    const m = e.target.closest(".mark, .float");
    preSelected = !!m && selected === m.dataset.mark;   // read before focus moves the selection
  });
  chart.addEventListener("pointerover", e => { const m = e.target.closest(".mark, .float"); if (m && e.pointerType === "mouse") peek(m.dataset.mark); });
  chart.addEventListener("focusin", e => { const m = e.target.closest(".mark, .float"); if (m) peek(m.dataset.mark); });
  chart.addEventListener("click", e => {
    const m = e.target.closest(".mark, .float"); if (!m) return;
    const key = m.dataset.mark;
    if (key.startsWith("p:") || key.startsWith("f:")) { peek(key); return; }
    if ((lastPointer !== "mouse" || matchMedia("(hover: none)").matches) && !preSelected) { peek(key); return; }   // first tap shows, second opens
    go("#work=" + key);
  });

  /* ---------- overlays: gallery (one image at a time) and book reader ---------- */
  const gallery = $("#gallery"), reader = $("#reader");
  let current = null, lastFocus = null;
  const isOpen = () => !gallery.hidden || !reader.hidden;

  function paint(el, bg, lum) {
    el.style.setProperty("--s-bg", bg || "#FFFFFF");
    el.classList.toggle("dark", (lum ?? 1) < 0.5);
  }
  function toTop() {
    closeOverlay();
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }
  function showOverlay(el) {
    if (!isOpen()) lastFocus = document.activeElement;
    gallery.hidden = el !== gallery; reader.hidden = el !== reader;
    document.body.classList.add("locked");
    clearTimeout(timer);
  }
  function closeOverlay(fromHistory) {
    if (!isOpen()) return;
    gallery.hidden = reader.hidden = true; current = null;
    document.body.classList.remove("locked");
    if (!fromHistory) history.pushState(null, "", location.pathname + location.search);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    if (!pastHero) schedule();
  }

  /* gallery */
  let G = { items: [], i: 0 };
  function galleryItems(kind, id) {
    if (kind === "series") {
      const s = A.series.find(x => x.id === id);
      return s.children.map(c => byId[c]).filter(w => w && cover(w)).map(w => ({ ...cover(w), label: `${w.y0}, ${L(w.title)}`, open: w.id }));
    }
    const w = byId[id];
    return w.images.map(m => ({ ...m }));
  }
  function loadNear() {
    [...$("#gFrame").children].forEach((im, k) => {
      if (Math.abs(k - G.i) <= 1 || (G.i === 0 && k === G.items.length - 1)) { if (!im.src) im.src = im.dataset.src; }
    });
  }
  function setImg(i) {
    if (!G.items.length) return;
    G.i = (i + G.items.length) % G.items.length;
    [...$("#gFrame").children].forEach((im, k) => im.classList.toggle("is-on", k === G.i));
    loadNear();
    const n = G.items.length, it = G.items[G.i];
    $("#gCount").textContent = `${G.i + 1} / ${n}`;
    paint(gallery, it.bg, it.lum);
    if (it.open) { $("#gYear").textContent = it.label; }
    const c = it.cap || {}, words = [c[lang] || c.en, c.credit].filter(Boolean);
    $("#gNote").textContent = words.join(" — ");
    $("#gNote").hidden = !words.length;
    document.querySelectorAll("#gGrid button").forEach((b, k) => b.setAttribute("aria-current", String(k === G.i)));
    const single = n < 2;
    ["#gPrevImg", "#gNextImg"].forEach(s => $(s).hidden = single);
    $("#gSteps").hidden = single; $("#gGridBtn").hidden = single;
  }
  function toggleInfo(on) {
    const open = on ?? $("#gInfo").hidden;
    $("#gInfo").hidden = !open;
    $("#gInfoBtn").setAttribute("aria-pressed", String(open));
  }
  function toggleGrid(on) {
    const open = on ?? $("#gGrid").hidden;
    $("#gGrid").hidden = !open; $("#gGridBtn").setAttribute("aria-pressed", String(open));
  }
  function fillInfo(kind, id) {
    const F = t("facts");
    if (kind === "series") {
      const s = A.series.find(x => x.id === id), kids = s.children.map(c => byId[c]).filter(Boolean);
      $("#iTitle").textContent = L(s.title);
      $("#iSub").textContent = t("series");
      $("#iBody").innerHTML = kids.map(w => `<p class="lnk"><button type="button" data-open="${w.id}">${esc(L(w.title))}</button> <span style="color:var(--quiet)">${esc(w.year)}</span></p>`).join("");
      $("#iFacts").innerHTML = ""; $("#iTags").innerHTML = ""; $("#iPrev").hidden = $("#iNext").hidden = true;
      return;
    }
    const w = byId[id], s = seriesOf(id);
    $("#iTitle").textContent = L(w.title);
    $("#iSub").textContent = [w.year, place(w)].filter(Boolean).join(", ");
    $("#iTags").innerHTML = kinds(w).map(k => `<li>${esc(k)}</li>`).join("");
    const text = L(w.long) || L(w.desc);
    const pdf = w.pdfs.map(p => `<a href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.lang === "ja" ? t("readJa") : t("read"))}</a>`).join("　");
    const book = w.book && w.book.pages && w.book.pages.length > 1 ? `<p class="lnk"><button type="button" data-book="${w.id}">${esc(t("read.book"))}</button></p>` : "";
    $("#iBody").innerHTML = text.split(/\n+/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join("")
      + book + (pdf ? `<p class="pdf">${pdf}</p>` : "")
      + (s && s.children.length > 1 ? `<p class="lnk">${esc(t("series"))}: <button type="button" data-series="${s.id}">${esc(L(s.title))}</button></p>` : "");
    $("#iFacts").innerHTML = [["venue", place(w) ? w.venue : ""], ["role", w.role], ["collaborators", w.collaborators],
      ["funding", w.funding], ["award", w.award], ["credit", w.credit], ["photo", w.photoCredit]]
      .filter(f => f[1]).map(([k, v]) => `<div><dt>${esc(F[k])}</dt><dd>${esc(v)}</dd></div>`).join("");
    const i = works.findIndex(x => x.id === id);
    const prev = works[(i - 1 + works.length) % works.length], next = works[(i + 1) % works.length];
    $("#iPrev").innerHTML = `<small>← ${esc(t("prev"))}</small><cite>${esc(L(prev.title))}</cite>`; $("#iPrev").dataset.go = prev.id; $("#iPrev").hidden = false;
    $("#iNext").innerHTML = `<small>${esc(t("next"))} →</small><cite>${esc(L(next.title))}</cite>`; $("#iNext").dataset.go = next.id; $("#iNext").hidden = false;
  }
  function showGallery(kind, id, keepIndex) {
    if (kind === "work" && !byId[id]) return;
    if (kind === "series" && !A.series.find(x => x.id === id)) return;
    const same = current && current.type === kind && current.id === id;
    current = { type: kind, id };
    G.items = galleryItems(kind, id);
    if (!same || !keepIndex) G.i = 0;
    const title = kind === "series" ? L(A.series.find(x => x.id === id).title) : L(byId[id].title);
    $("#gTitle").textContent = title;
    $("#gYear").textContent = kind === "series" ? t("series") : byId[id].year;
    $("#gFrame").innerHTML = G.items.length
      ? G.items.map((m, k) => `<img data-src="${esc(m.src)}" alt="${esc(title)}, ${k + 1}" decoding="async">`).join("")
      : `<p style="position:absolute;inset:0;display:grid;place-items:center;color:var(--quiet)">${esc(t("noImage"))}</p>`;
    $("#gGrid").innerHTML = G.items.map((m, k) => `<button type="button" data-img="${k}"><img src="${esc(m.thumb || m.src)}" alt="" loading="lazy"></button>`).join("");
    fillInfo(kind, id);
    if (!same) { toggleGrid(false); toggleInfo(false); }
    showOverlay(gallery);
    setImg(G.i);
    if (!same) $("#gClose").focus({ preventScroll: true });
  }
  $("#gPrevImg").addEventListener("click", () => setImg(G.i - 1));
  $("#gNextImg").addEventListener("click", () => setImg(G.i + 1));
  $("#gLeft").addEventListener("click", () => setImg(G.i - 1));
  $("#gRight").addEventListener("click", () => setImg(G.i + 1));
  $("#gHome").addEventListener("click", () => toTop());
  $("#gGrid").addEventListener("click", e => { const b = e.target.closest("[data-img]"); if (b) { setImg(+b.dataset.img); toggleGrid(false); } });
  $("#gInfoBtn").addEventListener("click", () => toggleInfo());
  $("#gGridBtn").addEventListener("click", () => toggleGrid());
  $("#gClose").addEventListener("click", () => closeOverlay());
  $("#iPrev").addEventListener("click", e => go("#work=" + e.currentTarget.dataset.go));
  $("#iNext").addEventListener("click", e => go("#work=" + e.currentTarget.dataset.go));
  swipe($("#gStage"), d => setImg(G.i + d));

  function swipe(el, fn) {
    let x0 = null, y0 = null;
    el.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener("touchend", e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) fn(dx < 0 ? 1 : -1);
    });
  }

  /* book reader */
  const R = { id: null, pages: [], views: [], v: 0, two: true, busy: false, aspect: 0.7 };
  function bookPages(w) {
    const b = w.book, out = [];
    if (b.cover) out.push({ src: b.cover.src, cover: true });
    for (const p of b.pages || []) {
      if (b.cover && p.src === b.cover.src) continue;
      if (p.spread && R.two) { out.push({ src: p.src, half: "left" }, { src: p.src, half: "right" }); }
      else out.push({ src: p.src });
    }
    return out;
  }
  function pageAspect(w) {
    const p = (w.book.pages || []).find(x => !x.cover && x.src !== (w.book.cover || {}).src) || w.book.cover;
    if (!p) return 0.72;
    const a = p.spread && R.two ? (p.w / 2) / p.h : p.w / p.h;
    return Math.min(1.4, Math.max(0.55, a));
  }
  function pageHTML(p) {
    if (!p) return "";
    if (p.half) return `<div class="half" style="background-image:url('${esc(p.src)}');background-position:${p.half} center"></div>`;
    return `<img src="${esc(p.src)}" alt="" decoding="async">`;
  }
  function buildViews() {
    const P = R.pages; R.views = [];
    if (R.two) {
      R.views.push([null, P[0] || null]);
      for (let k = 1; k < P.length; k += 2) R.views.push([P[k] || null, P[k + 1] || null]);
    } else P.forEach(p => R.views.push([p]));
  }
  function sizeBook() {
    const st = $("#rStage"), W = st.clientWidth - 2 * Math.max(16, st.clientWidth * 0.04), H = st.clientHeight - 24;
    let ph, pw;
    if (R.two) { ph = Math.min(H, W / (2 * R.aspect)); pw = ph * R.aspect; $("#rBook").style.width = 2 * pw + "px"; }
    else { ph = Math.min(H, W / R.aspect); pw = ph * R.aspect; $("#rBook").style.width = pw + "px"; }
    $("#rBook").style.height = ph + "px";
  }
  function bookShift(v) {
    if (!R.two) return "none";
    const [l, r] = R.views[v] || [];
    if (!l && r) return "translateX(-25%)";
    if (l && !r) return "translateX(25%)";
    return "none";
  }
  function drawView(v) {
    const book = $("#rBook"), view = R.views[v];
    book.classList.toggle("r-single", !R.two);
    if (R.two) {
      const [l, r] = view;
      book.innerHTML = `<div class="r-page left${l ? "" : " empty"}">${pageHTML(l)}</div>`
        + `<div class="r-page right${r ? "" : " empty"}${r && r.cover ? " cover" : ""}">${pageHTML(r)}</div>`;
    } else {
      const [p] = view;
      book.innerHTML = `<div class="r-page right${p && p.cover ? " cover" : ""}">${pageHTML(p)}</div>`;
    }
    book.insertAdjacentHTML("beforeend", `<button type="button" class="r-hit prev" aria-label="${esc(t("prev"))}"></button><button type="button" class="r-hit next" aria-label="${esc(t("next"))}"></button>`);
    book.style.transform = bookShift(v);
    readerUI();
    preload(v + 1); preload(v + 2);
  }
  function preload(v) { (R.views[v] || []).forEach(p => { if (p) { const im = new Image(); im.src = p.src; } }); }
  function readerUI() {
    const n = R.pages.length, v = R.v;
    let label;
    if (R.two) {
      if (v === 0) label = t("cover");
      else { const a = 2 * v, b = Math.min(n, 2 * v + 1); label = (a === b ? a : `${a}–${b}`) + ` / ${n}`; }
    } else label = v === 0 ? t("cover") : `${v + 1} / ${n}`;
    $("#rCount").textContent = label;
    $("#rLeft").disabled = v === 0; $("#rRight").disabled = v >= R.views.length - 1;
    $("#rHint").textContent = n < 2 ? t("book.nopages") : (v === 0 ? t("book.open") : "");
  }
  function turn(dir) {
    const to = R.v + dir;
    if (R.busy || to < 0 || to >= R.views.length) return;
    const book = $("#rBook");
    if (reduced) { R.v = to; drawView(to); return; }
    R.busy = true;
    const from = R.views[R.v], next = R.views[to];
    let leaf;
    if (R.two) {
      if (dir > 0) {
        book.querySelector(".r-page.right").innerHTML = pageHTML(next[1]);
        book.querySelector(".r-page.right").className = `r-page right${next[1] ? "" : " empty"}`;
        leaf = `<div class="r-leaf"><div class="face front">${pageHTML(from[1])}</div><div class="face back">${pageHTML(next[0])}</div></div>`;
      } else {
        book.querySelector(".r-page.left").innerHTML = pageHTML(next[0]);
        book.querySelector(".r-page.left").className = `r-page left${next[0] ? "" : " empty"}`;
        leaf = `<div class="r-leaf back-turn"><div class="face front">${pageHTML(from[0])}</div><div class="face back">${pageHTML(next[1])}</div></div>`;
      }
      book.insertAdjacentHTML("beforeend", leaf);
      const el = book.querySelector(".r-leaf");
      if (dir > 0 && from[1] && from[1].cover) el.querySelector(".front").classList.add("is-cover");
      if (dir < 0 && next[1] && next[1].cover) el.querySelector(".back").classList.add("is-cover");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transform = `rotateY(${dir > 0 ? -180 : 180}deg)`;
        book.style.transform = bookShift(to);
      }));
      el.addEventListener("transitionend", () => { R.v = to; R.busy = false; drawView(to); }, { once: true });
    } else {
      const page = book.querySelector(".r-page");
      if (dir > 0) {
        book.insertAdjacentHTML("afterbegin", `<div class="r-page right">${pageHTML(next[0])}</div>`);
        page.style.zIndex = 4;
        page.classList.add("r-leaf"); page.style.transformOrigin = "left center";
        requestAnimationFrame(() => requestAnimationFrame(() => { page.style.transform = "rotateY(-100deg)"; page.style.opacity = "0"; }));
        page.addEventListener("transitionend", () => { R.v = to; R.busy = false; drawView(to); }, { once: true });
      } else {
        book.insertAdjacentHTML("beforeend", `<div class="r-page right r-leaf" style="transform-origin:left center;transform:rotateY(-100deg);opacity:0;z-index:4">${pageHTML(next[0])}</div>`);
        const el = book.lastElementChild;
        requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transform = "rotateY(0deg)"; el.style.opacity = "1"; }));
        el.addEventListener("transitionend", () => { R.v = to; R.busy = false; drawView(to); }, { once: true });
      }
    }
    setTimeout(() => { if (R.busy) { R.v = to; R.busy = false; drawView(to); } }, 1200);
  }
  function showBook(id) {
    const w = byId[id]; if (!w || !w.book) return;
    current = { type: "book", id };
    R.two = innerWidth > 760;
    R.id = id; R.pages = bookPages(w); R.aspect = pageAspect(w);
    R.v = 0; R.busy = false;
    $("#rTitle").textContent = L(w.title);
    $("#rYear").textContent = w.year;
    const pdf = w.pdfs[0];
    $("#rPdf").hidden = !pdf; if (pdf) $("#rPdf").href = pdf.href;
    const c = w.book.cover || {};
    paint(reader, c.bg ? `color-mix(in srgb, ${c.bg} 70%, #e9e9e6)` : "#ECECEA", c.lum);
    showOverlay(reader);
    buildViews(); sizeBook(); drawView(0);
    $("#rClose").focus({ preventScroll: true });
  }
  $("#rBook").addEventListener("click", e => {
    if (e.target.closest(".r-hit.prev")) turn(-1);
    else if (e.target.closest(".r-hit.next")) turn(1);
  });
  $("#rLeft").addEventListener("click", () => turn(-1));
  $("#rRight").addEventListener("click", () => turn(1));
  $("#rClose").addEventListener("click", () => closeOverlay());
  $("#rWork").addEventListener("click", () => { go("#work=" + R.id); toggleInfo(true); });
  $("#rHome").addEventListener("click", () => toTop());
  swipe($("#rStage"), d => turn(d));

  /* routing */
  function go(hash) { if (location.hash !== hash) history.pushState(null, "", hash); route(); }
  function route() {
    const m = location.hash.match(/^#(work|series|book)=([\w-]+)/);
    if (!m) return closeOverlay(true);
    if (m[1] === "book") showBook(m[2]); else showGallery(m[1], m[2]);
  }
  document.addEventListener("click", e => {
    const o = e.target.closest("[data-open]");
    if (o && !o.classList.contains("mark")) { e.preventDefault(); go("#work=" + o.dataset.open); return; }
    const b = e.target.closest("[data-book]"); if (b) { e.preventDefault(); go("#book=" + b.dataset.book); return; }
    const s = e.target.closest("[data-series]"); if (s) go("#series=" + s.dataset.series);
  });
  window.addEventListener("popstate", () => route());
  document.addEventListener("keydown", e => {
    if (!isOpen()) {
      if (!pastHero && (e.key === "ArrowRight" || e.key === "ArrowLeft") && !e.target.closest("input, textarea")) setSlide(cur + (e.key === "ArrowRight" ? 1 : -1));
      return;
    }
    const inGallery = !gallery.hidden;
    if (e.key === "Escape") {
      if (inGallery && !$("#gGrid").hidden) return toggleGrid(false);
      if (inGallery && !$("#gInfo").hidden && innerWidth <= 760) return toggleInfo(false);
      return closeOverlay();
    }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault(); const d = e.key === "ArrowRight" ? 1 : -1;
      inGallery ? setImg(G.i + d) : turn(d);
    }
    if (inGallery && (e.key === "i" || e.key === "I") && !e.metaKey && !e.ctrlKey) toggleInfo();
    if (e.key === "Tab") {
      const box = inGallery ? gallery : reader;
      const f = [...box.querySelectorAll("button, a[href], [tabindex='0']")].filter(x => x.offsetParent && !x.disabled);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- language, resize, start ---------- */
  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dataset.lang = lang;
    document.querySelectorAll("[data-t]").forEach(el => { const v = T[lang][el.dataset.t]; if (typeof v === "string") el.textContent = v; });
    document.querySelectorAll("[data-t-label]").forEach(el => { const v = T[lang][el.dataset.tLabel]; if (typeof v === "string" && v) { el.setAttribute("aria-label", v); el.dataset.tip = v; if (el.title) el.title = v; } });
    document.querySelectorAll("[data-set-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.setLang === lang)));
    document.querySelectorAll(".info-text[lang]").forEach(el => { el.hidden = el.lang !== lang; });
    document.querySelectorAll("[data-lines]").forEach(el => {
      const v = T[lang][el.dataset.lines]; if (typeof v === "string") el.innerHTML = v.split("\n").filter(Boolean).map(x => `<li>${esc(x)}</li>`).join("");
    });
    document.title = T[lang]["seo.title"] || document.title;
    renderFilters(); renderSheet(); renderShelves(); renderChrono();
    setSlide(cur);
    if (current) current.type === "book" ? (readerUI(), $("#rTitle").textContent = L(byId[current.id].title)) : showGallery(current.type, current.id, true);
  }
  document.querySelectorAll("[data-set-lang]").forEach(b => b.addEventListener("click", () => {
    lang = b.dataset.setLang; try { localStorage.setItem("ns-lang", lang); } catch (e) {} applyLang();
  }));
  const setHdr = () => document.documentElement.style.setProperty("--hdr", top.offsetHeight + "px");
  let rz, lastW = 0;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { setHdr(); const w = $("#sheet").clientWidth; if (w !== lastW) { lastW = w; renderSheet(); }
    if (!reader.hidden && !R.busy) { const two = innerWidth > 760; if (two !== R.two) { const w = byId[R.id]; R.two = two; R.v = 0; R.pages = bookPages(w); R.aspect = pageAspect(w); buildViews(); } sizeBook(); drawView(R.v); } }, 150); });

  buildHero();
  applyLang();
  setHdr();
  lastW = $("#sheet").clientWidth;
  route();
})();
