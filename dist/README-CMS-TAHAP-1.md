# byzamil CMS — Tahap 1 (fondasi admin)

Paket ini menambahkan fondasi dashboard Decap CMS ke situs statis yang sudah ada. Desain halaman publik tidak diubah pada tahap ini.

## Yang sudah disiapkan
- `/admin/` sebagai pintu dashboard CMS.
- Decap CMS dengan backend GitHub untuk `ainulzml/byzamil` pada branch `main`.
- Editorial workflow agar konten disimpan sebagai perubahan/draf dan tidak terbit ke branch utama sebelum disetujui.
- Koleksi Notes dan Projects.
- Folder unggahan gambar `public/uploads/`.

## Penting: tahap ini belum selesai untuk publikasi produksi
Konfigurasi autentikasi GitHub harus diselesaikan di Netlify sebelum login berfungsi. Selain itu, halaman publik yang sekarang masih berupa HTML statis belum dimigrasikan untuk membaca konten Notes/Projects dari folder `content/`. Jadi jangan menganggap membuat konten di CMS pada tahap ini akan otomatis menampilkannya di halaman publik. Itu adalah tahap integrasi berikutnya.

## Konfigurasi autentikasi yang dibutuhkan
1. Di GitHub, buat OAuth App khusus untuk CMS ini.
2. Authorization callback URL: `https://api.netlify.com/auth/done`.
3. Di Netlify, buka pengaturan OAuth provider untuk GitHub dan masukkan Client ID serta Client Secret dari OAuth App.
4. Jangan memasukkan Client Secret ke `admin/config.yml`, HTML, atau file publik.
5. Di pengaturan akses Netlify Identity, gunakan invite-only dan undang hanya akun pemilik. Jangan mengaktifkan pendaftaran publik.
6. Deploy Preview dahulu. Uji login dan editorial workflow sebelum memakai dashboard untuk konten asli.

Jika opsi GitHub OAuth provider tidak tersedia pada pengaturan situs Netlify kamu, berhenti dan jangan mengganti backend menjadi Git Gateway sebagai jalan pintas. Git Gateway sudah deprecated. Kita perlu memilih metode autentikasi yang didukung pada konfigurasi akun saat ini.

## Deploy dengan aman
1. Buat salinan ZIP dan pastikan situs saat ini masih bisa dipulihkan.
2. Unggah file tambahan ini ke repositori melalui Codespaces.
3. Commit pada branch terpisah, misalnya `cms-foundation`, lalu push.
4. Periksa Deploy Preview; jangan langsung mengubah branch `main`.
5. Setelah autentikasi diverifikasi, lanjutkan ke integrasi frontend.

## Batasan tahap 1
- CMS belum mengelola Home, About, Contact, atau metadata SEO.
- Konten Notes dan Projects belum terhubung ke render halaman publik.
- Belum ada artikel contoh yang dipublikasikan.

## Pembaruan implementasi
Lihat `README-CMS-IMPLEMENTASI.md` untuk langkah integrasi build, publikasi langsung di branch `cms-foundation`, dan pengujian Netlify.
