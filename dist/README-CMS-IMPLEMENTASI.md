# byzamil CMS — integrasi dan publikasi langsung

## Apa yang berubah
- Decap CMS memakai publikasi langsung (tanpa `editorial_workflow`).
- Backend CMS tetap menulis ke branch `cms-foundation` selama pengujian.
- Netlify menjalankan `node scripts/build.mjs` dan menerbitkan folder `dist/`.
- Build memproses frontmatter dan body Markdown dari `content/notes/` dan `content/projects/`.
- `notes.html` menampilkan catatan CMS dan `projects.html` menampilkan proyek CMS tanpa mengganti halaman lain.
- Unggahan dari `public/uploads/` disalin ke `/uploads/` di hasil build.
- Build menggunakan Node.js built-in, tidak memerlukan `package.json` atau paket npm tambahan.

## Terapkan di Codespaces
1. Pastikan branch aktif `cms-foundation` dan working tree bersih.
2. Simpan salinan ZIP/commit saat ini sebagai cadangan.
3. Unggah dan ekstrak isi paket ini ke root repositori `/workspaces/byzamil`, menimpa file dengan nama sama. Jangan menghapus file lain yang tidak ada di paket.
4. Pastikan file berikut ada: `scripts/build.mjs`, `netlify.toml`, `admin/config.yml`, `notes.html`, `projects.html`.
5. Jalankan build lokal:

   ```bash
   node --version
   node scripts/build.mjs
   ```

   Pesan akhir harus menyebut jumlah notes/projects yang diproses. Periksa hasil `dist/notes.html` dan `dist/projects.html`.
6. Jalankan pemeriksaan:

   ```bash
   grep -n "publish_mode" admin/config.yml
   git status --short
   ```

   `grep` seharusnya tidak menemukan `publish_mode`.
7. Review perubahan, lalu commit dan push hanya ke branch pengembangan:

   ```bash
   git add admin/config.yml netlify.toml notes.html projects.html scripts/build.mjs README-CMS-IMPLEMENTASI.md
   git commit -m "Integrate CMS content with static site build"
   git push origin cms-foundation
   ```

   Jika ada konten baru atau perubahan lain yang memang ingin disertakan, periksa `git status --short` dan tambahkan secara selektif sebelum commit. Jangan gunakan `git add .` tanpa meninjau daftar perubahan.

## Uji di Netlify
1. Tunggu deploy branch `cms-foundation` selesai. Periksa log build; pastikan perintah `node scripts/build.mjs` berhasil.
2. Buka **branch deploy URL** untuk `cms-foundation`, bukan URL Deploy Preview dari PR lama. Format URL biasanya `https://cms-foundation--NAMA-SITUS.netlify.app`; gunakan URL yang ditampilkan di Netlify.
3. Buka `/admin/` pada branch deploy tersebut. Login dan buat catatan uji baru, lalu tekan Publish.
4. Pastikan commit konten masuk ke `cms-foundation`, Netlify memulai build baru, dan konten muncul di halaman `/notes.html` pada branch deploy. Uji juga koleksi Projects.
5. Setelah pengujian, hapus catatan percobaan `Tes CMS` melalui CMS jika tidak ingin konten itu dipertahankan. Build ini menampilkan semua berkas Markdown di koleksi, termasuk yang berkategori Testing.

## Batasan dan keamanan
- **Jangan ubah backend CMS ke `main` selama pengujian.** Semua publikasi CMS pada konfigurasi ini menulis langsung ke `cms-foundation`.
- Perubahan di branch `cms-foundation` tidak otomatis mengubah `https://byzamil.web.id`, karena production branch tetap `main`.
- Sebelum peluncuran, review dan merge perubahan kode ke `main` melalui PR. Sesudah integrasi produksi siap, ubah backend CMS ke `main` dalam perubahan terpisah dan terencana.
- Jangan masukkan Client Secret OAuth ke repositori, HTML, atau `admin/config.yml`.
- Build ini memproses Markdown dasar: paragraf, heading, daftar, bold, italic, inline code, dan tautan HTTP(S). Untuk tabel, gambar inline, atau fitur Markdown lebih kompleks, perlu penambahan parser yang sesuai.
