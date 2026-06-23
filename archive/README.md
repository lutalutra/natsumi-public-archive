# Local Archive Placeholder Check

Put these files in the same folder as your `archive/` folder:

- index.html
- archive_current.tsv
- archive/

Then run:

python3 -m http.server 8000

Open:

http://localhost:8000

The page will:
- load archive_current.tsv
- build image paths from project_id / folder name
- show cover.jpg when it exists
- show placeholder when it does not

Expected cover path pattern:

archive/A_ART/A_ART001_About_My_Topos/images/public/cover.jpg
