#!/usr/bin/env python3
"""
Build data for the visual archive (next/).

Reads the project list from ../app.js (the `const PROJECTS = [...]` line),
looks up the real image and publication files under ../archive/,
writes web-sized copies to next/img/<id>/, and writes next/data.js.

Run from the repository root:
    python3 next/tools/build.py

Re-run it whenever you add images to an `images/public/` folder or change
the project list. Original files are never modified.
"""
import json, os, re, sys
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

CONFIG = json.loads((Path(__file__).parent / "site-config.json").read_text(encoding="utf-8"))
HERO_SIZE = 2400

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


def load_projects():
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
        return {"src": f"img/{pid}/{name}.webp", "thumb": f"img/{pid}/{name}_s.webp", "w": w, "h": h}


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


def main():
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
        y0 = p.get("year_num") or int(re.findall(r"\d{4}", p.get("year", "2000"))[0])
        years = [int(x) for x in re.findall(r"\d{4}", p.get("year", ""))] or [y0]
        works.append({
            "id": p["id"],
            "visibility": vis,
            "title": {"en": nice(p.get("title_en")), "ja": nice(p.get("title_ja") or p.get("title_en"))},
            "year": p.get("year", ""), "y0": years[0], "y1": years[-1],
            "area": "art" if p.get("area_label") == "Artistic/Research" else "design",
            "row": row_for(p),
            "featured": bool(p.get("featured")), "featOrder": p.get("feat_order") or 99,
            "question": {"en": nice(p.get("research_question_en")), "ja": nice(p.get("research_question_ja"))},
            "desc": {"en": nice(p.get("desc_en")), "ja": nice(p.get("desc_ja"))},
            "long": {"en": (p.get("long_en") or "").strip(), "ja": (p.get("long_ja") or "").strip()},
            "venue": nice(p.get("venue")), "city": nice(p.get("city")), "country": nice(p.get("country")),
            "medium": [nice(m) for m in (p.get("medium") or []) if m],
            "credit": nice(p.get("credit")), "photoCredit": nice(p.get("photo_credits")),
            "award": nice(p.get("award")), "funding": nice(p.get("funding")),
            "collaborators": nice(p.get("collaborators")), "role": nice(p.get("roles_detail") or p.get("role")),
            "website": (p.get("website") or "").strip(),
            "book": ({"category": p.get("bookshelf_category"), "order": p.get("order_book") or 99,
                      "cover": cover_book} if p.get("bookshelf") else None),
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
    for pid, idx in CONFIG.get("hero", []):
        p = next((x for x in projects if x["id"] == pid), None)
        d = project_dir(p) if p else None
        files = public_images(d) if d else []
        if idx >= len(files):
            print("hero: no image", pid, idx); continue
        src = files[idx]
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
        hero.append({"id": pid, "src": dest.relative_to(NEXT).as_posix(), "w": w, "h": h,
                     "lumTop": top, "lumBottom": bottom})

    data = {"rows": {"art": [{"key": k, "en": en, "ja": ja} for k, en, ja, _ in ART_ROWS],
                     "design": [{"key": k, "en": en, "ja": ja} for k, en, ja, _ in DESIGN_ROWS]},
            "works": works, "series": series, "hero": hero, "projects": CONFIG.get("projects", [])}
    (NEXT / "data.js").write_text(
        "/* generated by next/tools/build.py — do not edit by hand */\n"
        "window.ARCHIVE = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    for f in SKIPPED:
        print("skipped (not a readable image):", f)
    print(f"\n{len(works)} works, {len(series)} series -> next/data.js")


if __name__ == "__main__":
    main()
