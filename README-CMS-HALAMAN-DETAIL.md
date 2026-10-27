# CMS byzamil — Halaman Detail Notes dan Projects

## Perubahan
- Halaman `notes.html` kini berfungsi sebagai daftar ringkasan catatan. Isi penuh tidak lagi ditumpuk di kartu daftar.
- Setiap Note CMS menghasilkan halaman tersendiri di `/notes/<slug>.html`.
- Halaman `projects.html` tetap mempertahankan proyek statis yang sudah ada dan menambahkan kartu ringkasan untuk setiap Project CMS.
- Setiap Project CMS menghasilkan halaman tersendiri di `/projects/<slug>.html`.
- Halaman detail memuat judul, tanggal, kategori/status, ringkasan, sampul bila tersedia, isi Markdown, navigasi kembali, dan tautan ke konten lain.
- Penghapusan atau perubahan konten ikut tercermin pada build berikutnya karena seluruh halaman dibuat ulang dari folder `content/`.
- Konfigurasi CMS diarahkan ke branch produksi `main`.

## Cara menerapkan di Codespaces
1. Pastikan kamu berada di branch `main` dan sudah mengambil perubahan terbaru:
   ```bash
   git switch main
   git pull --ff-only origin main
   ```
2. Ekstrak ZIP pembaruan ini di komputer lokal, lalu salin file/folder dari dalam `byzamil-cms-foundation/` ke root repo Codespaces `/workspaces/byzamil`, dengan menimpa file yang sama. Jangan hapus file atau folder lain yang tidak ada dalam ZIP.
3. Periksa `admin/config.yml` dan pastikan `backend.branch` bernilai `main`.
4. Jalankan build lokal:
   ```bash
   node scripts/build.mjs
   ```
5. Periksa output di `dist/notes.html`, `dist/notes/`, `dist/projects.html`, dan `dist/projects/`.
6. Commit dan push perubahan sumber (jangan commit folder `dist/` bila tidak dilacak oleh repo):
   ```bash
   git add scripts/build.mjs admin/config.yml README-CMS-HALAMAN-DETAIL.md
   git diff --cached --stat
   git commit -m "Generate individual CMS detail pages"
   git push origin main
   ```
7. Tunggu Netlify production deploy selesai. Tes halaman daftar dan detail di domain utama.

## Contoh URL
- Daftar Notes: `/notes.html`
- Detail Note: `/notes/kesuksesan-by-abah-auhadilah.html`
- Daftar Projects: `/projects.html`
- Detail Project: `/projects/sistem-administrasi-pondok.html` (slug mengikuti nama file CMS yang disimpan)

## Catatan
- Parser Markdown bawaan tetap ringan dan tanpa dependency. Mendukung heading, paragraf, daftar, bold, italic, inline code, serta tautan HTTP(S). Tabel Markdown, blockquote, gambar inline Markdown, dan fitur Markdown lanjutan belum didukung oleh parser ini.
- File CMS Notes menggunakan slug dari judul untuk URL, sedangkan Projects menggunakan nama file/slug CMS. Jika judul Notes berubah, URL detail dapat berubah; pertimbangkan field slug permanen/redirect sebelum mengubah judul artikel yang sudah banyak dibagikan.
- Halaman detail menyertakan metadata Open Graph dasar. URL canonical eksplisit dan sitemap dinamis belum ditambahkan pada perubahan ini.
