(function () {
  "use strict";
  const A = window.ARCHIVE;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const T = {
    en: {
      "nav.works": "Works", "nav.index": "Index", "nav.books": "Books", "nav.info": "Info",
      statement: "Works on places, memory, and what lies between people and their surroundings.",
      "info.1": "Natsumi Sugiyama works across artistic research, editorial design, and information design. Her projects collect how people form a sense of place — through fieldwork, drawing, interviews, installation, and publication.",
      "info.2": "She studied environmental design in Tokyo and Public Art and New Artistic Strategies in Germany, and is based in Berlin.",
      "info.contact": "For exhibitions, research, and publications",
      "foot.rights": "Images and texts may not be reused without permission.",
      hint: "Swipe the field to see later years.",
      close: "Close", open: "Open work", all: "All", art: "Art and research", design: "Design and editorial",
      fieldIdle: n => `${n} works, placed by year and theme. Select one to open it.`,
      images: n => n === 1 ? "1 image" : `${n} images`, noImage: "No images published yet",
      prev: "Previous", next: "Next", read: "Read the publication", pdfJa: "Japanese edition",
      shelves: { authored: "Project documentation", collaborative: "Collaborative publications", layout_design: "Layout design" },
      facts: { year: "Year", place: "Place", venue: "Venue", medium: "Medium", role: "Role", collaborators: "With", funding: "Support", award: "Award", credit: "Credits", photo: "Photos", series: "Series", website: "Website" },
    },
    ja: {
      "nav.works": "作品", "nav.index": "一覧", "nav.books": "本", "nav.info": "情報",
      statement: "場所と記憶、そして人とその環境のあいだにあるものをめぐる制作とリサーチ。",
      "info.1": "Natsumi Sugiyamaは、芸術的リサーチ、編集デザイン、情報デザインを横断して活動しています。フィールドワーク、ドローイング、インタビュー、インスタレーション、出版を通して、人がどのように場所の感覚を形づくるのかを採集しています。",
      "info.2": "東京で環境デザインを、ドイツで現代美術（Public Art and New Artistic Strategies）を学び、現在はベルリンを拠点にしています。",
      "info.contact": "展示・リサーチ・出版のご相談",
      "foot.rights": "画像およびテキストの無断転載を禁じます。",
      hint: "横にスワイプすると新しい年代が見られます。",
      close: "閉じる", open: "作品を見る", all: "すべて", art: "アート・リサーチ", design: "デザイン・編集",
      fieldIdle: n => `${n}件の作品を、年とテーマで配置しています。選ぶと開きます。`,
      images: n => `画像 ${n}点`, noImage: "画像は未公開です",
      prev: "前へ", next: "次へ", read: "出版物を読む", pdfJa: "日本語版",
      shelves: { authored: "プロジェクト記録", collaborative: "共同出版", layout_design: "レイアウトデザイン" },
      facts: { year: "年", place: "場所", venue: "会場", medium: "メディウム", role: "役割", collaborators: "協働", funding: "助成", award: "受賞", credit: "クレジット", photo: "撮影", series: "シリーズ", website: "ウェブサイト" },
    },
  };

  let lang = "en";
  try { lang = localStorage.getItem("ns-lang") === "ja" ? "ja" : "en"; } catch (e) {}
  const t = k => T[lang][k];
  const L = o => (o && (o[lang] || o.en)) || "";

  const works = A.works.slice().sort((a, b) => b.y0 - a.y0 || a.id.localeCompare(b.id));
  const byId = Object.fromEntries(works.map(w => [w.id, w]));
  const seriesOf = id => A.series.find(s => s.children.includes(id));
  const place = w => [w.city, w.country].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ");
  const altTitle = w => {
    const en = w.title.en, ja = w.title.ja;
    if (!ja || ja === en) return "";
    if (lang === "ja") return ja.includes(en) ? "" : en;
    return ja.replace(en, "").replace(/^[\s｜|:：]+/, "").trim();
  };
  const cover = w => w.images[0] || (w.book && w.book.cover) || null;

  /* ---------- field ---------- */
  const field = $("#field");
  const caption = $("#fieldCaption");
  const Y0 = 2012.4, Y1 = 2026.6;

  function layoutField(animate) {
    const W = Math.max(field.clientWidth, 920);
    const H = field.clientHeight;
    const axisH = 28, bands = A.bands, bh = (H - axisH) / bands.length;
    const padL = 24, padR = 40;
    const xOf = y => padL + (y - Y0) / (Y1 - Y0) * (W - padL - padR);
    const th = Math.max(30, Math.min(58, bh * 0.46));

    let html = bands.map((b, i) =>
      `<div class="band" style="top:${i * bh}px;height:${bh}px"><span class="band-label">${esc(b[lang])}</span></div>`).join("");
    html += `<div class="axis">` + Array.from({ length: 14 }, (_, i) => 2013 + i)
      .map(y => `<span class="tick" style="left:${xOf(y)}px">${(y % 2 === 1 || y === 2026) ? `<span>${y}</span>` : ""}</span>`).join("") + `</div>`;

    const placed = [];
    let order = 0;
    const items = works.slice().sort((a, b) => a.y0 - b.y0);
    for (const w of items) {
      const bi = Math.max(0, bands.findIndex(b => b.key === w.band));
      const base = (bi + 1) * bh - 8;
      const im = cover(w);
      const ratio = im ? Math.min(1.7, Math.max(0.7, im.w / im.h)) : 1.3;
      const h = w.featured ? th * 1.3 : th, wd = h * ratio;
      let cx = xOf(w.y0 + 0.5 * Math.min(1, w.y1 - w.y0)), rect = null, stem = 0;
      for (let tries = 0; tries < 12 && !rect; tries++) {
        for (let lvl = 0; lvl < 3 && !rect; lvl++) {
          const s = 10 + lvl * h * 0.62;
          const r = { x: cx - wd / 2 + (tries ? tries * wd * 0.35 : 0), y: base - s - h, w: wd, h };
          if (r.y < bi * bh + 22) continue;
          const hit = placed.some(p => r.x < p.x + p.w + 4 && r.x + r.w + 4 > p.x && r.y < p.y + p.h + 4 && r.y + r.h + 4 > p.y);
          if (!hit) { rect = r; stem = s; }
        }
      }
      if (!rect) { rect = { x: cx - wd / 2, y: base - 10 - h, w: wd, h }; stem = 10; }
      rect.x = Math.min(Math.max(rect.x, 0), W - rect.w);
      placed.push(rect);
      const img = im ? `<img src="${esc(im.thumb)}" alt="" loading="lazy" decoding="async">` : "";
      html += `<button type="button" role="listitem" class="spec${im ? "" : " empty"}" data-id="${w.id}"
        style="left:${rect.x}px;top:${rect.y}px;width:${rect.w}px;height:${rect.h}px;--stem:${stem}px;--d:${order++ * 28}ms"
        aria-label="${esc(w.year + ", " + L(w.title))}">${img}<span class="pin"></span></button>`;
    }
    field.innerHTML = html;
    if (animate) {
      field.classList.add("is-loading");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        field.classList.remove("is-loading");
        setTimeout(() => field.classList.add("is-ready"), works.length * 28 + 300);
      }));
    }
    idleCaption();
  }

  function idleCaption() { caption.textContent = t("fieldIdle")(works.length); }
  function readSpec(el) {
    field.querySelectorAll(".spec.is-on").forEach(s => s.classList.remove("is-on"));
    if (!el) { field.classList.remove("is-reading"); idleCaption(); return; }
    const w = byId[el.dataset.id];
    el.classList.add("is-on");
    field.classList.add("is-reading");
    const line = L(w.question) || L(w.desc);
    caption.innerHTML = `<span class="muted">${esc(w.year)}${place(w) ? ", " + esc(place(w)) : ""}</span><br>
      <span class="cap-title">${esc(L(w.title))}</span>${line ? `<span class="cap-q">${esc(line)}</span>` : ""}`;
  }
  field.addEventListener("pointerover", e => { const s = e.target.closest(".spec"); if (s) readSpec(s); });
  field.addEventListener("pointerleave", () => readSpec(null));
  field.addEventListener("focusin", e => { const s = e.target.closest(".spec"); if (s) readSpec(s); });
  field.addEventListener("focusout", e => { if (!field.contains(e.relatedTarget)) readSpec(null); });
  field.addEventListener("click", e => { const s = e.target.closest(".spec"); if (s) openWork(s.dataset.id); });

  /* ---------- selected works ---------- */
  function renderSelected() {
    const sel = A.works.filter(w => w.featured).sort((a, b) => a.featOrder - b.featOrder);
    $("#selected").innerHTML = sel.map(w => {
      const im = cover(w), s = seriesOf(w.id);
      const more = w.images.slice(1, 4).map((m, i) =>
        `<button type="button" data-open="${w.id}" data-img="${i + 1}" aria-label="${esc(L(w.title))}, ${i + 2}"><img src="${esc(m.thumb)}" alt="" loading="lazy"></button>`).join("");
      const alt = altTitle(w);
      return `<article class="work">
        <div class="work-media">
          <button type="button" class="work-cover" data-open="${w.id}" aria-label="${esc(t("open"))}: ${esc(L(w.title))}">
            ${im ? `<img src="${esc(im.src)}" alt="" loading="lazy" decoding="async" width="${im.w}" height="${im.h}" style="max-width:min(100%, ${Math.round(im.w * 1.4)}px)">` : ""}
          </button>
          ${more ? `<div class="work-more">${more}</div>` : ""}
        </div>
        <div class="work-text">
          <p class="meta">${esc(w.year)}${place(w) ? ", " + esc(place(w)) : ""}${s ? `<br>${esc(L(s.title))}` : ""}</p>
          <h3>${esc(L(w.title))}</h3>
          ${alt ? `<p class="alt">${esc(alt)}</p>` : ""}
          ${L(w.question) ? `<p class="question">${esc(L(w.question))}</p>` : `<p class="desc">${esc(L(w.desc))}</p>`}
          <button type="button" class="open" data-open="${w.id}">${esc(t("open"))}</button>
        </div>
      </article>`;
    }).join("");
  }

  /* ---------- index ---------- */
  let filter = "all";
  function renderIndex() {
    const counts = { all: works.length, art: works.filter(w => w.area === "art").length, design: works.filter(w => w.area === "design").length };
    $("#filter").innerHTML = ["all", "art", "design"].map(k =>
      `<button type="button" data-filter="${k}" aria-pressed="${k === filter}">${esc(t(k))} <span class="muted">${counts[k]}</span></button>`).join("");
    $("#indexList").innerHTML = works.filter(w => filter === "all" || w.area === filter).map(w => {
      const im = cover(w);
      return `<li><button type="button" class="row" data-open="${w.id}">
        <span class="thumb">${im ? `<img src="${esc(im.thumb)}" alt="" loading="lazy">` : ""}</span>
        <span class="y">${esc(w.year)}</span>
        <span class="t">${esc(L(w.title))}</span>
        <span class="m">${esc(w.medium.slice(0, 3).join(", "))}</span>
        <span class="p">${esc(place(w))}</span>
      </button></li>`;
    }).join("");
  }
  $("#filter").addEventListener("click", e => {
    const b = e.target.closest("[data-filter]"); if (!b) return;
    filter = b.dataset.filter; renderIndex();
  });

  /* ---------- books ---------- */
  function renderBooks() {
    const groups = {};
    A.works.filter(w => w.book).forEach(w => (groups[w.book.category] = groups[w.book.category] || []).push(w));
    $("#shelves").innerHTML = ["authored", "collaborative", "layout_design"].filter(k => groups[k]).map(k =>
      `<div class="shelf"><h3>${esc(t("shelves")[k])}</h3><div class="shelf-row">${groups[k].sort((a, b) => a.book.order - b.book.order).map(w => {
        const c = w.book.cover;
        return `<button type="button" class="book" data-open="${w.id}">${c ? `<img src="${esc(c.thumb)}" alt="" loading="lazy" width="${c.w}" height="${c.h}">` : ""}<span>${esc(L(w.title))}</span></button>`;
      }).join("")}</div></div>`).join("");
  }

  /* ---------- viewer ---------- */
  const viewer = $("#viewer");
  let current = null, lastFocus = null;

  function openWork(id, imgIndex) {
    if (!byId[id]) return;
    if (location.hash !== "#work=" + id) history.pushState(null, "", "#work=" + id);
    showWork(id, imgIndex);
  }
  function showWork(id, imgIndex) {
    const w = byId[id]; if (!w) return;
    if (viewer.hidden) lastFocus = document.activeElement;
    current = id;
    const s = seriesOf(id);
    $("#vCrumb").textContent = `Natsumi Sugiyama, ${L(w.title)}`;
    $("#vYear").textContent = w.year + (place(w) ? ", " + place(w) : "");
    $("#vTitle").textContent = L(w.title);
    $("#vAlt").textContent = altTitle(w);
    const n = w.images.length;
    $("#vStrip").innerHTML = n ? w.images.map((m, i) =>
      `<figure><img src="${esc(m.src)}" alt="${esc(L(w.title))}, ${i + 1}" width="${m.w}" height="${m.h}" ${i > 1 ? 'loading="lazy"' : ""}><figcaption>${i + 1} / ${n}</figcaption></figure>`).join("")
      : `<div class="none">${esc(t("noImage"))}</div>`;
    $("#vQuestion").textContent = L(w.question);
    $("#vQuestion").hidden = !L(w.question);
    const long = L(w.long) || L(w.desc);
    $("#vLong").innerHTML = long.split(/\n+/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join("");
    $("#vPdf").innerHTML = w.pdfs.length ? `<p class="pdfs">${w.pdfs.map(p =>
      `<a href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.lang === "ja" ? t("pdfJa") : t("read"))} (PDF, ${p.mb} MB)</a>`).join("")}</p>` : "";
    const F = t("facts");
    const facts = [
      ["year", w.year], ["place", place(w)], ["venue", w.venue], ["medium", w.medium.join(", ")],
      ["role", w.role], ["collaborators", w.collaborators], ["funding", w.funding], ["award", w.award],
      ["series", s ? L(s.title) : ""], ["credit", w.credit], ["photo", w.photoCredit],
    ].filter(f => f[1]);
    $("#vFacts").innerHTML = facts.map(([k, v]) => `<dt>${esc(F[k])}</dt><dd>${esc(v)}</dd>`).join("")
      + (w.website ? `<dt>${esc(F.website)}</dt><dd><a href="${esc(w.website)}" target="_blank" rel="noopener">${esc(w.website.replace(/^https?:\/\//, ""))}</a></dd>` : "");
    const i = works.findIndex(x => x.id === id);
    const prev = works[(i - 1 + works.length) % works.length], next = works[(i + 1) % works.length];
    $("#vPrev").innerHTML = `<small>${esc(t("prev"))}</small>${esc(L(prev.title))}`; $("#vPrev").dataset.go = prev.id;
    $("#vNext").innerHTML = `<small>${esc(t("next"))}</small>${esc(L(next.title))}`; $("#vNext").dataset.go = next.id;
    viewer.hidden = false;
    document.body.classList.add("locked");
    $("#vScroll").scrollTop = 0;
    const strip = $("#vStrip");
    strip.scrollLeft = 0;
    if (imgIndex) requestAnimationFrame(() => { const f = strip.children[imgIndex]; if (f) strip.scrollLeft = f.offsetLeft - strip.offsetLeft; });
    $("#vClose").focus({ preventScroll: true });
  }
  function closeWork(fromHistory) {
    if (viewer.hidden) return;
    viewer.hidden = true; current = null;
    document.body.classList.remove("locked");
    if (!fromHistory) history.pushState(null, "", location.pathname + location.search);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  $("#vClose").addEventListener("click", () => closeWork());
  $("#vPrev").addEventListener("click", e => openWork(e.currentTarget.dataset.go));
  $("#vNext").addEventListener("click", e => openWork(e.currentTarget.dataset.go));
  document.addEventListener("keydown", e => {
    if (viewer.hidden) return;
    if (e.key === "Escape") closeWork();
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const strip = $("#vStrip"), dir = e.key === "ArrowRight" ? 1 : -1;
      if (document.activeElement === strip || document.activeElement === $("#vClose")) {
        e.preventDefault(); strip.scrollBy({ left: dir * strip.clientWidth * 0.8, behavior: "smooth" });
      }
    }
    if (e.key === "Tab") {
      const f = [...viewer.querySelectorAll("button, a[href], [tabindex='0']")].filter(x => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-open]"); if (!b) return;
    openWork(b.dataset.open, +b.dataset.img || 0);
  });
  function route() {
    const m = location.hash.match(/^#work=([\w-]+)/);
    if (m && byId[m[1]]) showWork(m[1]); else closeWork(true);
  }
  window.addEventListener("popstate", route);

  /* ---------- language ---------- */
  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    document.querySelectorAll("[data-t]").forEach(el => { const v = T[lang][el.dataset.t]; if (typeof v === "string") el.textContent = v; });
    document.querySelectorAll("[data-set-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.setLang === lang)));
    layoutField(false); renderSelected(); renderIndex(); renderBooks();
    if (current) showWork(current);
  }
  document.querySelectorAll("[data-set-lang]").forEach(b => b.addEventListener("click", () => {
    lang = b.dataset.setLang;
    try { localStorage.setItem("ns-lang", lang); } catch (e) {}
    applyLang();
  }));

  let rz;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => layoutField(false), 150); });

  applyLang();
  layoutField(!matchMedia("(prefers-reduced-motion: reduce)").matches);
  route();
})();
