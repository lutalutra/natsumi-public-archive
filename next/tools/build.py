#!/usr/bin/env python3
"""
Build data for the visual archive (next/).

Content comes from the CSV files in next/content/ (edit these):
  projects.csv         every project (same columns as the old PROJECTS list)
  hero.csv             images for the opening slideshow, in order
  studio_projects.csv  studio projects shown separately in the index
  books.csv            where each bookshelf item takes its pages from
  image_captions.csv   a short caption and credit per image, shown in the gallery
  texts.csv            every piece of text on the site (EN and JA): Info, labels, SEO
  floating.csv         grey dots floating in the index: NDA work, spot projects, things not yet placed
  legal.csv            Impressum and privacy policy (DE and EN) -> impressum.html, datenschutz.html
If projects.csv is missing, the list is read from ../app.js instead.

Images come from archive/<group>/<id>/images/public/. Web-sized copies go to
next/img/<id>/, book pages to next/img/<id>/book/, and everything to next/data.js.

Run from the repository root:
    python3 next/tools/build.py

Re-run it whenever you add images to an `images/public/` folder or change
the project list. Original files are never modified.
"""
import csv, json, os, re, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
NEXT = ROOT / "next"
OUT_IMG = NEXT / "img"
IMG_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
LARGE, SMALL = 1800, 640
SKIPPED = []

# Series shown on the opening view, in order (same as the current site).
SERIES = [
    {"id": "SER001", "folder": "0_SER/0_SER001", "title_en": "Portraits of (Places)",
     "title_ja": "Portraits of (Places)", "children": ["A_ART001", "A_ART002", "A_ART003", "A_ART015"],
     "hero": ["A_ART001", 2]},
    {"id": "SER002", "folder": "0_SER/0_SER002", "title_en": "Recollections of Beyond",
     "title_ja": "回想：場所と人のあいだ", "children": ["A_ART014"],
     "hero": ["A_ART014", 0]},
]

CONTENT = NEXT / "content"
HERO_SIZE = 2400
PAGE_SIZE = 1400


def read_csv(name):
    f = CONTENT / name
    if not f.exists():
        return []
    with f.open(encoding="utf-8-sig", newline="") as fh:
        return [{k.strip(): (v or "").strip() for k, v in row.items() if k} for row in csv.DictReader(fh)]

# Rows of the index. Artistic work goes to the first row whose themes it carries.
ART_ROWS = [
    ("places", "Places & memory", "場所と記憶", ["Places & Memory", "Landscapes"]),
    ("narratives", "Narratives & archives", "語りとアーカイブ", ["Narratives & Archives"]),
    ("between", "In-betweenness", "あいだ", ["In-Betweenness", "Shared Environments"]),
    ("mediation", "Cultural mediation", "文化媒介", ["Cultural Mediation", "Applied Practice"]),
    ("other", "Other works", "その他", []),
]
# Design (natyama) work is sorted by what was made.
DESIGN_ROWS = [
    ("editorial", "Editorial and print", "編集・印刷物", r"book|booklet|editorial|publication|zine|logo|layout|graphic|infographic"),
    ("digital", "Web and app UX/UI", "Web・アプリ UX/UI", r"app|ui|ux|website|web"),
    ("content", "Content production", "コンテンツ制作", r"."),
]


LIST_COLS = {"themes", "medium", "cover_candidates"}
BOOL_COLS = {"featured", "bookshelf"}
NUM_COLS = {"year_num", "feat_order", "order_book"}


def load_projects():
    rows = read_csv("projects.csv")
    if rows:
        out = []
        for r in rows:
            for c in LIST_COLS & r.keys():
                r[c] = [x.strip() for x in r[c].split(";") if x.strip()]
            for c in BOOL_COLS & r.keys():
                r[c] = r[c].upper() in ("TRUE", "1", "YES")
            for c in NUM_COLS & r.keys():
                try:
                    v = float(r[c]); r[c] = int(v) if v.is_integer() else v
                except ValueError:
                    r[c] = None
            out.append(r)
        return out
    src = (ROOT / "app.js").read_text(encoding="utf-8")
    m = re.search(r"^const PROJECTS = (\[.*\]);?\s*$", src, re.M)
    if not m:
        sys.exit("Could not find `const PROJECTS = [...]` in app.js")
    return json.loads(m.group(1))


def project_dir(p):
    folder = (p.get("photo_folder") or "").split("/images")[0]
    cand = ROOT / folder
    if folder and cand.is_dir():
        return cand
    hits = sorted((ROOT / "archive").glob(f"*/{p['id']}*"))
    return hits[0] if hits else None


def sort_key(name):
    n = name.lower()
    if n.startswith("cover."):
        return (0, n)
    if n.startswith("gallery") or n.startswith("documentation"):
        return (1, n)
    return (2, n)


def public_images(d):
    pub = d / "images" / "public"
    if not pub.is_dir():
        return []
    files = [f for f in pub.iterdir() if f.suffix.lower() in IMG_EXT]
    # thumbnail/thumb files duplicate the cover; "cover 2" style duplicates too
    files = [f for f in files if not re.match(r"(thumb|thumbnail|cover \d)", f.stem.lower())]
    return sorted(files, key=lambda f: sort_key(f.name))


def book_cover(d):
    for sub in ("publication", "publications"):
        for stem in ("cover_01", "publication_01", "publication_o1"):
            for f in (d / sub).glob(stem + ".*") if (d / sub).is_dir() else []:
                if f.suffix.lower() in IMG_EXT:
                    return f
    return None


def pdfs(d):
    out = []
    for sub in ("publication", "publications"):
        p = d / sub
        if not p.is_dir():
            continue
        for name, lang in (("publication.pdf", "en"), ("publication.ja.pdf", "ja"), ("toposbooklight.pdf", "en")):
            f = p / name
            if f.exists() and f.stat().st_size < 30_000_000:
                out.append({"href": "../" + f.relative_to(ROOT).as_posix(), "lang": lang,
                            "mb": round(f.stat().st_size / 1e6, 1)})
    return out


def edge_color(path):
    """Colour of the image's own background: median of a thin border, plus a readable text tone."""
    with Image.open(path) as im:
        im = im.convert("RGB")
        im.thumbnail((200, 200))
        w, h = im.size
        b = max(2, min(w, h) // 25)
        px = []
        for box in ((0, 0, w, b), (0, h - b, w, h), (0, 0, b, h), (w - b, 0, w, h)):
            px += list(im.crop(box).getdata())
    med = [sorted(c[i] for c in px)[len(px) // 2] for i in range(3)]
    lum = (0.2126 * med[0] + 0.7152 * med[1] + 0.0722 * med[2]) / 255
    return "#%02x%02x%02x" % tuple(med), round(lum, 3)


def derive(src, pid, idx):
    """Write large + small webp copies, return their info."""
    dest = OUT_IMG / pid
    dest.mkdir(parents=True, exist_ok=True)
    name = f"{idx:02d}"
    big, small = dest / f"{name}.webp", dest / f"{name}_s.webp"
    try:
        im = Image.open(src)
    except Exception:
        SKIPPED.append(src.relative_to(ROOT).as_posix())
        return None
    with im:
        animated = getattr(im, "is_animated", False)
        im = ImageOps.exif_transpose(im)
        w, h = im.size
        if animated:
            # keep animated gifs as they are (small enough), no derivative
            rel = "../" + src.relative_to(ROOT).as_posix()
            return {"src": rel, "thumb": rel, "w": w, "h": h}
        im = im.convert("RGB")
        from PIL import ImageStat
        if max(ImageStat.Stat(im.convert("L").resize((64, 64))).stddev) < 6:
            SKIPPED.append(src.relative_to(ROOT).as_posix() + "  (looks blank / placeholder)")
            return None
        for target, size, q in ((big, LARGE, 80), (small, SMALL, 72)):
            if not target.exists() or target.stat().st_mtime < src.stat().st_mtime:
                c = im.copy()
                c.thumbnail((size, size), Image.LANCZOS)
                c.save(target, "WEBP", quality=q, method=5)
        bg, lum = edge_color(small)
        out = {"src": f"img/{pid}/{name}.webp", "thumb": f"img/{pid}/{name}_s.webp", "w": w, "h": h, "bg": bg, "lum": lum}
        cap = CAPTIONS.get((pid, src.name))
        if cap and any(cap.values()):
            out["cap"] = cap
        return out


def save_page(im, dest):
    im = im.convert("RGB")
    im.thumbnail((PAGE_SIZE * 2, PAGE_SIZE), Image.LANCZOS)
    im.save(dest, "WEBP", quality=78, method=5)
    return im.size


def book_pages(p, d, images, cover):
    """Pages for the book view: from a PDF (rendered) or from the project's images."""
    spec = BOOKS.get(p["id"], {})
    out_dir = OUT_IMG / p["id"] / "book"
    pages = []
    if spec.get("pages_from") == "pdf" and spec.get("pdf"):
        pdf = d / spec["pdf"]
        if not pdf.exists():
            print("book: PDF not found", pdf); 
        else:
            limit = int(spec.get("max_pages") or 30)
            out_dir.mkdir(parents=True, exist_ok=True)
            stamp = out_dir / ".source"
            fresh = stamp.exists() and stamp.read_text() == f"{pdf}:{pdf.stat().st_mtime}:{limit}"
            if not fresh:
                for old in out_dir.glob("p*.webp"):
                    old.unlink()
                with tempfile.TemporaryDirectory() as tmp:
                    subprocess.run(["pdftoppm", "-r", "110", "-l", str(limit), "-png", str(pdf), f"{tmp}/p"],
                                   check=True, stderr=subprocess.DEVNULL)
                    for i, f in enumerate(sorted(Path(tmp).glob("p*.png"))):
                        with Image.open(f) as im:
                            save_page(im, out_dir / f"p{i:03d}.webp")
                stamp.write_text(f"{pdf}:{pdf.stat().st_mtime}:{limit}")
            for f in sorted(out_dir.glob("p*.webp")):
                with Image.open(f) as im:
                    w, h = im.size
                pages.append({"src": f.relative_to(NEXT).as_posix(), "w": w, "h": h, "spread": w / h > 1.2})
            return pages
    # from images: book cover first, then publication images, then project images
    seen = set()
    for m in ([cover] if cover else []) + images:
        if m and m["src"] not in seen:
            seen.add(m["src"])
            pages.append({"src": m["src"], "w": m["w"], "h": m["h"], "spread": False, "bg": m.get("bg"), "lum": m.get("lum")})
    return pages


def row_for(p):
    if p.get("area_label") == "Artistic/Research":
        themes = [t.strip() for t in (p.get("themes") or [])]
        for key, _en, _ja, names in ART_ROWS:
            if any(t in names for t in themes):
                return key
        return "other"
    med = " ".join(p.get("medium") or []).lower()
    if re.search(r"app|ui_|ux|website", med):
        return "digital"
    if re.search(r"book|booklet|editorial|publication|zine|logo|layout", med):
        return "editorial"
    return "content"


def luminance(path):
    """Mean brightness (0-1) of the top band and the lower-left caption area, as seen with object-fit: cover."""
    with Image.open(path) as im:
        im = im.convert("L")
        w, h = im.size
        target = 16 / 10                      # typical screen; crop like object-fit: cover
        if w / h > target:
            cw = int(h * target); im = im.crop(((w - cw) // 2, 0, (w - cw) // 2 + cw, h))
        else:
            ch = int(w / target); im = im.crop((0, (h - ch) // 2, w, (h - ch) // 2 + ch))
        w, h = im.size
        from PIL import ImageStat
        top = ImageStat.Stat(im.crop((0, 0, w, int(h * .12)))).mean[0] / 255
        bottom = ImageStat.Stat(im.crop((0, int(h * .7), int(w * .55), h))).mean[0] / 255
        return round(top, 3), round(bottom, 3)


def nice(s):
    return re.sub(r"\s+", " ", (s or "").replace("_", " ")).strip()


BOOKS = {}
CAPTIONS = {}


def esc(t):
    return (t or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def write_static(texts, works):
    """Put the parts search engines read into index.html, between marker comments."""
    page = NEXT / "index.html"
    html = page.read_text(encoding="utf-8")
    T = lambda k, l="en": (texts.get(k) or {}).get(l, "")
    paras = lambda t: "".join(f"<p>{esc(x.strip())}</p>" for x in t.split("\n\n") if x.strip())
    lines = lambda t: "".join(f"<li>{esc(x.strip())}</li>" for x in t.split("\n") if x.strip())
    alumni = []
    for line in T("info.education").split("\n"):
        name = line.split(" — ")[0].split(",")[0].strip()
        if name:
            alumni.append({"@type": "CollegeOrUniversity", "name": name})
    ld = {
        "@context": "https://schema.org", "@type": "Person", "name": "Natsumi Sugiyama", "alternateName": "杉山夏実",
        "description": T("seo.description"),
        "homeLocation": {"@type": "Place", "name": "Berlin, Germany"},
        "alumniOf": alumni, "email": "mailto:" + T("contact.email"),
        "knowsAbout": ["installation art", "drawing", "mapping", "fieldwork", "artistic research",
                       "editorial design", "information design", "digital content"],
        "award": [x.strip() for x in T("info.support").split("\n") if x.strip()],
    }
    blocks = {
        "head": (f'<title>{esc(T("seo.title"))}</title>\n'
                 f'<meta name="description" content="{esc(T("seo.description"))}">\n'
                 f'<meta property="og:title" content="{esc(T("seo.title"))}">\n'
                 f'<meta property="og:description" content="{esc(T("seo.description"))}">\n'
                 f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>'),
        "info": (f'<div class="info-text" lang="en"><p class="lead">{esc(T("info.lead"))}</p>{paras(T("info.statement"))}</div>\n'
                 f'<div class="info-text" lang="ja" hidden><p class="lead">{esc(T("info.lead", "ja"))}</p>{paras(T("info.statement", "ja"))}</div>\n'
                 f'<div class="info-side">'
                 f'<div><h3 data-t="info.education.label">{esc(T("info.education.label"))}</h3><ul class="plain" data-lines="info.education">{lines(T("info.education"))}</ul></div>'
                 f'<div><h3 data-t="info.support.label">{esc(T("info.support.label"))}</h3><ul class="plain" data-lines="info.support">{lines(T("info.support"))}</ul></div>'
                 f'<div><h3 data-t="contact">{esc(T("contact"))}</h3><p><a href="mailto:{esc(T("contact.email"))}">{esc(T("contact.email"))}</a></p></div>'
                 f'</div>'),
        "works": '<ol class="list">' + "".join(
            f'<li><a href="#work={w["id"]}"><span class="y">{esc(w["year"])}</span><span>{esc(w["title"]["en"])}</span>'
            f'<span class="m">{esc(", ".join(w["medium"]))}</span></a></li>' for w in works) + "</ol>",
    }
    for name, content in blocks.items():
        a, b = f"<!--static:{name}-->", f"<!--/static:{name}-->"
        if a in html and b in html:
            html = html[:html.index(a) + len(a)] + "\n" + content + "\n" + html[html.index(b):]
        else:
            print("index.html: marker missing for", name)
    page.write_text(html, encoding="utf-8")


LEGAL_PAGE = """<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} — Natsumi Sugiyama</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="site.css">
</head>
<body class="legal">
<header class="top solid"><a class="name" href="./">Natsumi Sugiyama</a></header>
<main class="legal-main">
<div lang="de">{de}</div>
<div lang="en">{en}</div>
</main>
<footer class="foot"><a href="./">Archive</a> <a href="impressum.html">Impressum</a> <a href="datenschutz.html">Datenschutz</a></footer>
</body>
</html>
"""


def linkify(t):
    t = esc(t)
    t = re.sub(r"(https?://[^\s<]+)", r'<a href="\1" rel="noopener">\1</a>', t)
    return re.sub(r"([\w.+-]+@[\w-]+\.[\w.]+)", r'<a href="mailto:\1">\1</a>', t)


def write_legal():
    L = {r["key"]: r for r in read_csv("legal.csv") if r.get("key")}
    if not L:
        return
    block = lambda t: "".join(f"<p>{linkify(x).replace(chr(10), '<br>')}</p>" for x in t.split("\n\n") if x.strip())
    def imprint(l):
        g = lambda k: (L.get(k) or {}).get(l, "")
        parts = [f"<h1>{esc(g('imprint.title'))}</h1>", f"<p class='muted'>{esc(g('imprint.law'))}</p>",
                 f"<p>{esc(g('imprint.name'))}<br>{esc(g('imprint.address')).replace(chr(10), '<br>')}</p>",
                 f"<p>E-Mail: {linkify(g('imprint.email'))}" + (f"<br>{'Telefon' if l == 'de' else 'Phone'}: {esc(g('imprint.phone'))}" if g('imprint.phone') else "") + "</p>"]
        if g("imprint.vat"):
            parts.append(f"<p>{'USt-IdNr.' if l == 'de' else 'VAT ID'}: {esc(g('imprint.vat'))}</p>")
        for k in ("copyright", "liability"):
            parts.append(f"<h2>{esc(g(f'imprint.{k}.title'))}</h2>{block(g(f'imprint.{k}'))}")
        return "".join(parts)
    def privacy(l):
        g = lambda k: (L.get(k) or {}).get(l, "")
        parts = [f"<h1>{esc(g('privacy.title'))}</h1>"]
        for k in ("controller", "hosting", "nocookies", "contact", "rights"):
            parts.append(f"<h2>{esc(g(f'privacy.{k}.title'))}</h2>{block(g(f'privacy.{k}'))}")
        return "".join(parts)
    (NEXT / "impressum.html").write_text(LEGAL_PAGE.format(title="Impressum", de=imprint("de"), en=imprint("en")), encoding="utf-8")
    (NEXT / "datenschutz.html").write_text(LEGAL_PAGE.format(title="Datenschutz", de=privacy("de"), en=privacy("en")), encoding="utf-8")
    open_items = [k for k, r in L.items() if "[" in (r.get("de", "") + r.get("en", ""))]
    if open_items:
        print("legal.csv: fill in before going live ->", ", ".join(open_items))


def main():
    BOOKS.update({r["project_id"]: r for r in read_csv("books.csv") if r.get("project_id")})
    for r in read_csv("image_captions.csv"):
        if r.get("project_id") and r.get("file"):
            CAPTIONS[(r["project_id"], r["file"])] = {"en": r.get("caption_en", ""), "ja": r.get("caption_ja", ""),
                                                      "credit": r.get("credit", "")}
    texts = {r["key"]: {"en": r.get("en", ""), "ja": r.get("ja", "")} for r in read_csv("texts.csv") if r.get("key")}
    projects = load_projects()
    works, seen = [], set()
    for p in projects:
        vis = (p.get("visibility") or "").lower()
        if vis == "private" or p["id"] in seen:
            continue
        seen.add(p["id"])
        d = project_dir(p)
        imgs = public_images(d) if d else []
        if vis == "partial":
            imgs = imgs[:1]          # partial: show the cover only
        images = [x for x in (derive(f, p["id"], i) for i, f in enumerate(imgs)) if x]
        bc = book_cover(d) if d else None
        cover_book = derive(bc, p["id"], 90) if bc else (images[0] if images else None)
        if p.get("bookshelf") and d:
            extra = []
            for sub in ("publication", "publications"):
                for f in sorted((d / sub).glob("*")) if (d / sub).is_dir() else []:
                    if f.suffix.lower() in IMG_EXT and f != bc:
                        extra.append(derive(f, p["id"], 91 + len(extra)))
            pages = book_pages(p, d, [x for x in extra if x] + images, cover_book)
        else:
            pages = []
        y0 = p.get("year_num") or int(re.findall(r"\d{4}", p.get("year", "2000"))[0])
        years = [int(x) for x in re.findall(r"\d{4}", p.get("year", ""))] or [y0]
        works.append({
            "id": p["id"],
            "visibility": vis,
            "title": {"en": nice(p.get("title_en")), "ja": nice(p.get("title_ja") or p.get("title_en"))},
            "year": p.get("year", ""), "y0": years[0], "y1": years[-1],
            "area": "art" if p.get("area_label") == "Artistic/Research" else "design",
            "row": row_for(p),
            "pillars": [x.strip() for x in (p.get("pillar") or "").split(";") if x.strip()],
            "featured": bool(p.get("featured")), "featOrder": p.get("feat_order") or 99,
            "question": {"en": nice(p.get("research_question_en")), "ja": nice(p.get("research_question_ja"))},
            "desc": {"en": nice(p.get("desc_en")), "ja": nice(p.get("desc_ja"))},
            "long": {"en": (p.get("long_en") or "").strip(), "ja": (p.get("long_ja") or "").strip()},
            "venue": nice(p.get("venue")), "venueShort": nice(p.get("venue_short")), "city": nice(p.get("city")),
            "site": nice(p.get("site_type")), "context": nice(p.get("location_detail")),
            "medium": [nice(m) for m in (p.get("medium") or []) if m],
            "credit": nice(p.get("credit")), "photoCredit": nice(p.get("photo_credits")),
            "award": nice(p.get("award")), "funding": nice(p.get("funding")),
            "collaborators": nice(p.get("collaborators")), "role": nice(p.get("roles_detail") or p.get("role")),
            "website": (p.get("website") or "").strip(),
            "book": ({"category": p.get("bookshelf_category"), "order": p.get("order_book") or 99,
                      "cover": cover_book, "pages": pages} if p.get("bookshelf") else None),
            "pdfs": pdfs(d) if d else [],
            "images": images,
        })
        print(f"{p['id']:10} {vis:8} {len(images)} images")

    series = []
    for s in SERIES:
        d = ROOT / "archive" / s["folder"]
        imgs = public_images(d)
        wk = next((w for w in works if w["id"] == s["hero"][0]), None)
        hero = (wk["images"][min(s["hero"][1], len(wk["images"]) - 1)] if wk and wk["images"] else None)
        series.append({**{k: s[k] for k in ("id", "children")}, "hero": hero,
                       "title": {"en": s["title_en"], "ja": s["title_ja"]},
                       })

    hero = []
    hero_rows = sorted(read_csv("hero.csv"), key=lambda r: float(r.get("order") or 0))
    for row in hero_rows:
        pid, want = row["project_id"], row.get("image") or "0"
        p = next((x for x in projects if x["id"] == pid), None)
        d = project_dir(p) if p else None
        files = public_images(d) if d else []
        src = next((f for f in files if f.name == want), None)
        if src is None and want.isdigit() and int(want) < len(files):
            src = files[int(want)]
        if src is None:
            print("hero: no image", pid, want); continue
        idx = files.index(src)
        dest = OUT_IMG / pid / f"hero_{idx:02d}.webp"
        dest.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            if not dest.exists() or dest.stat().st_mtime < src.stat().st_mtime:
                c = im.copy(); c.thumbnail((HERO_SIZE, HERO_SIZE), Image.LANCZOS)
                c.save(dest, "WEBP", quality=78, method=5)
            w, h = im.size
        top, bottom = luminance(dest)
        if max(w, h) < 1400:
            print(f"hero: {pid} image {idx} is only {w}x{h}px and will look soft full-screen")
        bg, lum = edge_color(dest)
        fit = (row.get("fit") or "cover").lower()
        if fit == "contain":
            top = bottom = lum
        hero.append({"id": pid, "src": dest.relative_to(NEXT).as_posix(), "w": w, "h": h,
                     "lumTop": top, "lumBottom": bottom, "fit": fit, "bg": bg, "link": row.get("link") or ""})

    data = {"rows": {"art": [{"key": k, "en": en, "ja": ja} for k, en, ja, _ in ART_ROWS],
                     "design": [{"key": k, "en": en, "ja": ja} for k, en, ja, _ in DESIGN_ROWS]},
            "works": works, "series": series, "hero": hero, "projects": [
                {"id": r["id"], "title": r["title"], "subtitle": {"en": r.get("subtitle_en", ""), "ja": r.get("subtitle_ja", "")},
                 "start": int(r["start"]), "end": int(r["end"]) if r.get("end") else None, "status": r.get("status") or "planned"}
                for r in read_csv("studio_projects.csv") if r.get("id")],
            "texts": texts,
            "floating": [{"y0": int(r["start"]) if r.get("start") else None,
                          "y1": int(r["end"] or r["start"]) if r.get("start") else None,
                          "kind": r.get("kind") or "unplaced",
                          "label": ({"en": r.get("label_en", ""), "ja": r.get("label_ja", "")}
                                    if (r.get("show_label") or "").upper() in ("TRUE", "1", "YES") else None)}
                         for r in read_csv("floating.csv")]}
    write_static(texts, sorted(works, key=lambda w: -w["y0"]))
    write_legal()
    (NEXT / "data.js").write_text(
        "/* generated by next/tools/build.py — do not edit by hand */\n"
        "window.ARCHIVE = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    for f in SKIPPED:
        print("skipped (not a readable image):", f)
    print(f"\n{len(works)} works, {len(series)} series -> next/data.js")


if __name__ == "__main__":
    main()
