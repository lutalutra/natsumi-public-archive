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

## データの更新

作品データは今まで通り、ルートの `app.js` 内の `const PROJECTS = [...]` が元です。
画像は各プロジェクトの `images/public/` に置きます。更新したら、リポジトリのルートで:

    pip install pillow
    python3 next/tools/build.py

- `visibility` が `private` の作品は表示しません。`partial` は表紙画像1枚だけを表示します。
- 画像の並び順は `cover` → `gallery_*` / `documentation_*` → その他（ファイル名順）。
- `thumb` / `thumbnail` / `cover 2` は表紙の重複として除外します。
- 読み込めないファイルはスキップし、最後に一覧で表示します。

## トップのスライドショーとインデックスの設定

`next/tools/site-config.json` を編集して `build.py` を実行し直します。

- `hero`：トップに出す画像と順番。`["A_ART014", 0]` は A_ART014 の0番目（cover）の画像。
  文字色は画像ごとに明るさを測って自動で決まります（暗い写真は白、明るい写真は濃いグレー）。
- `projects`：インデックスの「スタジオのプロジェクト」欄に出す今後のプロジェクト
  （tegote、FAULTIER commons、kulage）。作家活動・デザイン（natyama）とは別の欄に表示されます。
  `status` は planned / ongoing / done、`end` が null なら継続中として右端まで伸びます。

インデックスの行分け：作家活動はテーマ（場所と記憶、語りとアーカイブ、あいだ、文化媒介、その他）、
デザインは制作物の種類（編集・印刷物、Web・アプリ、コンテンツ制作）で自動的に振り分けます。

## 本番への切り替え（確認後）

`next/` の中身でよければ、ルートの `index.html` / `styles.css` / `app.js` を
`record/` などに退避してから、`next/` を新しいトップにします
（PDFへのリンクは `../archive/...` を参照しているので、移動時はパスの調整が必要です）。
