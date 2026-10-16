(function () {
  "use strict";
  const A = window.ARCHIVE;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const T = {
    en: {
      info: "Works across information, editorial, and artistic practice. Based in Berlin, with a background in \u201cDesign\u201d and \u201cPublic Art and New Artistic Strategies\u201d.",
      contact: "Contact", close: "Close", all: "All", art: "Artistic/Research", design: "Design/Editorial",
      series: "Series", prev: "Previous", next: "Next", noImage: "No image", read: "Publication (PDF)", readJa: "Japanese edition (PDF)",
      shelves: { authored: "Project documentation", collaborative: "Collaborative", layout_design: "Layout design" },
      facts: { place: "Place", venue: "Venue", medium: "Medium", role: "Role", collaborators: "With", funding: "Support", award: "Award", credit: "Credits", photo: "Photos" },
    },
    ja: {
      info: "このサイトには、展示やリサーチ、デザインプロジェクトの一部を収録しています。東京で環境デザイン、ドイツで現代美術に関する研究制作を経て、現在はUIや情報編集を軸に活動しています。",
      contact: "お問い合わせ", close: "閉じる", all: "すべて", art: "アート・リサーチ", design: "デザイン・編集",
      series: "シリーズ", prev: "前へ", next: "次へ", noImage: "画像なし", read: "出版物（PDF）", readJa: "日本語版（PDF）",
      shelves: { authored: "プロジェクト記録", collaborative: "共同制作", layout_design: "レイアウトデザイン" },
      facts: { place: "場所", venue: "会場", medium: "メディウム", role: "役割", collaborators: "協働", funding: "助成", award: "受賞", credit: "クレジット", photo: "撮影" },
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

  /* selected series */
  function renderSelected() {
    $("#selected").innerHTML = A.series.filter(s => s.hero).map(s =>
      `<button type="button" class="series" data-series="${s.id}">
        <img src="${esc(s.hero.src)}" alt="" width="${s.hero.w}" height="${s.hero.h}" decoding="async">
        <p>${esc(L(s.title))} <span>${esc(t("series"))}</span></p>
      </button>`).join("");
  }

  /* archive */
  let area = "art", view = "grid";
  const shown = () => works.filter(w => area === "all" || w.area === area);

  function renderFilters() {
    const n = k => k === "all" ? works.length : works.filter(w => w.area === k).length;
    $("#filters").innerHTML = ["all", "art", "design"].map(k =>
      `<button type="button" data-area="${k}" aria-pressed="${k === area}">${esc(t(k))} <span class="n">${n(k)}</span></button>`).join("");
    document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
  }

  function renderSheet() {
    const sheet = $("#sheet");
    const list = shown();
    if (view === "list") {
      sheet.innerHTML = `<ol class="list">${list.map(w =>
        `<li><button type="button" data-open="${w.id}"><span class="y">${esc(w.year)}</span><span>${esc(L(w.title))}</span><span class="p">${esc(place(w))}</span></button></li>`).join("")}</ol>`;
      return;
    }
    const W = sheet.clientWidth, gap = 12;
    const target = W < 560 ? 150 : W < 1000 ? 220 : 300;
    list.sort((a, b) => (!!cover(b)) - (!!cover(a)));
    const items = list.map(w => { const im = cover(w); return { w, im, r: im ? Math.min(2.2, Math.max(0.55, im.w / im.h)) : 1.4 }; });
    const rows = []; let row = [], sum = 0;
    for (const it of items) {
      row.push(it); sum += it.r;
      if (sum * target + gap * (row.length - 1) >= W) { rows.push({ row, h: (W - gap * (row.length - 1)) / sum }); row = []; sum = 0; }
    }
    if (row.length) rows.push({ row, h: target });
    sheet.innerHTML = rows.map(({ row, h }) => row.map(({ w, im, r }) => {
      const wd = Math.floor(r * h);
      return `<button type="button" class="tile${im ? "" : " blank"}" data-open="${w.id}" style="width:${wd}px">
        <span class="frame" style="height:${Math.round(h)}px">${im ? `<img src="${esc(h > 260 ? im.src : im.thumb)}" alt="" loading="lazy" decoding="async">` : esc(t("noImage"))}</span>
        <span class="cap"><span class="y">${esc(w.y0)}</span><span>${esc(L(w.title))}</span></span>
      </button>`;
    }).join("")).join("");
  }

  $("#filters").addEventListener("click", e => { const b = e.target.closest("[data-area]"); if (b) { area = b.dataset.area; renderFilters(); renderSheet(); } });
  document.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => { view = b.dataset.view; renderFilters(); renderSheet(); }));

  /* bookshelf */
  let shelf = "authored";
  function renderShelf() {
    const cats = ["authored", "collaborative", "layout_design"].filter(k => A.works.some(w => w.book && w.book.category === k));
    $("#shelfTabs").innerHTML = cats.map(k => `<button type="button" data-shelf="${k}" aria-pressed="${k === shelf}">${esc(t("shelves")[k])}</button>`).join("");
    $("#shelf").innerHTML = A.works.filter(w => w.book && w.book.category === shelf).sort((a, b) => a.book.order - b.book.order).map(w => {
      const c = w.book.cover;
      return `<button type="button" class="book" data-open="${w.id}">${c ? `<img src="${esc(c.src)}" alt="" loading="lazy" width="${c.w}" height="${c.h}">` : ""}<span>${esc(L(w.title))}</span></button>`;
    }).join("");
  }
  $("#shelfTabs").addEventListener("click", e => { const b = e.target.closest("[data-shelf]"); if (b) { shelf = b.dataset.shelf; renderShelf(); } });

  /* viewer */
  const viewer = $("#viewer");
  let current = null, lastFocus = null;

  function strip(figs) {
    $("#vStrip").innerHTML = figs.length ? figs.join("") : `<div class="none">${esc(t("noImage"))}</div>`;
    $("#vStrip").scrollLeft = 0;
  }
  function openViewer() {
    if (viewer.hidden) lastFocus = document.activeElement;
    viewer.hidden = false;
    document.body.classList.add("locked");
    $("#vScroll").scrollTop = 0;
    $("#vClose").focus({ preventScroll: true });
  }

  function showWork(id, imgIndex) {
    const w = byId[id]; if (!w) return;
    current = { type: "work", id };
    const n = w.images.length;
    strip(w.images.map((m, i) => `<figure><img src="${esc(m.src)}" alt="${esc(L(w.title))}, ${i + 1}" width="${m.w}" height="${m.h}"${i > 1 ? ' loading="lazy"' : ""}>${n > 1 ? `<figcaption>${i + 1} / ${n}</figcaption>` : ""}</figure>`));
    $("#vTitle").textContent = L(w.title);
    $("#vSub").textContent = [w.year, place(w)].filter(Boolean).join(", ");
    const text = L(w.long) || L(w.desc);
    const pdf = w.pdfs.map(p => `<a href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.lang === "ja" ? t("readJa") : t("read"))}</a>`).join("　");
    $("#vBody").innerHTML = text.split(/\n+/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join("") + (pdf ? `<p class="pdf">${pdf}</p>` : "");
    const F = t("facts");
    $("#vFacts").innerHTML = [["venue", w.venue], ["medium", w.medium.join(", ")], ["role", w.role], ["collaborators", w.collaborators],
      ["funding", w.funding], ["award", w.award], ["credit", w.credit], ["photo", w.photoCredit]]
      .filter(f => f[1]).map(([k, v]) => `<div><dt>${esc(F[k])}</dt><dd>${esc(v)}</dd></div>`).join("");
    const i = works.findIndex(x => x.id === id);
    const prev = works[(i - 1 + works.length) % works.length], next = works[(i + 1) % works.length];
    $("#vPrev").innerHTML = `<small>${esc(t("prev"))}</small>${esc(L(prev.title))}`; $("#vPrev").dataset.go = prev.id; $("#vPrev").hidden = false;
    $("#vNext").innerHTML = `<small>${esc(t("next"))}</small>${esc(L(next.title))}`; $("#vNext").dataset.go = next.id; $("#vNext").hidden = false;
    openViewer();
    if (imgIndex) requestAnimationFrame(() => { const f = $("#vStrip").children[imgIndex]; if (f) $("#vStrip").scrollLeft = f.offsetLeft - $("#vStrip").offsetLeft; });
  }

  function showSeries(sid) {
    const s = A.series.find(x => x.id === sid); if (!s) return;
    current = { type: "series", id: sid };
    const kids = s.children.map(id => byId[id]).filter(Boolean);
    strip(kids.map(w => { const im = cover(w); return im ? `<figure><button type="button" data-open="${w.id}"><img src="${esc(im.src)}" alt="${esc(L(w.title))}" width="${im.w}" height="${im.h}"></button><figcaption>${esc(w.y0)}　${esc(L(w.title))}</figcaption></figure>` : ""; }).filter(Boolean));
    $("#vTitle").textContent = L(s.title);
    $("#vSub").textContent = t("series") + (kids.length ? ", " + Math.min(...kids.map(k => k.y0)) + "–" + Math.max(...kids.map(k => k.y1)) : "");
    $("#vBody").innerHTML = kids.map(w => `<p><button type="button" data-open="${w.id}" style="text-decoration:underline;text-underline-offset:4px">${esc(L(w.title))}</button> <span style="color:var(--quiet)">${esc(w.year)}</span></p>`).join("");
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
  }
  function route(imgIndex) {
    const m = location.hash.match(/^#(work|series)=([\w-]+)/);
    if (!m) return closeViewer(true);
    m[1] === "work" ? showWork(m[2], imgIndex) : showSeries(m[2]);
  }

  document.addEventListener("click", e => {
    const o = e.target.closest("[data-open]"); if (o) { e.preventDefault(); go("#work=" + o.dataset.open); return; }
    const s = e.target.closest("[data-series]"); if (s) go("#series=" + s.dataset.series);
  });
  $("#vClose").addEventListener("click", () => closeViewer());
  $("#vPrev").addEventListener("click", e => go("#work=" + e.currentTarget.dataset.go));
  $("#vNext").addEventListener("click", e => go("#work=" + e.currentTarget.dataset.go));
  window.addEventListener("popstate", () => route());
  document.addEventListener("keydown", e => {
    if (viewer.hidden) return;
    if (e.key === "Escape") closeViewer();
    if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && e.target.closest("#vStrip, #vClose")) {
      e.preventDefault(); $("#vStrip").scrollBy({ left: (e.key === "ArrowRight" ? 1 : -1) * $("#vStrip").clientWidth * 0.8, behavior: "smooth" });
    }
    if (e.key === "Tab") {
      const f = [...viewer.querySelectorAll("button, a[href], [tabindex='0']")].filter(x => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* language */
  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dataset.lang = lang;
    document.querySelectorAll("[data-t]").forEach(el => { const v = T[lang][el.dataset.t]; if (typeof v === "string") el.textContent = v; });
    document.querySelectorAll("[data-set-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.setLang === lang)));
    renderSelected(); renderFilters(); renderSheet(); renderShelf();
    if (current) current.type === "work" ? showWork(current.id) : showSeries(current.id);
  }
  document.querySelectorAll("[data-set-lang]").forEach(b => b.addEventListener("click", () => {
    lang = b.dataset.setLang; try { localStorage.setItem("ns-lang", lang); } catch (e) {} applyLang();
  }));
  let rz, lastW = 0;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { const w = $("#sheet").clientWidth; if (w !== lastW) { lastW = w; renderSheet(); } }, 150); });

  applyLang();
  lastW = $("#sheet").clientWidth;
  route();
})();
