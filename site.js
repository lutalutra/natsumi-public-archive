(function () {
  "use strict";
  const A = window.ARCHIVE;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // *Title* inside a credit or note: the work title, slanted; plain text for attributes
  const fmt = v => esc(v).replace(/\*([^*]+)\*/g, '<span class="it">$1</span>');
  const plain = v => String(v || "").replace(/\*/g, "");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const T = {
    en: {
      "nav.index": "Index",
      info: "Works across information, editorial, and artistic practice. Based in Berlin, with a background in “Design” and “Public Art and New Artistic Strategies”.",
      "exhib.heading": "Selected exhibitions", "exhib.self": "self-organized", "exhib.hint": "Point at an exhibition to see the venue.", "book.protected": "Images © the artists. Not for reproduction.", zoom: "Magnifier", contact: "Contact", "info.related": "Related:", "back.short": "Back", "back.list.pos": "Back to the list", "turn.phone": "Please turn your phone upright — the site is made for portrait view on phones.", close: "Close", "close.back": "Close — back to where you were", all: "All", art: "Artistic practice", design: "Design", infoBtn: "Info", top: "Back to top", allMedia: "All media",
      series: "Series", prev: "Previous", next: "Next", noImage: "No image", read: "Publication (PDF)", readJa: "Japanese edition (PDF)",
      "all.images": "All images", "about.work": "About this work", "read.book": "Read the book", cover: "Cover",
      "book.open": "Click the cover to open the book", "book.nopages": "Only the cover is in the archive so far",
      related: "Related", "back.list": "Back to the list", "back.shelf": "Back to the bookshelf", "about.book": "About this book",
      "book.pages": "Pages", "book.language": "Language", "book.format": "Format", "book.publisher": "Publisher", "book.paper": "Paper", "book.print": "Printing", "book.soon": "Pages in preparation", "gallery.soon": "Gallery photos in preparation", "book.artists": "Artists", "book.texts": "Texts", "book.isbn": "ISBN", "label.no": "Find No.", "label.find": "Find obj.", "book.shown": "{n} shown",
      "shelf.mobile": "The bookshelf is being adjusted for phones. For now it is best viewed on a computer.",
      "role.documentation": "Documentation of the project", "role.publication": "Publication of the project", "role.book": "Book from the project",
      "about.project": "About the project", "open.project": "View the project",
      "more.title": "Read the text", "more.text": "The whole book, page by page, in the book reader.", "more.btn": "Open in the book reader",
      open: "Details", peekHint: "Point at a line to see the work. Lines run from the first to the last year of each project.",
      tracks: { art: ["Artistic practice", "Natsumi Sugiyama"], design: ["Design", "natyama"], projects: ["Studio", ""] },
      status: { planned: "Planned", ongoing: "Ongoing", done: "Completed" }, since: "since",
      shelves: { authored: "Project documentation", collaborative: "Collaborative", layout_design: "Layout design" },
      facts: { venue: "Venue", material: "Materials", print: "Printing", medium: "Medium", role: "Role", collaborators: "With", funding: "Support", award: "Award", credit: "Credits", photo: "Photos", series: "Series", commissioner: "Commissioned by", organizations: "Organizations" },
    },
    ja: {
      "nav.index": "インデックス",
      info: "このサイトには、展示やリサーチ、デザインプロジェクトの一部を収録しています。東京で環境デザイン、ドイツで現代美術に関する研究制作を経て、現在はUIや情報編集を軸に活動しています。",
      "exhib.heading": "主な展示", "exhib.self": "自主企画", "exhib.hint": "展示にカーソルを合わせると会場が表示されます。", "book.protected": "掲載作品の画像の著作権は各作家に帰属します。転載はご遠慮ください。", zoom: "拡大鏡", contact: "お問い合わせ", "info.related": "Related:", "back.short": "Back", "back.list.pos": "一覧に戻る", "turn.phone": "スマートフォンは縦向きでご覧ください。", close: "閉じる", "close.back": "閉じる（元の場所へ）", all: "すべて", art: "作家活動", design: "デザイン", infoBtn: "情報", top: "トップへ戻る", allMedia: "すべてのメディア",
      series: "シリーズ", prev: "前へ", next: "次へ", noImage: "画像なし", read: "出版物（PDF）", readJa: "日本語版（PDF）",
      "all.images": "すべての画像", "about.work": "作品について", "read.book": "本を開く", cover: "表紙",
      "book.open": "表紙をクリックすると本が開きます", "book.nopages": "アーカイブにはまだ表紙のみです",
      related: "関連するもの", "back.list": "一覧へ戻る", "back.shelf": "本棚へ戻る", "about.book": "この冊子について",
      "book.pages": "ページ数", "book.language": "言語", "book.format": "仕様", "book.publisher": "発行", "book.paper": "用紙", "book.print": "印刷", "book.soon": "現在本文ページ準備中", "gallery.soon": "ギャラリー写真準備中", "book.artists": "アーティスト", "book.texts": "テキスト", "book.isbn": "ISBN", "label.no": "Find No.", "label.find": "出土品", "book.shown": "うち{n}ページを掲載",
      "shelf.mobile": "本棚はスマートフォン表示を調整中です。現在はPCでの閲覧をおすすめします。",
      "role.documentation": "プロジェクト「{t}」のドキュメンテーション", "role.publication": "プロジェクト「{t}」のパブリケーション", "role.book": "プロジェクト「{t}」に関する出版物",
      "about.project": "プロジェクトについて", "open.project": "プロジェクトを見る",
      "more.title": "本文を読む", "more.text": "本の全ページをブックリーダーで読めます。", "more.btn": "ブックリーダーで開く",
      open: "作品を見る", peekHint: "線に触れると作品が表示されます。線の長さは各プロジェクトの期間です。",
      tracks: { art: ["作家活動", "Natsumi Sugiyama"], design: ["デザイン", "natyama"], projects: ["スタジオプロジェクト", ""] },
      status: { planned: "準備中", ongoing: "進行中", done: "完了" }, since: "",
      shelves: { authored: "プロジェクト記録", collaborative: "共同制作", layout_design: "レイアウトデザイン" },
      facts: { venue: "会場", material: "素材", print: "印刷", medium: "メディウム", role: "役割", collaborators: "協働", funding: "助成", award: "受賞", credit: "クレジット", photo: "撮影", series: "シリーズ", commissioner: "委託", organizations: "関係機関" },
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
  // the studio's name in a heading links to its site (texts.csv info.studio / info.studio.url)
  const studio = text => { const name = T.en["info.studio"] || "nat/yama", url = T.en["info.studio.url"];
    return url ? esc(text).split(esc(name)).join(`<a class="studio-name" href="${esc(url)}" target="_blank" rel="noopener">${esc(name)}</a>`) : esc(text); };

  // indexOnly works (visibility "index") appear on the index only: no grid, list, bookshelf or page
  const allWorks = A.works.slice().sort((a, b) => b.y0 - a.y0 || a.id.localeCompare(b.id));
  const works = allWorks.filter(w => !w.indexOnly);
  // works kept off the archive grid/list (archive_view = hidden) still have their page and index line
  const listed = works.filter(w => !w.archiveHidden);
  const byId = Object.fromEntries(allWorks.map(w => [w.id, w]));
  // A place is shown only where it belongs to the work: an installation view, or research tied to a region.
  const PLACE_MEDIA = /installation|exhibition|field research|field observation|fieldwork|interview|participant observation|site/i;
  const place = w => (w.area === "art" && w.city && PLACE_MEDIA.test(w.medium.join(" "))) ? (T[lang]["city." + w.city] || w.city) : "";
  const mediumLabel = m => { const k = m.charAt(0).toLowerCase() + m.slice(1); return T[lang]["medium." + k] || k; };
  const cover = w => w.images[0] || (w.book && w.book.cover) || null;
  const seriesOf = id => A.series.find(s => s.children.includes(id));

  /* ---------- opening slideshow ---------- */
  const top = $("#top"), hero = $("#hero"), foot = $("#heroFoot");
  const slides = A.hero.filter(h => byId[h.id]);
  const panHero = matchMedia("(max-width: 760px) and (orientation: portrait)").matches;   // phones: wide photos pan across
  const DUR = panHero ? 10000 : 5500;
  let cur = 0, timer = null, paused = false, pastHero = false;

  // found objects side by side, each with its find number (the opening, and the first page of the work's gallery);
  // a click opens that object's own page
  const gridHTML = (s, on) => `<div class="hero-grid${s.grid.every(c => c.cut) ? " objs" : ""}${s.grid.some(c => c.label) ? " capd" : ""}${on ? " is-on" : ""}" style="--n:${s.grid.length}">${s.grid.map((c, k) =>
    `<button type="button" class="hg-cell" data-id="${esc(s.id)}" data-img="${c.i}" data-k="${k}" style="--k:${k}${c.scale ? `;--s:${c.scale}` : ""}"><span class="hg-im"><img src="${esc(c.src)}" alt="" decoding="async"></span>`
    + (c.label
      // objects with a museum label: a name tag, and under it the first lines of the narrative fragment
      ? `<span class="hg-cap"><span class="hg-memo" data-memo></span><span class="hg-quote" data-quote></span></span>`
      : `<span class="hg-no">${esc(t("label.find"))}${c.label ? " " + esc(c.label.no) : ""}</span>`) + `</button>`).join("")}</div>`;
  // quote = false: the name tags only (the opening, until the fragments are chosen again)
  const fillGrid = (root, s, quote = true) => root.querySelectorAll("[data-memo]").forEach(m => {
    const c = s.grid[+m.closest(".hg-cell").dataset.k];
    m.innerHTML = `<span class="hm-k">${esc(t("label.no"))}</span> <span class="hm-no">${esc(c && c.label ? c.label.no : "")}</span>`;
    const q = m.closest(".hg-cell").querySelector("[data-quote]"), qt = quote && c && c.label ? L(c.label.quote) : "";
    if (q) { q.hidden = !qt; q.innerHTML = qt ? (lang === "ja" ? "「" : "“") + fmt(qt) + (lang === "ja" ? "」" : "”") : ""; }
  });
  function buildHero() {
    $("#heroSlides").innerHTML = slides.map((s, i) => s.fit === "grid" ? gridHTML(s, i === 0)
      : `<img src="${esc(s.src)}" alt="" ${i ? 'loading="eager" decoding="async"' : 'fetchpriority="high"'} class="${i === 0 ? "is-on" : ""}${s.fit === "contain" ? " contain" : ""}">`).join("");
    $("#heroTicks").innerHTML = slides.map((s, i) =>
      `<button type="button" data-slide="${i}" aria-label="${i + 1}"><span></span></button>`).join("");
    $("#heroTicks").style.setProperty("--dur", DUR + "ms");
    hero.style.setProperty("--hero-dur", DUR + "ms");
  }
  function tone(l) { return l < 0.5 ? "on-dark" : "on-light"; }
  $("#heroSlides").addEventListener("click", e => {
    const c = e.target.closest(".hg-cell"); if (!c) return;
    e.preventDefault(); go("#work=" + c.dataset.id); setImg(c.closest(".capd") ? 1 + +c.dataset.k : +c.dataset.img);   // objects: page 1 is the overview
  });
  $("#heroSlides").addEventListener("pointerover", e => {
    const c = e.target.closest(".hg-cell"); if (!c || e.pointerType !== "mouse" || c.closest(".capd")) return;   // cut-outs show their fragment already
    const s = slides[cur]; if (s && s.grid) { clearTimeout(timer); showLabel($("#heroLabel"), s.grid[+c.dataset.k].label); }
  });
  $("#heroSlides").addEventListener("pointerout", e => {
    const c = e.target.closest(".hg-cell"); if (!c || (e.relatedTarget && c.contains(e.relatedTarget))) return;
    const s = slides[cur]; if (s && s.grid) { showLabel($("#heroLabel"), null); schedule(); }
  });
  // a museum label for a single object: number, classification, find context, and a fragment of the narrative it came from
  const labelHTML = lb => { const q = L(lb.quote), ja = lang === "ja";
    // one typeface throughout; the classification and the find context read as one flowing sentence
    const end = x => /[。.]$/.test(x) ? x : x + (ja ? "。" : ".");
    const body = [L(lb.class), L(lb.context)].filter(Boolean).map((x, i, all) => i < all.length - 1 ? end(x) : x).join(ja ? "" : " ");
    return `<p class="ml-no">${esc(t("label.no"))} ${esc(lb.no)}</p>`
      + (body ? `<p class="ml-body">${fmt(body)}</p>` : "")
      + (q ? `<p class="ml-q">${ja ? "「" : "“"}${fmt(q)}${ja ? "」" : "”"}</p>` : "")
      + (L(lb.source) ? `<p class="ml-src">${fmt(L(lb.source))}</p>` : ""); };
  const showLabel = (el, lb) => {
    el.classList.remove("in"); el.hidden = !lb; if (!lb) return;
    el.innerHTML = labelHTML(lb); void el.offsetWidth; el.classList.add("in");
  };
  function setSlide(i) {
    if (!slides.length) return;
    cur = (i + slides.length) % slides.length;
    const s = slides[cur], w = byId[s.id];
    document.querySelectorAll("#heroSlides > *").forEach((im, k) => {
      im.classList.toggle("is-on", k === cur);
      // found objects: they slide in one by one each time the slide comes up, then their finds slips
      if (im.classList.contains("capd")) { im.classList.remove("play"); if (k === cur) { void im.offsetWidth; im.classList.add("play"); } }
      if (k === cur && panHero) { im.style.animation = "none"; void im.offsetWidth; im.style.animation = ""; }   // restart the pan
    });
    foot.classList.remove("on-dark", "on-light"); foot.classList.add(tone(s.lumBottom));
    if (!pastHero) { top.classList.remove("on-dark", "on-light"); top.classList.add(tone(s.lumTop)); }
    const ser = s.link && A.series.find(x => x.id === s.link);
    hero.style.backgroundColor = s.fit === "contain" || s.fit === "grid" ? s.bg : "";
    showLabel($("#heroLabel"), s.label);
    if (s.grid) fillGrid($("#heroSlides").children[cur], s, HERO_QUOTES);
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
    $("#heroTicks").style.setProperty("--dur", slideDur(s) + "ms");   // the progress line keeps the slide's own time
    document.querySelectorAll("#heroTicks button").forEach((b, k) => {
      b.classList.toggle("is-past", k < cur);
      b.classList.remove("is-on");
      if (k === cur && !reduced) { void b.offsetWidth; b.classList.add("is-on"); }
      if (k === cur) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
    schedule();
  }
  // found objects with their slips and fragments stay up long enough to be read
  const HERO_QUOTES = false;   // the narrative fragments in the opening: off until they are chosen again
  const slideDur = s => s && s.grid && s.grid.some(c => c.label) ? Math.max(DUR, HERO_QUOTES ? 16000 : 9000) : DUR;
  function schedule() {
    clearTimeout(timer);
    if (reduced || paused || document.hidden || slides.length < 2) return;
    timer = setTimeout(() => setSlide(cur + 1), slideDur(slides[cur]));
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
    menuOn();
    if (!pastHero) setSlide(cur); else clearTimeout(timer);
  }, { rootMargin: (matchMedia("(max-width: 760px)").matches ? "-96px" : "-56px") + " 0px 0px 0px", threshold: 0 }).observe(hero);   // phones: taller header
  // the section menu shows as soon as the archive starts to come up, so it is there before the opening has scrolled away
  function menuOn() { top.classList.toggle("menu-on", pastHero || $("#archive").getBoundingClientRect().top < innerHeight * 0.92); }
  addEventListener("scroll", menuOn, { passive: true }); addEventListener("resize", menuOn);

  /* ---------- archive ---------- */
  let area = "art", view = "grid";
  let medium = null;
  // Design work is grouped into a few broad kinds; artistic work keeps its own media words.
  const kinds = w => {
    if (w.area === "art") {
      // exhibition is a context; interview and field research are methods, not media
      // only the five media words count; methods and contexts (exhibition, interview, observation…) are left out
      const m = w.medium.filter(x => /^(installation|drawing|photography|video|mixed media object|text|publication|fieldwork)$/i.test(x.trim()));
      if (!m.length) m.push("fieldwork");   // nothing but fieldwork: "fieldwork / unplaced"
      return [...new Set(m.map(mediumLabel))];   // two source words can share one label
    }
    if (w.kinds && w.kinds.length) return w.kinds.map(k => t("kind." + k));   // set by hand in projects.csv (archive_kind)
    const m = w.medium.map(x => x.toLowerCase()), has = re => m.some(x => re.test(x)), out = [];
    if (w.row !== "content" && has(/^(mobile app|website design|website|ui design)$/)) out.push("apps");   // app content stays content
    if (has(/book|booklet|zine|publication|editorial design|layout/)) out.push("books");
    if (has(/logo|graphic|infographic/)) out.push("graphics");
    if (has(/content|workshop|coaching|visual|video/) || !out.length) out.push("content");
    return out.map(k => t("kind." + k));
  };
  const venueOf = w => w.venueShort || "";
  const methodsOf = w => (w.method || []).map(k => T[lang]["method." + k] || k);
  let method = null;
  function renderFilters() {
    const n = k => k === "all" ? listed.length : listed.filter(w => w.area === k).length;
    $("#filters").innerHTML = ["all", "art", "design"].map(k =>
      `<button type="button" data-area="${k}" aria-pressed="${k === area}">${esc(t(k))} <span class="n">${n(k)}</span></button>`).join("");
    document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
    const pool = listed.filter(w => area === "all" || w.area === area), counts = {}, side = {};
    pool.forEach(w => kinds(w).forEach(k => { counts[k] = (counts[k] || 0) + 1; side[k] = w.area; }));
    const order = ["installation", "drawing", "mixed media object", "text", "fieldwork"].map(mediumLabel);   // fixed order for artistic media
    const rank = k => { const i = order.indexOf(k); return i < 0 ? 99 : i; };
    const keys = Object.keys(counts).sort((a, b) => (side[a] === side[b] ? 0 : side[a] === "art" ? -1 : 1) || (side[a] === "art" ? rank(a) - rank(b) : 0) || counts[b] - counts[a] || a.localeCompare(b));
    if (medium && !counts[medium]) medium = null;
    const mcount = {};
    pool.forEach(w => (w.method || []).forEach(k => { mcount[k] = (mcount[k] || 0) + 1; }));
    const mkeys = Object.keys(mcount).sort((a, b) => mcount[b] - mcount[a] || a.localeCompare(b));
    if (method && !mcount[method]) method = null;
    $("#methodRow").hidden = true; // method display switched off (data kept in projects.csv)
    $("#methods").innerHTML = `<button type="button" data-method="" aria-pressed="${!method}">${esc(t("allMethods"))}</button>`
      + mkeys.map(k => `<button type="button" class="m-chip" data-method="${esc(k)}" aria-pressed="${method === k}">${esc(T[lang]["method." + k] || k)} <span class="n">${mcount[k]}</span></button>`).join("");
    $("#media").innerHTML = `<button type="button" data-medium="" aria-pressed="${!medium}">${esc(t("allMedia"))}</button>`
      + keys.map(k => `<button type="button" class="chip ${side[k]}" data-medium="${esc(k)}" aria-pressed="${medium === k}">${esc(k)} <span class="n">${counts[k]}</span></button>`).join("");
  }
  // a faint nuance-grey ground for the archive: one per area, a slightly different one per medium
  const TONE_ART = { installation: "inst", drawing: "vis", "mixed media object": "mmo", text: "text", fieldwork: "field" };
  const TONE_DESIGN = { apps: "apps", books: "books", graphics: "graphics", content: "content" };
  function toneKey() {
    if (area === "all") return "";
    if (!medium) return area;
    const map = area === "art" ? TONE_ART : TONE_DESIGN;
    for (const k in map) if ((area === "art" ? mediumLabel(k) : t("kind." + k)) === medium) return area + "-" + map[k];
    return area;
  }
  function renderSheet() {
    $("#archive").dataset.tone = toneKey();
    const sheet = $("#sheet");
    const list = listed.filter(w => (area === "all" || w.area === area) && (!medium || kinds(w).includes(medium)));
    // method does not filter: matching works are marked, the rest step back
    const hit = w => (w.method || []).includes(method);
    const mark = w => !method ? "" : hit(w) ? " hit" : " miss";
    const mlabel = w => (w.method || []).map(k => `<span class="mk${k === method ? " on" : ""}">${esc(T[lang]["method." + k] || k)}</span>`).join(", ");
    if (view === "list") {
      const chips = w => `<span class="chips">${kinds(w).map(k => `<span class="chip ${w.area}">${esc(k)}</span>`).join("")}</span>`;
      sheet.innerHTML = `<div class="listwrap"><div class="list-head" aria-hidden="true"><span>${esc(t("col.title"))}</span><span>${esc(t("col.medium"))}</span><span>${esc(t("col.venue"))}</span><span>${esc(t("col.year"))}</span></div>`
        + `<ol class="list">${list.map(w =>
        `<li class="${mark(w).trim()}"><button type="button" data-open="${w.id}"><span class="t">${esc(L(w.title))}</span>${chips(w)}<span class="v">${esc(venueOf(w))}</span><span class="y">${esc(w.year)}</span></button></li>`).join("")}</ol></div>`;
      return;
    }
    list.sort((a, b) => (!!cover(b)) - (!!cover(a)));
    sheet.innerHTML = justified(list, sheet.clientWidth, mark, w => method && hit(w) ? `<span class="mtag">${esc(T[lang]["method." + method] || method)}</span>` : "");
  }
  function justified(list, W, mark = () => "", tag = () => "", scale = 1) {
    const gap = W < 560 ? 8 : 12;
    const target = (W < 560 ? 150 : W < 1000 ? 210 : 300) * scale;
    const items = list.map(w => { const im = cover(w); return { w, im, r: im ? Math.min(2.2, Math.max(0.55, im.w / im.h)) : 1.4 }; });
    const rows = []; let row = [], sum = 0;
    for (const it of items) {
      row.push(it); sum += it.r;
      if (sum * target + gap * (row.length - 1) >= W || (W < 560 && row.length === 2)) { rows.push({ row, h: (W - gap * (row.length - 1)) / sum }); row = []; sum = 0; }
    }
    if (row.length) rows.push({ row, h: target });
    return rows.map(({ row, h }) => row.map(({ w, im, r }) =>
      `<button type="button" class="tile${im ? "" : " blank"}${mark(w)}" data-open="${w.id}" style="width:${Math.floor(r * h)}px;--fh:${Math.round(h)}px">
        <span class="frame" style="height:${Math.round(h)}px">${tag(w)}${im ? `<img src="${esc(h > 260 ? im.src : im.thumb)}" alt="" loading="lazy" decoding="async">` : esc(t("noImage"))}</span>${w.creditAlways && w.credit ? `<span class="credit" title="${esc(plain(w.credit))}"><span class="ct">${fmt(w.credit)}</span><span class="cm" aria-label="${esc(plain(w.credit))}">©</span></span>` : ""}
        <span class="cap"><span class="t">${esc(L(w.title))}</span></span>
        <span class="med">${esc(kinds(w).slice(0, 3).join(" · "))}</span>
      </button>`).join("")).join("");
  }
  $("#filters").addEventListener("click", e => { const b = e.target.closest("[data-area]"); if (b) { area = b.dataset.area; renderFilters(); renderSheet(); } });
  // sticky filter bar: sit just under the fixed header; mark when stuck
  const tools = $("#tools");
  const setTopH = () => {
    document.documentElement.style.setProperty("--top-h", $("#top").offsetHeight + "px");
    const b = tools.querySelector(".bar"); if (b) tools.style.setProperty("--tools-row", (b.offsetHeight + parseFloat(getComputedStyle(b).marginBottom || 0) + 6) + "px");
  };
  setTopH(); addEventListener("resize", setTopH);
  const stuckCheck = () => tools.classList.toggle("stuck", tools.getBoundingClientRect().top <= $("#top").offsetHeight + 1 && $("#sheet").getBoundingClientRect().bottom > 0);
  addEventListener("scroll", stuckCheck, { passive: true }); stuckCheck();
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY, small = matchMedia("(max-width: 720px)").matches;
    const intoWorks = $("#sheet").getBoundingClientRect().top < $("#top").offsetHeight;   // only once the works are under the bar
    if (!small || !tools.classList.contains("stuck") || !intoWorks) tools.classList.remove("compact");
    else if (false && y > lastY + 6) tools.classList.add("compact");   // slide-away switched off: the filter rows always stay
    else if (y < lastY - 6) tools.classList.remove("compact");
    if (Math.abs(y - lastY) > 6) lastY = y;
  }, { passive: true });
  // after a filter that changes the layout, bring the first works back under the bar
  const keepTop = () => { if (tools.classList.contains("stuck")) { const y = $("#sheet").getBoundingClientRect().top + scrollY - $("#top").offsetHeight - tools.offsetHeight - 22; window.scrollTo({ top: y, behavior: "auto" }); } };
  ["#filters", "#media"].forEach(id => $(id).addEventListener("click", () => requestAnimationFrame(keepTop)));
  document.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => requestAnimationFrame(keepTop)));
  $("#methods").addEventListener("click", e => { const b = e.target.closest("[data-method]"); if (b) { const k = b.dataset.method || null; method = k === method ? null : k; renderFilters(); renderSheet(); } });
  $("#media").addEventListener("click", e => { const b = e.target.closest("[data-medium]"); if (b) { medium = b.dataset.medium || null; renderFilters(); renderSheet(); } });
  document.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => { view = b.dataset.view; renderFilters(); renderSheet(); }));

  /* ---------- bookshelf: all shelves at once ---------- */
  function renderShelves() {
    $("#shelves").innerHTML = ["authored", "collaborative", "layout_design"].map(k => {
      const books = works.filter(w => w.book && w.book.category === k).sort((a, b) => a.book.order - b.book.order);
      if (!books.length) return "";
      return `<div class="shelfrow shelf-${k}"><h3>${esc(t("shelves")[k])}</h3><div class="books">${books.map(w => {
        const c = w.book.cover;
        return `<button type="button" class="book" data-book="${w.id}">${c ? `<img src="${esc(c.thumb)}" alt="" loading="lazy" width="${c.w}" height="${c.h}">` : ""}<span>${esc(L(w.title))}</span></button>`;
      }).join("")}</div></div>`;
    }).join("");
  }

  /* ---------- selected exhibitions (content/exhibitions.csv) ---------- */
  function renderExhib() {
    const ex = A.exhibitions || [];
    $("#exhib").hidden = !ex.length;
    $("#exlist").innerHTML = ex.map((e, i) => {
      const w = byId[e.id], title = L(e.title) || (w ? L(w.title) : "");
      const open = w && !w.indexOnly;
      const ex = L(e.exhibition) ? `<span class="ex">${lang === "ja" || e.type === "guest" ? "" : "in "}${esc(L(e.exhibition)).replace(/\*([^*]+)\*/g, '<span class="it">$1</span>')}</span>` : "";
      return `<li data-i="${i}"><span class="y">${esc(e.year)}</span><span class="tw">${open ? `<button type="button" class="t" data-open="${esc(e.id)}">${esc(title)}</button>` : `<span class="t">${esc(title)}</span>`}${ex}</span><span class="v"><span class="vn">${esc(L(e.venue))}${L(e.city) ? `<span class="vc">${lang === "ja" ? "、" : ", "}${esc(L(e.city))}</span>` : ""}</span></span><span class="c">${esc(L(e.city))}</span></li>`;
    }).join("");
    exPeek(null);
  }
  // beside the list: a photo of the venue (or just its name) for the exhibition you point at
  function exPeek(i) {
    const el = $("#expeek"), e = i == null ? null : (A.exhibitions || [])[i];
    document.querySelectorAll("#exlist li").forEach(li => li.classList.toggle("is-on", e && +li.dataset.i === +i));
    // only a photo of the venue, and only when there is one; otherwise the column stays empty
    el.innerHTML = e && e.venueImage ? `<img src="${esc(e.venueImage.thumb)}" alt="${esc(L(e.venue))}">` : "";
  }
  $("#exlist").addEventListener("pointerover", e => { const li = e.target.closest("li[data-i]"); if (li) exPeek(li.dataset.i); });
  $("#exlist").addEventListener("focusin", e => { const li = e.target.closest("li[data-i]"); if (li) exPeek(li.dataset.i); });

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
      html += `<div class="band band-art"><div class="trackhead" data-g="art"><b>${esc(TR.art[0])}</b>${TR.art[1] ? `<span>${esc(TR.art[1])}</span>` : ""}</div>`;
      html += A.rows.art.map(r => {
        const items = allWorks.filter(w => w.area === "art" && w.row === r.key).map(workItem);
        return items.length ? laneHTML(L(r), items, "art") : "";
      }).join("") + `</div>`;
    }
    if (shown.design) {
      html += `<div class="band band-design"><div class="trackhead" data-g="design"><b>${esc(TR.design[0])}</b><span>${studio(TR.design[1])}</span></div>`;
      html += A.rows.design.map(r => {
        const items = allWorks.filter(w => w.area === "design" && w.row === r.key).map(workItem);
        return items.length ? laneHTML(L(r), items, "design") : "";
      }).join("") + `</div>`;
    }
    if (shown.projects && A.projects.length) {
      html += `<div class="band band-projects"><div class="trackhead" data-g="projects"><b>${esc(TR.projects[0])}</b>${TR.projects[1] ? `<span>${studio(TR.projects[1])}</span>` : ""}${t("studio.note") ? `<span class="soon">${esc(t("studio.note"))}</span>` : ""}</div></div>`;
    }
    if (shown.floating && (A.floating || []).length) {
      html += `<div class="band band-floating"><div class="trackhead" data-g="floating"><b>${esc(TR.floating[0])}</b><span>${esc(TR.floating[1])}</span></div>`;
      // a stable pseudo-random scatter, so the dots keep their places between renders
      let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
      const dots = A.floating.map((f, i) => {
        const x = f.y0 ? xp(f.y0 + (Math.max(f.y0, f.y1 || f.y0) - f.y0 + 1) / 2) : 4 + rnd() * 92;
        const y = 14 + rnd() * 56, d = (rnd() * 6).toFixed(2), dur = (5 + rnd() * 4).toFixed(2);
        return `<button type="button" class="float${f.label ? " named" : ""}" data-mark="f:${i}" style="left:calc(${x}% - 4px);top:${y}px;animation-delay:-${d}s;animation-duration:${dur}s" aria-label="${esc(f.label ? L(f.label) : t("float." + f.kind))}"></button>`;
      }).join("");
      const grid = Array.from({ length: NY + 1 }, (_, i) => `<i style="left:${i / NY * 100}%"></i>`).join("");
      // public works placed by hand in the unplaced group (index_row = unplaced): a line like the others, at the bottom
      const placedHere = allWorks.filter(w => w.row === "unplaced").map(w => markHTML({ ...workItem(w), line: 4 }, w.area)).join("");
      html += `<div class="lane floating"><div class="lbl"></div><div class="marks" style="height:84px"><div class="grid-lines">${grid}</div>${dots}${placedHere}</div></div></div>`;
    }
    $("#chart").innerHTML = html;
    peek(selected);
    if (window.__markExhib) window.__markExhib();
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
    el.innerHTML = `${im ? `<img src="${esc(im.thumb)}" alt="">` : ""}${im && w.creditAlways && w.credit ? `<p class="s credit">${fmt(w.credit)}</p>` : ""}<p class="s">${esc(w.year)}</p><p class="t">${esc(L(w.title))}</p>${place(w) ? `<p class="s">${esc(place(w))}</p>` : ""}${w.indexOnly ? "" : `<button type="button" class="go" data-open="${w.id}">${esc(t("open"))}</button>`}`;
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
    if (key.startsWith("p:") || key.startsWith("f:") || (byId[key] && byId[key].indexOnly)) { peek(key); return; }
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
  let savedY = 0;
  function showOverlay(el) {
    if (!isOpen()) { lastFocus = document.activeElement; savedY = window.scrollY; }
    gallery.hidden = el !== gallery; reader.hidden = el !== reader;
    document.body.classList.add("locked");
    clearTimeout(timer);
  }
  function closeOverlay(fromHistory) {
    clearTimeout(gIdle); clearInterval(gAuto);
    document.querySelectorAll("#gFrame video").forEach(v => v.pause());
    document.querySelectorAll("#gFrame [data-drift]").forEach(el => drift(el, false));
    document.querySelectorAll("#gFrame [data-const]").forEach(el => constellation(el, false));
    if (!isOpen()) return;
    gallery.hidden = reader.hidden = true; current = null;
    document.body.classList.remove("locked");
    if (!fromHistory) history.pushState(null, "", location.pathname + location.search);
    window.scrollTo({ top: savedY, behavior: "auto" });
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
    const items = w.images.map(m => ({ ...m }));
    // a work shown in the opening as found objects side by side: the gallery opens on the same view, then each object
    // on its own page (only the pictures in that view)
    const hg = A.hero.find(h => h.id === id && h.grid && h.grid.some(c => c.label));
    if (hg) return [{ grid: hg, thumb: hg.grid[0].src, bg: hg.bg, lum: 0.9 }, ...hg.grid.map(c => items[c.i]).filter(Boolean)];
    // a work with a book: an opening (intro drawn from a source page, or floating excerpts), printed spreads
    // (books.csv gallery_spreads), photographs of the work in its space (gallery_skip_cover leaves the archive cover out),
    // and last the way into the book reader
    if (w.book && (w.book.pages || []).length > 1) {
      const c = w.book.cover || {}, firstPage = (w.excerpts || []).find(e => e.kind === "page");
      const film = w.book.paper === "transparent";
      const parts = {
        intro: w.intro ? [{ constellation: w.intro, thumb: c.thumb, bg: "#ECEBE7", lum: 0.92 }]
          : w.excerpts && w.excerpts.length ? [{ drift: w.excerpts, thumb: firstPage ? firstPage.src : (c.thumb), bg: "#ECEBE7", lum: 0.92 }] : [],
        spreads: (w.gallerySpreads || []).map(([l, r]) => ({ spread: [l, r], film: film ? filmStack(w.book.pages, l.n, r.n) : null, thumb: l.thumb, bg: film ? "#E4E4E1" : "#E6E6E4", lum: 0.9 })),
        photos: items.slice(w.book.skipCover ? 1 : 0),
        reader: [{ more: w.id, thumb: c.thumb, bg: "#ECEBE7", lum: 0.92 }],
      };
      // books.csv gallery_order (e.g. intro,photos,spreads,reader); otherwise the opening, spreads, photographs, reader
      const order = w.book.galleryOrder && w.book.galleryOrder.length ? w.book.galleryOrder : parts.intro.length ? ["intro", "spreads", "photos"] : ["photos", "spreads"];
      // the gallery loops through the work itself; the way into the book is in the info panel ("Read the book")
      return order.filter(k => k !== "reader").flatMap(k => parts[k] || []);
    }
    return items;
  }
  const guideHTML = (id, img) => `${img ? `<img src="${esc(img)}" alt="">` : ""}<p class="m-t">${esc(t("more.title"))}</p><p class="m-s">${esc(t("more.text"))}</p><button type="button" data-book="${id}">${esc(t("more.btn"))} →</button>`;
  const driftHTML = () => `<div class="g-drift" data-drift lang="ja"><div class="d-field"></div></div>`;
  const moreHTML = m => `<div class="g-more">${guideHTML(m.more, m.thumb)}</div>`;
  // an opening drawn from a source page: the words surface one by one where they belong, slowly and from a little way off,
  // faint dotted lines then join them, and the passage comes up quietly in the middle while the rest steps back
  // (intro json: `rise` = a slip that lifts to the middle first; left out = none)
  const constellationHTML = m => { const c = m.constellation;
    return `<div class="g-const" data-const><div class="c-box" style="--ar:${c.aspect}"><svg class="c-lines" aria-hidden="true"></svg>`
      + c.nodes.map((n, k) => `<span class="c-word ${n.kind}" data-k="${k}" style="left:${n.x * 100}%;top:${n.y * 100}%">${esc(n.text)}</span>`).join("")
      + `</div>${c.passage ? `<p class="c-passage">${esc(c.passage)}</p>` : ""}</div>`; };
  function constellation(el, on) {
    (el._timers || []).forEach(clearTimeout); el._timers = [];
    (el._anims || []).forEach(a => a.cancel()); el._anims = [];
    el.classList.remove("linked", "risen");
    const words = [...el.querySelectorAll(".c-word")], svg = el.querySelector(".c-lines");
    words.forEach(w => { w.classList.remove("c-rise"); w.style.transform = ""; w.style.opacity = ""; });
    svg.innerHTML = "";
    if (!on) return;
    const c = G.items[[...$("#gFrame").children].indexOf(el)].constellation;
    const rot = k => `rotate(${c.nodes[k].r}deg)`;
    const place = (k, x, y, sc, extra = "") => `translate(-50%, -50%) translate(${x}px, ${y}px) ${extra} scale(${sc})`;
    // each word drifts a short way into its place, out of a soft blur, in no particular order
    const order = words.map((_, k) => k).sort(() => Math.random() - .5);
    let settle = 0;
    order.forEach((k, j) => {
      const w = words[k], a = Math.random() * Math.PI * 2, d = 14 + Math.random() * 18;
      const dur = reduced ? 1 : 3200 + Math.random() * 1400, delay = reduced ? 0 : 300 + j * 260 + Math.random() * 300;
      settle = Math.max(settle, dur + delay);
      const frames = reduced ? [{ transform: place(k, 0, 0, 1, rot(k)), opacity: 1 }] : [
        { transform: place(k, Math.cos(a) * d, Math.sin(a) * d, .98, rot(k)), opacity: 0, filter: "blur(4px)" },
        { transform: place(k, 0, 0, 1, rot(k)), opacity: 1, filter: "blur(0px)" }];
      el._anims.push(w.animate(frames, { duration: dur, delay, easing: "cubic-bezier(.25, .1, .25, 1)", fill: "both" }));
    });
    const at = (ms, fn) => el._timers.push(setTimeout(fn, ms));
    // once everything has settled, faint dotted lines join the words, one after another
    at(settle + 600, () => {
      const box = el.querySelector(".c-box").getBoundingClientRect(), W = box.width, H = box.height;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.innerHTML = c.links.map(([a, b], k) => `<line x1="${c.nodes[a].x * W}" y1="${c.nodes[a].y * H}" x2="${c.nodes[b].x * W}" y2="${c.nodes[b].y * H}" style="transition-delay:${(reduced ? 0 : k * .14).toFixed(2)}s"/>`).join("");
      requestAnimationFrame(() => el.classList.add("linked"));
    });
    const T2 = settle + 600 + c.links.length * 140 + 2400;
    at(T2, () => {
      const w = c.rise != null ? words[c.rise] : null;
      if (w) { w.classList.add("c-rise"); const r = w.getBoundingClientRect(), b = el.getBoundingClientRect();
        el._anims.push(w.animate([{ transform: place(c.rise, 0, 0, 1, rot(c.rise)) },
          { transform: place(c.rise, b.left + b.width / 2 - (r.left + r.width / 2), b.top + b.height * .3 - (r.top + r.height / 2), 1.3, "rotate(0deg)") }],
          { duration: reduced ? 1 : 1500, easing: "cubic-bezier(.3, .1, .2, 1)", fill: "forwards" })); }
      if (c.passage || w) el.classList.add("risen");
    });
    at(T2 + (c.passage ? 9000 : 3000), () => { if (el.classList.contains("is-on")) setImg(G.i + 1); });
  }
  // a spread printed on matte paper: two pages side by side, always as a spread, on every screen
  const spreadHTML = m => { const [l, r] = m.spread, f = m.film;
    const under = list => (list || []).map((u, k) => `<img class="fl" data-src="${esc(u.src)}" alt="" style="--o:${[.34, .2, .11][k]};--b:${k * .35}px${u.flip ? ";transform:scaleX(-1)" : ""}">`).join("");
    return `<div class="g-spread${f ? " film" : ""}"><div class="sp" style="--pa:${(l.w / l.h).toFixed(3)}"><span class="pg l">${f ? under(f.left) : ""}<img data-src="${esc(l.src)}" alt=""></span><span class="pg r">${f ? under(f.right) : ""}<img data-src="${esc(r.src)}" alt=""></span></div></div>`; };
  // transparent film: under a right-hand page you see its own back (mirrored), the next sheet, that sheet's back (mirrored);
  // under a left-hand page the same going back through the book
  function filmStack(pages, ln, rn) {
    const at = n => pages.find(p => p.n === n);
    const pick = (ns) => ns.map((n, k) => at(n) && { src: at(n).src, flip: k % 2 === 0 }).filter(Boolean);
    return { left: pick([ln - 1, ln - 2, ln - 3]), right: pick([rn + 1, rn + 2, rn + 3]) };
  }
  // excerpts drift up across the whole screen and fade, a few at a time, in uneven places; then the way into the book
  function drift(el, on) {
    (el._timers || []).forEach(clearTimeout); el._timers = [];
    const field = el.querySelector(".d-field");
    el.classList.remove("done"); field.innerHTML = "";
    if (!on) return;
    const items = G.items[[...$("#gFrame").children].indexOf(el)].drift;
    if (reduced) return;
    const STEP = 820, LIFE = 6200, longLife = 11000;
    // a passage (several lines) stays together, stays longer and sits in the middle; the rest find free room around it
    const isLong = it => it.kind === "text" && it.text.length > 40;
    const live = [];   // boxes on screen: {x0, y0, x1, y1, until}
    const place = (d, long) => {
      const W = innerWidth, H = innerHeight, w = d.offsetWidth, h = d.offsetHeight, pad = 18, rise = 40;
      const L = Math.max(16, W * 0.03), R = W - (W > 760 ? 76 : 16), T = W > 760 ? 64 : 84, B = H - (W > 760 ? 64 : 70);
      const now = performance.now(); for (let i = live.length - 1; i >= 0; i--) if (live[i].until < now) live.splice(i, 1);
      const overlap = (x, y) => live.reduce((sum, o) => sum + Math.max(0, Math.min(x + w + pad, o.x1) - Math.max(x - pad, o.x0)) * Math.max(0, Math.min(y + h + pad + rise, o.y1) - Math.max(y - pad - rise, o.y0)), 0);
      let best = null;
      for (let k = 0; k < (long ? 1 : 24); k++) {
        const x = long ? (W - w) / 2 : L + Math.random() * Math.max(0, R - L - w);
        const y = long ? (H - h) / 2 : T + Math.random() * Math.max(0, B - T - h);
        const o = overlap(x, y); if (!best || o < best.o) best = { x, y, o }; if (!o) break;
      }
      d.style.left = best.x + "px"; d.style.top = best.y + "px";
      live.push({ x0: best.x, y0: best.y - rise, x1: best.x + w, y1: best.y + h + rise, until: now + (long ? longLife : LIFE) });
    };
    let at = 300, last = 0;
    items.forEach(it => { const long = isLong(it), when = at; at += long ? 2600 : STEP; last = when + (long ? longLife : LIFE); el._timers.push(setTimeout(() => {
      const d = document.createElement("div");
      d.className = "d-item d-" + it.kind + (long ? " d-passage" : "");
      d.style.setProperty("--rise", (16 + Math.random() * 22) + "px");
      if (long) d.style.animationDuration = longLife + "ms";
      d.innerHTML = it.kind === "page" ? `<img src="${esc(it.src)}" alt="" width="${it.w}" height="${it.h}">`
        : it.kind === "chapter" ? `<small>${esc(it.label)}</small><span>${esc(it.text)}</span>` : esc(it.text);
      d.style.visibility = "hidden"; field.appendChild(d); place(d, long); d.style.visibility = "";
      setTimeout(() => d.remove(), (long ? longLife : LIFE) + 100);
    }, when)); });
    // when the last excerpt has faded, move on to the photographs
    el._timers.push(setTimeout(() => { if (el.classList.contains("is-on")) setImg(G.i + 1); }, last - 600));
  }
  function loadNear() {
    [...$("#gFrame").children].forEach((el, k) => {
      if (!(Math.abs(k - G.i) <= 1 || (G.i === 0 && k === G.items.length - 1))) return;
      (el.dataset.src ? [el] : [...el.querySelectorAll("img[data-src]")]).forEach(im => { if (!im.getAttribute("src")) im.src = im.dataset.src; });
    });
  }
  function setImg(i) {
    if (!G.items.length) return;
    G.i = (i + G.items.length) % G.items.length;
    loadNear();
    [...$("#gFrame").children].forEach((im, k) => {
      im.classList.toggle("is-on", k === G.i);
      const og = im.classList.contains("g-objs") && im.firstElementChild;   // the objects slide in each time the page comes up
      if (og) { og.classList.remove("play"); if (k === G.i) { fillGrid(og, G.items[k].grid); void og.offsetWidth; og.classList.add("play"); } }
      if (im.tagName === "VIDEO") { if (k === G.i) { const p = im.play(); if (p && p.catch) p.catch(() => {}); } else im.pause(); }
      if (im.matches("[data-drift]")) drift(im, k === G.i);
      if (im.matches("[data-const]")) constellation(im, k === G.i);
    });
    $("#gStage").classList.toggle("is-still", !!(G.items[G.i].drift || G.items[G.i].constellation || G.items[G.i].more || G.items[G.i].grid));   // the excerpts and the card take their own clicks
    loadNear();
    const n = G.items.length, it = G.items[G.i];
    $("#gCount").textContent = `${G.i + 1} / ${n}`;
    // the last picture: a few seconds later the Back button glows gently, so the way back is clear
    clearTimeout(window.__nudgeT); $("#gHome").classList.remove("nudge");
    if (n > 1 && G.i === n - 1) window.__nudgeT = setTimeout(() => { if (!gallery.hidden) { void $("#gHome").offsetWidth; $("#gHome").classList.add("nudge"); } }, 3500);
    paint(gallery, it.bg, it.lum);
    if (it.open) { $("#gYear").textContent = it.label; }
    const c = it.cap || {}, words = [c[lang] || c.en, c.credit].filter(Boolean);
    $("#gNote").innerHTML = words.map(fmt).join(" — ");
    $("#gNote").hidden = !words.length || !!it.label;   // an object with a museum label: the label says it all
    showLabel($("#gLabel"), it.label);
    gallery.classList.toggle("with-label", !!it.label);   // the photo moves left, the label reads as a column beside it
    document.querySelectorAll("#gGrid button, #iThumbs button").forEach(b => b.setAttribute("aria-current", String(+b.dataset.img === G.i)));
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
      $("#iFacts").innerHTML = ""; $("#iTags").innerHTML = ""; $("#iRel").hidden = true;
      return;
    }
    const w = byId[id];
    $("#iTitle").textContent = L(w.title);
    $("#iSub").textContent = [w.year, place(w)].filter(Boolean).join(", ");
    $("#iTags").innerHTML = kinds(w).map(k => `<li>${esc(k)}</li>`).join("");
    const text = L(w.long) || L(w.desc);
    const pdf = w.pdfs.map(p => `<a href="${esc(pdfView(p.href, L(w.title)))}" target="_blank" rel="noopener">${esc(p.lang === "ja" ? t("readJa") : t("read"))}</a>`).join("　");
    const book = w.book && w.book.pages && w.book.pages.length > 1 ? `<p class="lnk"><button type="button" data-book="${w.id}">${esc(t("read.book"))}</button></p>` : "";
    const q = L(w.question);
    // series links are switched off for now; related works take their place below
    $("#iBody").innerHTML = (q ? `<p class="q">${esc(q)}</p>` : "") + text.split(/\n+/).filter(Boolean).map(p => `<p>${fmt(p)}</p>`).join("")
      + book + (pdf ? `<p class="pdf">${pdf}</p>` : "");
    $("#iFacts").innerHTML = [["venue", place(w) ? w.venue : ""], ["material", w.material ? L(w.material) : ""], ["print", w.book && w.book.print ? L(w.book.print) : ""], ["role", w.role], ["commissioner", w.commissioner], ["organizations", w.organizations], ["publisher", w.publisher], ["collaborators", w.collaborators],
      ["funding", w.funding], ["award", w.award], ["credit", w.credit], ["photo", w.photoCredit]]
      .filter(f => f[1]).map(([k, v]) => `<div><dt>${esc(F[k])}</dt><dd>${fmt(v)}</dd></div>`).join("");
    const rel = related(w);
    $("#iRel").hidden = !rel.length;
    $("#iRelList").innerHTML = rel.map(r => { const im = cover(r);
      return `<li><button type="button" data-open="${r.id}">${im ? `<img src="${esc(im.thumb || im.src)}" alt="" loading="lazy">` : `<span class="ph"></span>`}<span class="t">${esc(L(r.title))}</span><span class="y">${esc(r.year)}</span></button></li>`; }).join("");
  }
  // related works: set by hand in projects.csv (related_projects), otherwise the closest by family, series, theme and year
  function related(w) {
    const pick = (w.related || []).map(id => byId[id]).filter(r => r && !r.indexOnly && r.id !== w.id);
    return pick.slice(0, 4);   // only the ones set by hand (projects.csv related_projects); none set = no "Related"
    const ser = seriesOf(w.id);
    const score = r => (r.parent === w.id || w.parent === r.id || (w.parent && r.parent === w.parent) ? 6 : 0)
      + (ser && ser.children.includes(r.id) ? 3 : 0)
      + 2 * (r.themes || []).filter(x => (w.themes || []).includes(x)).length
      + (r.pillars || []).filter(x => (w.pillars || []).includes(x)).length
      + (r.area === w.area ? 0.5 : 0);
    return listed.filter(r => r.id !== w.id).map(r => ({ r, s: score(r) })).filter(x => x.s >= 2)
      .sort((a, b) => b.s - a.s || Math.abs(a.r.y0 - w.y0) - Math.abs(b.r.y0 - w.y0)).slice(0, 4).map(x => x.r);
  }
  // tiny contact strip of the gallery inside the info panel
  function fillThumbs() {
    $("#iThumbs").innerHTML = G.items.length > 1 ? G.items.map((m, k) => `<button type="button" data-img="${k}" aria-label="${m.more ? esc(t("more.title")) : k + 1}" aria-current="${k === G.i}"${m.more ? ' class="i-read"' : ""}><img src="${esc(m.thumb || m.src)}" alt="" loading="lazy"></button>`).join("") : "";
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
      ? G.items.map((m, k) => m.grid ? `<div class="g-objs">${gridHTML(m.grid, true)}</div>` : m.constellation ? constellationHTML(m) : m.drift ? driftHTML(m) : m.spread ? spreadHTML(m) : m.more ? moreHTML(m) : m.video
        // videos play by themselves, silent and looping, without player controls
        ? `<video data-src="${esc(m.video)}" poster="${esc(m.src)}" muted loop playsinline autoplay disablepictureinpicture preload="none" style="--nw:${m.w}px;--nh:${m.h}px"></video>`
        : `<img data-src="${esc(m.src)}" alt="${esc(title)}, ${k + 1}" decoding="async" style="--nw:${m.w}px;--nh:${m.h}px">`).join("")
      : `<p style="position:absolute;inset:0;display:grid;place-items:center;color:var(--quiet)">${esc(t("noImage"))}</p>`;
    $("#gGrid").innerHTML = G.items.map((m, k) => `<button type="button" data-img="${k}"${m.more ? ' class="g-read"' : ""}><img src="${esc(m.thumb || m.src)}" alt="" loading="lazy">${m.more ? `<span>${esc(t("more.title"))} →</span>` : ""}</button>`).join("");
    fillInfo(kind, id); fillThumbs();
    $("#gSoon").hidden = !(kind === "work" && G.items.length === 1);   // one picture so far: "Gallery photos in preparation"
    galleryActivity();
    if (!same) { toggleGrid(false); toggleInfo(false); }
    showOverlay(gallery);
    setImg(G.i);
    if (!same) { $("#gHome").focus({ preventScroll: true }); window.__tour && window.__tour.gallery(); }
  }
  $("#gPrevImg").addEventListener("click", () => setImg(G.i - 1));
  $("#gNextImg").addEventListener("click", () => setImg(G.i + 1));
  $("#gLeft").addEventListener("click", () => setImg(G.i - 1));
  $("#gRight").addEventListener("click", () => setImg(G.i + 1));
  $("#gHome").addEventListener("click", () => closeOverlay());   // Back: closes and returns to the same place in the list
  $("#gGrid").addEventListener("click", e => { const b = e.target.closest("[data-img]"); if (b) { setImg(+b.dataset.img); toggleGrid(false); } });
  $("#gInfoBtn").addEventListener("click", () => toggleInfo());
  $("#gGridBtn").addEventListener("click", () => toggleGrid());
  $("#gClose").addEventListener("click", () => closeOverlay());
  $("#iThumbs").addEventListener("click", e => { const b = e.target.closest("[data-img]"); if (b) { setImg(+b.dataset.img); toggleInfo(false); } });
  // pointing at a thumbnail shows that picture in the viewer
  $("#iThumbs").addEventListener("pointerover", e => { const b = e.target.closest("[data-img]"); if (b && e.pointerType === "mouse" && +b.dataset.img !== G.i) setImg(+b.dataset.img); });
  $("#iBack").addEventListener("click", () => closeOverlay());
  // a click outside the open info panel closes it and leaves you on the picture
  gallery.addEventListener("click", e => {
    if ($("#gInfo").hidden || e.target.closest(".g-info, .rail, .s-steps")) return;
    e.preventDefault(); e.stopPropagation(); toggleInfo(false);
  }, true);
  swipe($("#gStage"), d => setImg(G.i + d));
  // a click on the floating excerpts skips ahead to the photographs
  $("#gFrame").addEventListener("click", e => {
    // the objects page: a click opens that object's own page
    const hc = e.target.closest(".hg-cell"); if (hc) { e.stopPropagation(); return setImg(1 + +hc.dataset.k); } if (e.target.closest("[data-drift], [data-const]")) setImg(G.i + 1); });

  // left alone for a while, the gallery turns slowly by itself (any touch, click or key stops it and starts the wait again)
  let gIdle = null, gAuto = null;
  function galleryActivity() {
    clearTimeout(gIdle); clearInterval(gAuto); gAuto = null; gallery.classList.remove("auto");
    if (gallery.hidden || reduced || G.items.length < 2) return;
    gIdle = setTimeout(() => {
      gAuto = setInterval(() => {
        if (gallery.hidden || !$("#gInfo").hidden || !$("#gGrid").hidden) return;
        const it = G.items[G.i]; if (it.constellation || it.drift) return;   // the openings move on by themselves
        gallery.classList.add("auto"); setImg(G.i + 1);
      }, 6500);
    }, 8000);
  }
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach(ev => gallery.addEventListener(ev, galleryActivity, { passive: true }));
  function swipe(el, fn) {
    let x0 = null, y0 = null;
    el.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener("touchend", e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) fn(dx < 0 ? 1 : -1);
    });
  }

  // PDFs open in the site's own viewer: cover alone, then spreads, the same in every browser
  const pdfView = (href, title) => `pdf.html?file=${encodeURIComponent(href)}&t=${encodeURIComponent(title || "")}`;

  /* book reader */
  const R = { id: null, pages: [], views: [], v: 0, two: true, busy: false, aspect: 0.7 };
  function bookPages(w) {
    const b = w.book, out = [];
    const useCover = b.cover && !b.coverFirst;     // coverFirst: the first page of the PDF is the cover
    // the cover: a drawn cloth binding (cover_style = cloth), otherwise the cover photo itself
    if (b.coverStyle === "cloth") out.push({ cloth: b.endpaper || "#4a4a48", cover: true, title: w.title });   // drawn cloth binding
    else if (useCover) out.push({ src: b.cover.src, cover: true });   // the cover as photographed
    // a cloth-bound archive book: the inside of the cover (cloth turned over the edges, paper pasted down) faces page 1
    // a photograph of the open book across the first spread (books.csv first_spread)
    if (b.firstSpread) { const ph = { src: b.firstSpread.src, photo: b.firstSpread.w / b.firstSpread.h }; if (R.two) out.push({ ...ph, half: "left" }, { ...ph, half: "right" }); else out.push(ph); }
    if ((useCover || b.coverStyle === "cloth") && b.endpaper) out.push({ endpaper: b.endpaper });
    for (const p of b.pages || []) {
      if (useCover && (p.src === b.cover.src || p.src === b.cover.cut)) continue;
      if (p.spread && R.two) { out.push({ src: p.src, half: "left", n: p.n, z: p.z }, { src: p.src, half: "right", n: p.n, z: p.z }); }
      else out.push({ src: p.src, n: p.n, z: p.z, cover: !out.length && b.coverFirst });
    }
    return out;
  }
  // position bar: where you are in the book, with a dot per chapter
  const viewOf = k => R.two ? Math.ceil(k / 2) : k;
  function buildScrub(w) {
    const n = R.views.length, sc = $("#rScrub");
    sc.hidden = n < 4;
    if (sc.hidden) return;
    $("#rRange").max = n - 1;
    const pos = v => (n > 1 ? v / (n - 1) * 100 : 0);
    $("#rMarks").innerHTML = (w.book.chapters || []).map(c => {
      const k = R.pages.findIndex(p => p.n === c.page); if (k < 0) return "";
      const v = viewOf(k);
      return `<button type="button" class="r-dot" data-v="${v}" style="left:${pos(v)}%" aria-label="${esc(L(c))}" data-label="${esc(L(c))}"></button>`;
    }).join("");
  }
  function scrubUI() {
    const n = R.views.length; if ($("#rScrub").hidden) return;
    $("#rRange").value = R.v;
    $("#rFill").style.width = (n > 1 ? R.v / (n - 1) * 100 : 0) + "%";
    const dots = [...document.querySelectorAll("#rMarks .r-dot")];
    dots.forEach(d => d.classList.toggle("past", +d.dataset.v <= R.v));
  }
  function jumpTo(v) {
    v = Math.max(0, Math.min(R.views.length - 1, v));
    if (v === R.v || R.busy) return;
    if (Math.abs(v - R.v) === 1) return turn(v - R.v);
    R.v = v; drawView(v);
  }
  const tip = (el, text) => {
    const t2 = $("#rTip");
    if (!el) { t2.hidden = true; return; }
    t2.textContent = text; t2.hidden = false;
    const sc = $("#rScrub").getBoundingClientRect(), r = el.getBoundingClientRect();
    t2.style.left = Math.max(0, Math.min(sc.width, r.left + r.width / 2 - sc.left)) + "px";
  };
  $("#rMarks").addEventListener("click", e => { const d = e.target.closest(".r-dot"); if (d) jumpTo(+d.dataset.v); });
  $("#rMarks").addEventListener("pointerover", e => { const d = e.target.closest(".r-dot"); if (d) tip(d, d.dataset.label); });
  $("#rMarks").addEventListener("pointerout", e => { if (e.target.closest(".r-dot")) tip(null); });
  $("#rRange").addEventListener("input", e => {
    const v = +e.target.value, n = R.views.length;
    $("#rFill").style.width = (n > 1 ? v / (n - 1) * 100 : 0) + "%";
    // name the chapter the handle is in
    const ch = [...document.querySelectorAll("#rMarks .r-dot")].filter(d => +d.dataset.v <= v).pop();
    const fake = { getBoundingClientRect: () => { const r = e.target.getBoundingClientRect(); const x = r.left + r.width * (n > 1 ? v / (n - 1) : 0); return { left: x, width: 0 }; } };
    tip(fake, (ch ? ch.dataset.label + " · " : "") + (v === 0 ? t("cover") : (R.two ? `${2 * v}` : `${v + 1}`)));
  });
  $("#rRange").addEventListener("change", e => { tip(null); jumpTo(+e.target.value); });
  // mouse wheel / trackpad turns pages too
  let wheelAcc = 0, wheelLock = 0;
  $("#reader").addEventListener("wheel", e => {
    if (e.target.closest(".rail")) return;
    e.preventDefault();
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    wheelAcc += d;
    const now = Date.now();
    if (now < wheelLock || R.busy) return;
    if (Math.abs(wheelAcc) > 40) { turn(wheelAcc > 0 ? 1 : -1); wheelAcc = 0; wheelLock = now + 520; }
  }, { passive: false });
  function pageAspect(w) {
    const p = (w.book.pages || []).find(x => !x.cover && x.src !== (w.book.cover || {}).src) || w.book.cover;
    if (!p) return 0.72;
    const a = p.spread && R.two ? (p.w / 2) / p.h : p.w / p.h;
    return Math.min(1.4, Math.max(0.55, a));
  }
  // books printed on transparent film: the next pages show through, fainter with each sheet
  function filmUnder(p, side) {
    const w = byId[R.id]; if (!p || !w || w.book.paper !== "transparent" || p.half || p.photo || p.cover || p.endpaper || p.cloth) return "";
    const k = R.pages.indexOf(p), d = side === "left" ? -1 : 1;
    return [1, 2, 3].map(j => R.pages[k + d * j]).map((u, j) => u && u.src && !u.cover ? `<img class="fl" src="${esc(u.src)}" alt="" style="--o:${[.34, .2, .11][j]};--b:${j * .35}px${j % 2 === 0 ? ";transform:scaleX(-1)" : ""}">` : "").join("");
  }
  function pageHTML(p, side) {
    if (!p) return "";
    if (p.endpaper) return `<div class="endp" style="--cloth:${esc(p.endpaper)}"></div>`;
    if (p.cloth) return `<div class="cloth-cover" style="--cloth:${esc(p.cloth)}"><div class="cc-title"><span class="ja" lang="ja">${esc(p.title.ja || p.title.en)}</span>${p.title.en && p.title.en !== p.title.ja ? `<span class="en">${esc(p.title.en)}</span>` : ""}</div><span class="cc-name">Natsumi Sugiyama</span></div>`;
    if (side) return filmUnder(p, side) + pageHTML(p);
    if (p.photo)   // the photograph sits whole across both pages (or whole on a single page), nothing cut off
      return `<div class="photo"><span style="background-image:url('${esc(p.src)}')${p.half === "right" ? ";left:-100%" : ""}${p.half ? ";width:200%" : ""}"></span></div>`;
    if (p.half) {   // one half of a spread, kept in its own proportions (never stretched to the page box)
      const a = p.w && p.h ? (p.w / 2) / p.h : R.aspect;
      const bw = a >= R.aspect ? 200 : 200 * a / R.aspect, bh = a >= R.aspect ? 100 * R.aspect / a : 100;
      // percentage positions refer to (box − picture): place the spread's middle on the gutter
      const k = bw / 100, d = Math.abs(1 - k) < 0.001 ? 0.001 : 1 - k;
      const px = p.half === "left" ? (1 - k / 2) / d * 100 : (-k / 2) / d * 100;
      return `<div class="half" style="background-image:url('${esc(p.src)}');background-size:${bw.toFixed(2)}% ${bh.toFixed(2)}%;background-position:${px.toFixed(2)}% 50%"></div>`;
    }
    return `<img src="${esc(p.src)}" alt="" decoding="async"${p.object ? ' class="obj"' : ""}>`;
  }
  // every book has the magnifier: its larger copy where there is one, otherwise the page itself (already 1300–2800 px)
  const zSrc = p => p && !p.cover && !p.photo && !p.endpaper && !p.cloth ? (p.z || p.src || "") : "";
  const zAttr = p => zSrc(p) ? ` data-z="${esc(zSrc(p))}"${p.half ? ` data-half="${p.half}"` : ""}` : "";
  // magnifier: a round lens that shows a larger copy of the page under the pointer (no download, no copy)
  const lens = document.createElement("div"); lens.className = "r-lens"; lens.setAttribute("aria-hidden", "true"); reader.appendChild(lens);
  const ZK = 2.0;   // magnification; the lens is wide enough to hold a whole line of a text block (about 4/5 of the page)
  // on touch screens the magnifier becomes free zoom: pinch to zoom, one finger to move; pages turn only with the arrows
  const coarse = matchMedia("(pointer: coarse)");
  const PZ = { s: 1, x: 0, y: 0 };
  const touchZoom = () => R.zoom && coarse.matches;
  function applyPZ() {
    const b = $("#rBook"), base = soloView(R.v) ? "" : bookShift(R.v);
    b.style.transform = (base === "none" ? "" : base) + (PZ.s > 1 ? ` translate(${PZ.x}px, ${PZ.y}px) scale(${PZ.s})` : "");
  }
  function resetPZ() { PZ.s = 1; PZ.x = PZ.y = 0; if (R.id) applyPZ(); }
  function sharpPages(on) {   // the larger copies while zoomed in
    document.querySelectorAll("#rBook .r-page[data-z]").forEach(pg => {
      const im = pg.querySelector("img:not(.fl)"), hf = pg.querySelector(".half");
      if (im) { if (!im.dataset.lo) im.dataset.lo = im.src; im.src = on ? pg.dataset.z : im.dataset.lo; }
      if (hf) { if (!hf.dataset.lo) hf.dataset.lo = hf.style.backgroundImage; hf.style.backgroundImage = on ? `url('${pg.dataset.z}')` : hf.dataset.lo; }
    });
  }
  {
    const st = $("#rStage"); let g = null;
    const pts = e => [...e.touches].map(t => [t.clientX, t.clientY]);
    st.addEventListener("touchstart", e => {
      if (!touchZoom()) return;
      const p = pts(e);
      g = p.length > 1 ? { d: Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]), s: PZ.s, x: PZ.x, y: PZ.y, mx: (p[0][0] + p[1][0]) / 2, my: (p[0][1] + p[1][1]) / 2 }
        : { px: p[0][0], py: p[0][1], x: PZ.x, y: PZ.y };
    }, { passive: true });
    st.addEventListener("touchmove", e => {
      if (!touchZoom() || !g) return;
      e.preventDefault();
      const p = pts(e);
      if (p.length > 1 && g.d) {
        const d = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]);
        PZ.s = Math.max(1, Math.min(5, g.s * d / g.d));
        PZ.x = g.x + ((p[0][0] + p[1][0]) / 2 - g.mx); PZ.y = g.y + ((p[0][1] + p[1][1]) / 2 - g.my);
      } else if (p.length === 1 && g.px != null && PZ.s > 1) {
        PZ.x = g.x + (p[0][0] - g.px); PZ.y = g.y + (p[0][1] - g.py);
      }
      if (PZ.s <= 1) { PZ.x = PZ.y = 0; }
      applyPZ();
    }, { passive: false });
    st.addEventListener("touchend", e => { if (!e.touches.length) g = null; else g = null; }, { passive: true });
  }
  function setZoom(on) {
    R.zoom = on; reader.classList.toggle("is-zoom", on); $("#rZoom").setAttribute("aria-pressed", String(on));
    reader.classList.toggle("is-pinch", on && coarse.matches);
    resetPZ(); if (coarse.matches) sharpPages(on);
    if (!on) lens.style.display = "none";
    else document.querySelectorAll("#rBook [data-z]").forEach(el => zNat(el.dataset.z));
  }
  // natural sizes of the magnified pictures (read once, then remembered)
  const zNatMap = {};
  const zNat = url => { if (zNatMap[url]) return zNatMap[url].w ? zNatMap[url] : null;
    const im = new Image(); zNatMap[url] = {}; im.onload = () => { zNatMap[url] = { w: im.naturalWidth, h: im.naturalHeight }; }; im.src = url; return null; };
  function moveLens(e) {
    if (!R.zoom || coarse.matches) return;   // touch screens zoom freely instead
    const pg = [...document.querySelectorAll("#rBook .r-page[data-z]")].find(el => { const r = el.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; });
    if (!pg) { lens.style.display = "none"; return; }
    const r = pg.getBoundingClientRect(), half = pg.dataset.half, url = pg.dataset.z;
    // the lens: about two thirds of its former width, the same height
    const LW0 = Math.min(innerWidth * 0.94, Math.max(260, r.width * 0.8 * ZK));
    const LW = Math.round(Math.max(200, LW0 * 0.67)), LH = Math.round(Math.min(innerHeight * 0.32, Math.max(150, LW0 * 0.36)));
    lens.style.width = LW + "px"; lens.style.height = LH + "px";
    // where the picture actually sits inside the page (contained, never stretched), from its own proportions
    const nat = zNat(url);
    const A = nat ? (half ? nat.w / 2 : nat.w) / nat.h : r.width / r.height;
    let cw = r.width, ch = r.width / A;
    if (ch > r.height) { ch = r.height; cw = r.height * A; }
    const ox = (r.width - cw) / 2, oy = (r.height - ch) / 2;
    const x = e.clientX - r.left - ox + (half === "right" ? cw : 0), y = e.clientY - r.top - oy;
    const bw = cw * (half ? 2 : 1) * ZK, bh = ch * ZK;   // same proportions as the picture, at any screen width
    lens.style.display = "block";
    lens.style.backgroundImage = `url("${url}")`;
    lens.style.backgroundSize = `${bw}px ${bh}px`;
    lens.style.backgroundPosition = `${LW / 2 - x * ZK}px ${LH / 2 - y * ZK}px`;
    const lift = e.pointerType === "touch" ? LH * 0.9 : 0;            // keep the lens clear of the finger
    const lx = Math.max(4, Math.min(innerWidth - LW - 4, e.clientX - LW / 2));   // stays on screen near the edges
    lens.style.left = lx + "px"; lens.style.top = (e.clientY - LH / 2 - lift) + "px";
  }
  $("#rBook").addEventListener("pointermove", moveLens);
  $("#rBook").addEventListener("pointerdown", moveLens);
  $("#rBook").addEventListener("pointerleave", () => { lens.style.display = "none"; });
  $("#rZoom").addEventListener("click", () => setZoom(!R.zoom));
  function buildViews() {
    const P = R.pages; R.views = [];
    if (R.two) {
      R.views.push([null, P[0] || null]);
      for (let k = 1; k < P.length; k += 2) R.views.push([P[k] || null, P[k + 1] || null]);
    } else P.forEach(p => R.views.push([p]));
  }
  // phones: a page shown alone (the cover, the last page) uses the full width instead of half a spread
  const soloView = () => false;   // always a spread, on every screen: a lone page is never shown by itself
  function sizeBook(solo = soloView(R.v)) {
    const st = $("#rStage"), W = st.clientWidth - 2 * Math.max(16, st.clientWidth * 0.04), H = st.clientHeight - 24;
    let ph, pw;
    if (R.two && !solo) { ph = Math.min(H, W / (2 * R.aspect)); pw = ph * R.aspect; $("#rBook").style.width = 2 * pw + "px"; }
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
    const book = $("#rBook"), view = R.views[v], solo = soloView(v);
    book.classList.toggle("r-single", !R.two || solo);
    sizeBook(solo);
    if (solo) {
      const p = view[0] || view[1];
      book.innerHTML = `<div class="r-page right${p && p.cover ? " cover" : ""}"${zAttr(p)}>${pageHTML(p, "right")}</div>`;
    } else if (R.two) {
      const [l, r] = view;
      book.innerHTML = `<div class="r-page left${l ? "" : " empty"}"${zAttr(l)}>${pageHTML(l, "left")}</div>`
        + `<div class="r-page right${r ? "" : " empty"}${r && r.cover ? " cover" : ""}"${zAttr(r)}>${pageHTML(r, "right")}</div>`;
    } else {
      const [p] = view;
      book.innerHTML = `<div class="r-page right${p && p.cover ? " cover" : ""}"${zAttr(p)}>${pageHTML(p, "right")}</div>`;
    }
    book.insertAdjacentHTML("beforeend", `<button type="button" class="r-hit prev" aria-label="${esc(t("prev"))}"></button><button type="button" class="r-hit next" aria-label="${esc(t("next"))}"></button>`);
    book.style.transform = solo ? "none" : bookShift(v);
    readerUI(); scrubUI();
    if (touchZoom()) { sharpPages(true); applyPZ(); }
    // the last pages: a few seconds later the Back button glows gently
    clearTimeout(window.__rNudgeT); $("#rHome").classList.remove("nudge");
    if (R.views.length > 1 && v === R.views.length - 1) window.__rNudgeT = setTimeout(() => { if (!reader.hidden) { void $("#rHome").offsetWidth; $("#rHome").classList.add("nudge"); } }, 3500);
    document.querySelectorAll("#rThumbs button").forEach(b => b.setAttribute("aria-current", String(+b.dataset.v === v)));
    preload(v + 1); preload(v + 2);
  }
  // small pages in the info panel: one per view; pointing at one opens the book there
  function fillRThumbs() {
    $("#rThumbs").innerHTML = R.views.length > 1 ? R.views.map((pp, v) => {
      const srcs = [...new Set(pp.filter(p => p && p.src).map(p => p.src))];
      return `<button type="button" data-v="${v}" aria-label="${esc(v === 0 ? t("cover") : String(v))}" aria-current="${v === R.v}">${srcs.map(s => `<img src="${esc(s)}" alt="" loading="lazy">`).join("") || '<span class="ph"></span>'}</button>`;
    }).join("") : "";
  }
  const showView = v => { if (R.busy || v === R.v) return; R.v = v; drawView(v); };
  $("#rThumbs").addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (b) { showView(+b.dataset.v); toggleRInfo(false); } });
  $("#rThumbs").addEventListener("pointerover", e => { const b = e.target.closest("[data-v]"); if (b && e.pointerType === "mouse") showView(+b.dataset.v); });
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
    if (PZ.s > 1) resetPZ();
    if (R.busy || to < 0 || to >= R.views.length) return;
    const book = $("#rBook");
    if (reduced || soloView(R.v) || soloView(to)) { R.v = to; drawView(to); return; }   // a solo page on a phone: no flip, just switch
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
    R.two = true;   // spreads on every screen, phones too (the magnifier helps reading small pages)
    R.id = id; R.pages = bookPages(w); R.aspect = pageAspect(w);
    R.v = 0; R.busy = false;
    $("#rTitle").textContent = L(w.title);
    $("#rYear").textContent = w.year;
    // protected books (artwork photos under copyright): no saving or dragging the pages, a short notice
    reader.classList.toggle("is-protected", !!w.book.protect);
    reader.classList.toggle("is-film", w.book.paper === "transparent");
    $("#rZoom").hidden = !(w.book.pages || []).some(p => p.z || p.src); setZoom(false);
    $("#rNote").hidden = !w.book.protect;
    const pdf = w.pdfs[0];
    $("#rPdf").hidden = !pdf; if (pdf) $("#rPdf").href = pdfView(pdf.href, L(w.title));
    const c = w.book.cover || {};
    paint(reader, w.book.paper === "transparent" ? "#E2E2DF" : c.bg ? `color-mix(in srgb, ${c.bg} 70%, #e9e9e6)` : "#ECECEA", w.book.paper === "transparent" ? 0.88 : c.lum);
    fillRInfo(w); toggleRInfo(false);
    showOverlay(reader);
    buildViews(); fillRThumbs(); buildScrub(w); sizeBook(); drawView(0);
    $("#rSoon").hidden = R.pages.length > 1;   // only the cover (or one page) so far: "Pages in preparation"
    $("#rHome").focus({ preventScroll: true });
    window.__tour && window.__tour.reader();
  }
  // every book and every gallery picture: no saving or dragging the pictures (an archive to look at, not to take away)
  ["contextmenu", "dragstart"].forEach(ev => {
    reader.addEventListener(ev, e => { if (e.target.closest(".r-book, .r-lens")) e.preventDefault(); });
    gallery.addEventListener(ev, e => { if (e.target.closest(".g-frame")) e.preventDefault(); });
  });
  $("#rBook").addEventListener("click", e => {
    if (e.target.closest(".r-hit.prev")) turn(-1);
    else if (e.target.closest(".r-hit.next")) turn(1);
  });
  $("#rLeft").addEventListener("click", () => turn(-1));
  $("#rRight").addEventListener("click", () => turn(1));
  $("#rClose").addEventListener("click", () => closeOverlay());
  // the book's own information, inside the reader: a booklet stays a booklet and does not jump to the work's page
  function toggleRInfo(on) {
    const open = on ?? $("#rInfo").hidden;
    $("#rInfo").hidden = !open; $("#rWork").setAttribute("aria-pressed", String(open));
  }
  function fillRInfo(w) {
    $("#rITitle").textContent = L(w.title);
    // a book that belongs to a project says so: "Publication of the project *Title*" / プロジェクト「Title」のパブリケーション
    // book_role = none: no "Publication of the project" line
    const role = w.book.role === "none" ? "" : w.book.role || (w.book.category !== "layout_design" ? "publication" : "");
    // v25: the "Publication of the project" line is no longer shown on any book
    $("#rISub").innerHTML = esc(w.year);
    const about = L(w.book.about);
    const pdf = w.pdfs.map(p => `<a href="${esc(pdfView(p.href, L(w.title)))}" target="_blank" rel="noopener">${esc(p.lang === "ja" ? t("readJa") : t("read"))}</a>`).join("　");
    $("#rIBody").innerHTML = (about ? about.split(/\n+/).filter(Boolean).map(p => `<p>${fmt(p)}</p>`).join("") : "") + (pdf ? `<p class="pdf">${pdf}</p>` : "");
    const pages = (w.book.pages || []).reduce((n, p) => n + (p.spread ? 2 : 1), 0);
    // only a selection shown (rights): the whole book's count, and how many of its pages are here
    // a book shown through its photographs (pages_from = images) has no page count to give
    const count = w.book.fromImages && !w.book.pageCount ? "" : w.book.pageCount > pages ? `${w.book.pageCount}${lang === "ja" ? "（" : " ("}${t("book.shown").replace("{n}", pages)}${lang === "ja" ? "）" : ")"}` : pages > 1 ? String(pages) : "";
    // an ISBN is shown once, on its own line (not again inside the publisher or format)
    const noIsbn = v => (v || "").replace(/[;,(]?\s*ISBN[:\s]*[\d-]+X?\)?/gi, "").trim();
    $("#rIFacts").innerHTML = [["book.publisher", noIsbn(w.publisher)], ["book.artists", w.book.artists], ["book.texts", w.book.texts], ["book.isbn", w.book.isbn],
      ["book.format", noIsbn(w.format)], ["book.print", L(w.book.print)], ["book.paper", L(w.book.stock)], ["book.language", w.language], ["book.pages", count]]
      .filter(f => f[1]).map(([k, v]) => `<div><dt>${esc(t(k))}</dt><dd>${fmt(v)}</dd></div>`).join("");
    // after the facts: the opening of the project's own text, and a way to the project
    const proj = role ? (L(w.long) || L(w.desc) || "").split(/\n+/).filter(Boolean)[0] || "" : "";
    const cut = proj.length > 320 ? proj.slice(0, 320).replace(/[^.。!?！？]*$/, "") || proj.slice(0, 320) + "…" : proj;
    $("#rIProj").hidden = !role;
    $("#rIProj").innerHTML = role ? `<h3>${esc(t("about.project"))}</h3>${cut ? `<p>${fmt(cut)}</p>` : ""}${w.indexOnly ? "" : `<p class="lnk"><button type="button" data-open="${w.id}">${esc(t("open.project"))} →</button></p>`}` : "";
  }
  $("#rWork").addEventListener("click", () => toggleRInfo());
  $("#rIBack").addEventListener("click", () => closeOverlay());
  reader.addEventListener("click", e => {
    if ($("#rInfo").hidden || e.target.closest(".r-info, .rail, .s-steps, .r-scrub")) return;
    e.preventDefault(); e.stopPropagation(); toggleRInfo(false);
  }, true);
  $("#rHome").addEventListener("click", () => closeOverlay());   // Back: closes the book and returns to the same place
  swipe($("#rStage"), d => { if (!touchZoom()) turn(d); });   // while zoomed on a phone, only the arrows turn pages

  /* routing */
  function go(hash) { if (location.hash !== hash) history.pushState(null, "", hash); route(); }
  function route() {
    const m = location.hash.match(/^#(work|series|book)=([\w-]+)/);
    if (!m || (m[1] === "work" && (!byId[m[2]] || byId[m[2]].indexOnly))) return closeOverlay(true);
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
      if (!inGallery && !$("#rInfo").hidden) return toggleRInfo(false);
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

  /* ---------- header: the section you are in is set in bold ---------- */
  {
    const links = [...document.querySelectorAll('.menu a[href^="#"], .dmenu a[href^="#"]')];
    const secs = [...new Set(links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean))];
    const spy = () => {
      const line = $("#top").offsetHeight + innerHeight * 0.3;
      let cur = null;
      for (const s of secs) if (s.getBoundingClientRect().top <= line) cur = s;
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = secs[secs.length - 1];   // bottom of the page
      links.forEach(a => a.classList.toggle("is-here", !!cur && a.getAttribute("href") === "#" + cur.id));
    };
    addEventListener("scroll", spy, { passive: true }); addEventListener("resize", spy); spy();
  }

  /* ---------- header: one row if name, menu and language fit; otherwise two rows ---------- */
  function fitHeader() {
    const top = $("#top"); top.classList.remove("wrap");
    if (matchMedia("(max-width: 760px)").matches && top.scrollWidth > top.clientWidth + 1) top.classList.add("wrap");
    document.documentElement.style.setProperty("--top-h", top.offsetHeight + "px");
  }
  window.__fitHeader = fitHeader;

  /* ---------- menu button: sections, language and the site's details (every screen size) ---------- */
  {
    const top = $("#top"), burger = $("#burger");
    const setOpen = open => {
      top.classList.toggle("open", open); burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.classList.toggle("menu-open", open);
    };
    burger.addEventListener("click", () => setOpen(!top.classList.contains("open")));
    $("#drawer").addEventListener("click", e => { if (e.target.closest("a[href^='#']")) setOpen(false); });
    addEventListener("keydown", e => { if (e.key === "Escape" && top.classList.contains("open")) { setOpen(false); burger.focus(); } });
    document.addEventListener("click", e => { if (top.classList.contains("open") && !e.target.closest("#drawer, #burger")) setOpen(false); });
    window.__closeMenu = () => setOpen(false);
  }
  const setChronoBar = () => { const b = document.querySelector(".chrono > .bar"); if (b) document.documentElement.style.setProperty("--chrono-bar", b.offsetHeight + "px"); };
  addEventListener("resize", setChronoBar); setTimeout(setChronoBar, 300);
  addEventListener("resize", fitHeader); fitHeader();
  if (document.fonts) document.fonts.ready.then(fitHeader);

  /* ---------- phones: section titles out of the sticky bars (they scroll away, the switches stay) ---------- */
  {
    const pairs = [[$("#tools .bar h2"), $("#tools .bar"), $("#tools")], [$("#chronoTitle"), $(".chrono > .bar"), $(".chrono > .bar")]].filter(p => p[0]);
    const place = () => {
      const small = matchMedia("(max-width: 760px)").matches;
      for (const [h, bar, sticky] of pairs) {
        if (small && h.parentNode === bar) { h.classList.add("sec-title"); sticky.parentNode.insertBefore(h, sticky); }
        else if (!small && h.parentNode !== bar) { h.classList.remove("sec-title"); bar.prepend(h); }
      }
      setTopH();
    };
    matchMedia("(max-width: 760px)").addEventListener("change", place); place();
  }

  /* ---------- index: while the exhibitions list is on screen, mark "Artistic practice" ---------- */
  {
    const ex = $("#exhib");
    // the group being read gets the black button: the trackhead last passed under the bar (the exhibitions count as artistic practice)
    const mark = () => {
      const bar = document.querySelector(".chrono > .bar"), line = $("#top").offsetHeight + (bar ? bar.offsetHeight : 40) + 40;
      const r = ex.getBoundingClientRect(), exOn = !ex.hidden && r.top < innerHeight * 0.6 && r.bottom > line;
      let cur = exOn ? "art" : null;
      if (!cur) {
        const sec = $("#chronology").getBoundingClientRect();
        if (sec.top < innerHeight * 0.5 && sec.bottom > line)
          document.querySelectorAll(".chrono .trackhead[data-g]").forEach(h => { if (h.getBoundingClientRect().top <= line + 120) cur = h.dataset.g; });
        if (!cur && sec.top < innerHeight * 0.5 && sec.bottom > line) { const f = document.querySelector(".chrono .trackhead[data-g]"); cur = f && f.dataset.g; }
      }
      document.querySelectorAll("#tracks [data-track]").forEach(b => b.classList.toggle("is-focus", b.dataset.track === cur));
    };
    addEventListener("scroll", mark, { passive: true }); addEventListener("resize", mark); mark();
    window.__markExhib = mark;
  }

  /* ---------- contact form (sent through a form service; no address on the page) ---------- */
  const cform = document.getElementById("cform");
  if (cform) cform.addEventListener("submit", async e => {
    e.preventDefault();
    const st = cform.querySelector(".cstatus"), btn = cform.querySelector("button");
    if (cform._honey.value) return;              // filled in only by bots
    btn.disabled = true; st.textContent = t("form.sending"); st.className = "cstatus";
    try {
      const fd = new FormData(cform);
      const body = { name: fd.get("name"), email: fd.get("email"), message: fd.get("message"),
        _subject: "natsumi-sugiyama.com: " + fd.get("name"), _template: "box", _captcha: "false", _honey: "" };
      const r = await fetch(cform.action, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || String(j.success) !== "true") throw new Error(j.message || r.status);
      cform.reset(); st.textContent = t("form.sent"); st.className = "cstatus ok";
    } catch (err) { st.textContent = t("form.error"); st.className = "cstatus err"; }
    btn.disabled = false;
  });

  /* ---------- language, resize, start ---------- */
  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dataset.lang = lang;
    document.querySelectorAll("[data-t]").forEach(el => { const v = T[lang][el.dataset.t]; if (typeof v === "string") el.textContent = v; });
    document.querySelectorAll("[data-t-label]").forEach(el => { const v = T[lang][el.dataset.tLabel]; if (typeof v === "string" && v) { el.setAttribute("aria-label", v); el.dataset.tip = v; if (el.title) el.title = v; } });
    document.querySelectorAll("[data-set-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.setLang === lang)));
    document.querySelectorAll(".info-text[lang], .links .sub[lang]").forEach(el => { el.hidden = el.lang !== lang; });
    document.querySelectorAll("[data-lines]").forEach(el => {
      const v = T[lang][el.dataset.lines]; if (typeof v === "string") el.innerHTML = v.split("\n").filter(Boolean).map(x => `<li>${esc(x)}</li>`).join("");
    });
    document.title = T[lang]["seo.title"] || document.title;
    renderFilters(); renderSheet(); renderShelves(); renderChrono(); renderExhib();
    setSlide(cur);
    if (current) current.type === "book" ? (readerUI(), $("#rTitle").textContent = L(byId[current.id].title), fillRInfo(byId[current.id])) : showGallery(current.type, current.id, true);
  }
  document.querySelectorAll("[data-set-lang]").forEach(b => b.addEventListener("click", () => {
    lang = b.dataset.setLang === lang && matchMedia("(max-width: 760px)").matches ? (lang === "en" ? "ja" : "en") : b.dataset.setLang; try { localStorage.setItem("ns-lang", lang); } catch (e) {} applyLang(); if (window.__fitHeader) window.__fitHeader();
  }));
  const setHdr = () => document.documentElement.style.setProperty("--hdr", top.offsetHeight + "px");
  let rz, lastW = 0;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { setHdr(); const w = $("#sheet").clientWidth; if (w !== lastW) { lastW = w; renderSheet(); }
    if (!reader.hidden && !R.busy) { const two = innerWidth > 760; if (two !== R.two) { const w = byId[R.id]; R.two = two; R.v = 0; R.pages = bookPages(w); R.aspect = pageAspect(w); buildViews(); buildScrub(w); } sizeBook(); drawView(R.v); } }, 150); });

  /* ---------- the studio (nat/yama): a small preview window, not a jump ----------
     wide screens: pointing at the name shows the window, a click on the window opens the studio's site in a new tab;
     touch screens: the first tap only shows the window, a tap on the window opens the site */
  {
    const url = T.en["info.studio.url"]; let card = null, hideT = null;
    if (url) {
      card = document.createElement("a"); card.className = "studio-card"; card.href = url; card.target = "_blank"; card.rel = "noopener"; card.hidden = true;
      document.body.appendChild(card);
      const fill = () => { const img = T.en["info.studio.image"];
        card.innerHTML = `${img ? `<img src="${esc(img)}" alt="">` : ""}<span class="sc-name">${esc(T.en["info.studio"] || "nat/yama")}</span><span class="sc-sub">${esc(t("info.studio.caption") || "")}</span><span class="sc-go">${esc(url.replace(/^https?:\/\//, "").replace(/\/$/, ""))} ↗</span>`; };
      const touch = matchMedia("(hover: none)").matches;
      const show = a => {
        clearTimeout(hideT); fill(); card.hidden = false;
        const r = a.getBoundingClientRect(), W = card.offsetWidth, H = card.offsetHeight;
        const below = r.bottom + 10 + H < innerHeight;
        card.style.left = Math.max(12, Math.min(innerWidth - W - 12, r.left + r.width / 2 - W / 2)) + "px";
        card.style.top = (below ? r.bottom + 10 : r.top - H - 10) + "px";
        void card.offsetWidth; card.classList.add("on");
      };
      const hide = (now) => { clearTimeout(hideT); hideT = setTimeout(() => { card.classList.remove("on"); setTimeout(() => { if (!card.classList.contains("on")) card.hidden = true; }, 200); }, now ? 0 : 220); };
      const isStudio = el => el && el.closest(".info-side .studio a, a.studio-name");
      document.addEventListener("pointerover", e => { if (touch) return; const a = isStudio(e.target); if (a) show(a); else if (e.target.closest(".studio-card")) clearTimeout(hideT); });
      document.addEventListener("pointerout", e => { if (touch) return; if (isStudio(e.target) || e.target.closest(".studio-card")) hide(); });
      document.addEventListener("focusin", e => { const a = isStudio(e.target); if (a) show(a); });
      document.addEventListener("focusout", e => { if (isStudio(e.target)) hide(); });
      document.addEventListener("click", e => {
        const a = isStudio(e.target);
        if (a && touch) { e.preventDefault(); if (card.hidden) show(a); else hide(true); return; }   // first tap: show only
        if (!e.target.closest(".studio-card") && !a) hide(true);
      });
      addEventListener("scroll", () => { if (!card.hidden) hide(true); }, { passive: true });
    }
  }

  /* ---------- first visit: the controls glow softly once, so the flow is easy to find ---------- */
  const firstTime = key => { try { if (localStorage.getItem("ns-tour-" + key)) return false; localStorage.setItem("ns-tour-" + key, "1"); } catch (e) { return false; } return !reduced; };
  const glow = (...els) => els.filter(Boolean).forEach(el => { el.classList.remove("hint"); void el.offsetWidth; el.classList.add("hint"); el.addEventListener("animationend", () => el.classList.remove("hint"), { once: true }); });
  window.__tour = {
    home() {},          // no hint on the opening
    archive() { if (firstTime("archive")) glow(...document.querySelectorAll("#filters button, .views button")); },
    bookshelf() {},     // no hint on the shelf
    gallery() { if (firstTime("gallery")) setTimeout(() => glow($("#gInfoBtn"), $("#gGridBtn"), $("#gRight")), 700); },
    reader() {
      if (!firstTime("reader") || R.views.length < 4) return;
      // open the book a few pages by itself, then close it again; any touch or key stops the show
      let stop = false; const halt = () => { stop = true; };
      reader.addEventListener("pointerdown", halt, { once: true }); addEventListener("keydown", halt, { once: true });
      [[900, 1], [2000, 1], [3300, -1], [4400, -1]].forEach(([ms, d]) => setTimeout(() => { if (!stop && !reader.hidden && R.id) turn(d); }, ms));
      setTimeout(() => { if (!reader.hidden) glow($("#rWork"), $("#rRight")); }, 5400);
    },
  };

  /* ---------- first scroll from the opening: each section's title shows large, then settles while the content dissolves in ---------- */
  {
    const pairs = [["#archive", "#archiveTitle", "archive"], ["#bookshelf", "#bookTitle", "bookshelf"], ["#chronology", "#chronoTitle"], ["#info", "#infoTitle"]]
      .map(([s, h, tour]) => ({ sec: $(s), h2: $(h), tour })).filter(x => x.sec && x.h2);
    const fromTop = scrollY < innerHeight * 0.5 && !location.hash;
    if (!reduced && fromTop && "IntersectionObserver" in window) {
      pairs.forEach(({ sec, h2 }) => { sec.classList.add("pre-intro"); h2.classList.add("intro-h"); });
      // the large title comes up, then dissolves where it is (softening, spreading, fading);
      // as it goes, the whole section, its own heading included, fades in — the two are not joined
      const play = ({ sec, h2, tour }) => {
        const big = document.createElement("div"); big.className = "sec-intro"; big.setAttribute("aria-hidden", "true"); big.textContent = h2.textContent;
        sec.appendChild(big);
        const HOLD = 900, OUT = 2300;
        let done = false;
        const finish = () => { if (done) return; done = true; sec.classList.remove("pre-intro", "intro-in"); h2.classList.remove("intro-h"); big.remove(); if (tour && window.__tour) window.__tour[tour](); };
        requestAnimationFrame(() => requestAnimationFrame(() => big.classList.add("show")));
        setTimeout(() => { big.classList.add("gone"); h2.classList.remove("intro-h"); sec.classList.add("intro-in"); }, HOLD);
        setTimeout(finish, HOLD + OUT + 200);
      };
      const started = new Set();
      const start = it => { if (started.has(it.sec)) return; started.add(it.sec); io.unobserve(it.sec); play(it); };
      const io = new IntersectionObserver(ens => ens.forEach(en => { const it = pairs.find(x => x.sec === en.target); if (en.isIntersecting && it) start(it); }),
        { rootMargin: "0px 0px -30% 0px", threshold: 0 });
      pairs.forEach(({ sec }) => io.observe(sec));
      // the same check on scroll, in case the observer reports late
      const check = () => pairs.forEach(it => { const r = it.sec.getBoundingClientRect(); if (r.top < innerHeight * 0.7 && r.bottom > 0) start(it); });
      addEventListener("scroll", check, { passive: true });
    } else {
      // no intro (reduced motion, or landing mid-page): the first-visit hints still run once the section is seen
      const io = new IntersectionObserver(ens => ens.forEach(en => { if (!en.isIntersecting) return; io.unobserve(en.target); const it = pairs.find(x => x.sec === en.target); if (it && it.tour) window.__tour[it.tour](); }), { threshold: 0.2 });
      pairs.forEach(({ sec }) => io.observe(sec));
    }
  }

  /* ---------- images on the page come up softly as they scroll into view (once loaded) ---------- */
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(ens => ens.forEach(en => {
      if (!en.isIntersecting) return;
      const im = en.target; io.unobserve(im);
      const show = () => requestAnimationFrame(() => im.classList.add("in"));
      if (im.complete && im.naturalWidth) show(); else { im.addEventListener("load", show, { once: true }); im.addEventListener("error", show, { once: true }); }
    }), { rootMargin: "0px 0px -6% 0px" });
    // (the hover previews beside the lists change their picture on the spot, so they are left as they are)
    const watch = () => document.querySelectorAll("main > section:not(.hero) img:not(.rv)").forEach(im => { im.classList.add("rv"); if (im.closest(".peek, .expeek, .studio-card")) im.classList.add("in"); else io.observe(im); });
    new MutationObserver(watch).observe($("main"), { childList: true, subtree: true });
    watch();
  }

  buildHero();
  applyLang();
  window.__tour.home();
  setHdr();
  lastW = $("#sheet").clientWidth;
  route();
})();
