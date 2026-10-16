# next/ — ビジュアル版アーカイブ（公開前プレビュー）

現在の `index.html` には一切手を加えず、新しいデザインを `next/` フォルダに分けて作っています。
リポジトリに置いてGitHub Pagesに反映すると、次のURLで確認できます。

    https://lutalutra.github.io/natsumi-public-archive/next/

## 構成

```
next/
  index.html      ページ構造
  site.css        デザイン
  site.js         表示ロジック（フィールドマップ、作品、一覧、本、作品ビュー、EN/JP）
  data.js         自動生成データ（手で編集しない）
  img/<ID>/       Web用に縮小した画像（webp、長辺1800px と 640px）
  tools/build.py  data.js と img/ を作り直すスクリプト
```

## コンテンツの編集（CSV）

`next/content/` のCSVを編集して、リポジトリのルートで次を実行します。

    pip install pillow
    python3 next/tools/build.py

| ファイル | 内容 |
|---|---|
| `projects.csv` | 全プロジェクト（旧 app.js の PROJECTS と同じ列）。タイトル、年、テーマ、説明文、会場、公開範囲（visibility）、選定（featured）、本棚（bookshelf, bookshelf_category, order_book）など |
| `hero.csv` | トップのスライドショー。`image` は images/public 内のファイル名、`fit` は cover（全面）か contain（全体を見せる）、`link` にシリーズIDを入れるとシリーズを開きます |
| `studio_projects.csv` | インデックスの「スタジオのプロジェクト」欄（tegote など）。`end` が空欄なら継続中 |
| `texts.csv` | サイト上のすべての文言（英・日）。Info の文章、学歴、受賞・助成、ボタンや見出しのラベル、検索結果に出るタイトルと説明文（seo.*） |
| `image_captions.csv` | 画像ごとの短い説明とクレジット。ギャラリーの左下に小さく表示（例：Installation view / Photo: …） |
| `legal.csv` | Impressum とプライバシーポリシー（独・英）。`[ ]` の部分（住所・電話）を埋めるまで、ビルド時に警告が出ます |
| `books.csv` | 本棚の各本のページの元。`pages_from` が `pdf` なら PDF を描画（`pdf` にプロジェクトフォルダからのパス、`max_pages` に枚数）、`images` なら表紙と画像から作ります |

- 文字コードは UTF-8（BOM付き）。Excel / Numbers / Google スプレッドシートでそのまま開けます。
- 複数の値（themes, medium, pillar）は `; ` 区切り。`pillar` は installation / portraits / other（アーカイブの「Installations」「Portraits of Places」欄）。TRUE/FALSE は featured と bookshelf の列。
- `visibility` が `private` の作品は表示しません。`partial` は表紙画像1枚だけを表示します。
- 画像の並び順は `cover` → `gallery_*` / `documentation_*` → その他（ファイル名順）。
- 読み込めないファイルや真っ白な画像はスキップし、最後に一覧で表示します。
- 文字色（トップの写真の上）は画像ごとに明るさを測って自動で決まります。
- 注意：日本語フォントが埋め込まれていないPDFは、ページの日本語が欠けることがあります。
  その場合は `books.csv` で `images` を選ぶか、フォントを埋め込んだPDFに差し替えてください。

## 本番への切り替え（確認後）

`next/` の中身でよければ、ルートの `index.html` / `styles.css` / `app.js` を
`record/` などに退避してから、`next/` を新しいトップにします
（PDFへのリンクは `../archive/...` を参照しているので、移動時はパスの調整が必要です）。
