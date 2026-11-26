#!/bin/bash
# JALANKAN DI CODESPACES - ROOT REPO ainulzml/byzamil (branch main)
# Sudah live di Cloudflare Pages/Workers, update kode biar header & CMS jalan
set -e
git checkout main
git pull origin main

echo "1. Update public/_headers (pengganti netlify.toml headers)"
mkdir -p public
cat > public/_headers <<'EOF'
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/assets/*
  Cache-Control: public, max-age=604800
EOF
echo "✓ public/_headers dibuat"

echo "2. Patch scripts/build.mjs biar copy _headers ke dist/"
cp scripts/build.mjs scripts/build.mjs.bak
python3 << 'PY'
import pathlib
p = pathlib.Path('scripts/build.mjs')
t = p.read_text()
# byzamil build.mjs: copySite(ROOT, OUT) exclude public, lalu copy uploads
# Kita sisipkan copy _headers setelah copy uploads
old = "if (fs.existsSync(uploadSource)) fs.cpSync(uploadSource, path.join(OUT, 'uploads'), { recursive: true });"
new = old + "\nconst headersSource = path.join(ROOT, 'public', '_headers');\nif (fs.existsSync(headersSource)) fs.copyFileSync(headersSource, path.join(OUT, '_headers'));"
if old in t and "headersSource" not in t:
    p.write_text(t.replace(old, new))
    print("✓ scripts/build.mjs dipatch")
else:
    print("✓ build.mjs sudah ada / skip patch")
PY

echo "3. Update admin/config.yml (ganti Netlify OAuth → Worker OAuth)"
echo "   PENTING: Ganti URL di bawah dengan URL Worker kamu setelah deploy OAuth"
# Contoh URL worker - GANTI INI setelah kamu deploy
OAUTH_URL="https://byzamil-oauth.REPLACE.workers.dev"
cat > admin/config.yml <<EOF
# Decap CMS — byzamil (Cloudflare Pages)
backend:
  name: github
  repo: ainulzml/byzamil
  branch: main
  base_url: $OAUTH_URL
  auth_endpoint: auth

media_folder: "public/uploads"
public_folder: "/uploads"
site_url: https://byzamil.web.id
logo_url: /assets/favicon.svg
locale: id
show_preview_links: true

collections:
  - name: "notes"
    label: "Notes"
    label_singular: "Note"
    folder: "content/notes"
    create: true
    delete: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    extension: "md"
    format: "frontmatter"
    summary: "{{title}} — {{date | date('DD MMM YYYY')}}"
    sortable_fields: ["date", "title"]
    fields:
      - { label: "Judul", name: "title", widget: "string" }
      - { label: "Ringkasan", name: "description", widget: "text" }
      - { label: "Tanggal", name: "date", widget: "datetime", format: "YYYY-MM-DD", date_format: "DD MMM YYYY", time_format: false }
      - { label: "Kategori", name: "category", widget: "string" }
      - { label: "Gambar sampul", name: "cover", widget: "image", required: false }
      - { label: "Isi", name: "body", widget: "markdown" }

  - name: "projects"
    label: "Projects"
    label_singular: "Project"
    folder: "content/projects"
    create: true
    delete: true
    slug: "{{slug}}"
    extension: "md"
    format: "frontmatter"
    summary: "{{title}} — {{status}}"
    sortable_fields: ["title", "date"]
    fields:
      - { label: "Nama proyek", name: "title", widget: "string" }
      - { label: "Ringkasan", name: "description", widget: "text" }
      - { label: "Tanggal", name: "date", widget: "datetime", format: "YYYY-MM-DD", date_format: "DD MMM YYYY", time_format: false }
      - { label: "Kategori", name: "category", widget: "select", options: ["digital", "strategy", "experiments"] }
      - { label: "Status", name: "status", widget: "select", options: ["ongoing", "completed", "paused"] }
      - { label: "Tautan proyek", name: "project_url", widget: "string", required: false }
      - { label: "Gambar", name: "cover", widget: "image", required: false }
      - { label: "Isi dokumentasi", name: "body", widget: "markdown" }
EOF
echo "✓ admin/config.yml diupdate (ingat ganti OAUTH_URL!)"

echo ""
echo "Test build..."
node scripts/build.mjs
ls -lh dist/_headers && echo "✓ dist/_headers OK"
ls -lh dist/admin/config.yml && echo "✓ admin config tercopy"

echo ""
git add public/_headers scripts/build.mjs admin/config.yml
git status
git commit -m "Migrasi Cloudflare Pages: _headers + CMS OAuth Worker"
git push origin main
echo ""
echo "Selesai — Cloudflare Pages akan auto-deploy 1-2 menit"
echo "JANGAN LUPA: deploy OAuth Worker dan ganti base_url di admin/config.yml dengan URL worker aslinya!"

