# byzamil — Personal Portfolio

Website portofolio personal statis untuk `byzamil`, dibuat menggunakan HTML, CSS, dan JavaScript tanpa backend atau CMS. Versi ini menggunakan foto portrait transparan dan layout responsif yang dioptimalkan untuk desktop serta perangkat mobile.

## Halaman
- `index.html` — Home
- `projects.html` — Projects
- `notes.html` — Notes
- `about.html` — About
- `contact.html` — Contact

## Aset
- `assets/styles.css` — gaya visual, tipografi, dan responsive layout
- `assets/site.js` — navigasi mobile, filter proyek, dan tahun footer
- `assets/images/zamil-portrait.webp` — foto portrait transparan yang dioptimalkan untuk web

## Menjalankan secara lokal
Buka `index.html` di browser atau jalankan server lokal dari folder proyek:

```bash
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000`.

## Deployment Netlify
1. Unggah isi folder ini ke repositori GitHub baru.
2. Impor repositori tersebut di Netlify.
3. Karena ini website statis, biarkan build command kosong dan gunakan publish directory `.`.
4. Uji URL preview di desktop dan ponsel sebelum menghubungkan domain sendiri.

## Catatan sebelum publikasi
- Kontak di halaman Contact sudah terisi (email, Instagram, TikTok, WhatsApp); periksa kembali tautan sebelum publikasi.
- Periksa isi profil dan pastikan setiap klaim sesuai pengalaman nyata.
- Tambahkan proyek sebagai studi kasus hanya jika peran, status, dan hasilnya dapat dijelaskan secara akurat.
- Foto dan catatan internal tidak boleh dipublikasikan tanpa memeriksa izin serta privasi.

## Teknologi
HTML, CSS, JavaScript, Google Fonts (DM Sans, Manrope, DM Mono), Netlify.
