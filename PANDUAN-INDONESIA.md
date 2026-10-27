# Panduan Penggunaan — Xander Portfolio (Konsep A)

## Ringkasan arsitektur

- **Front-end:** `index.html`, `css/site.css`, dan `js/site.js`.
- **Data produksi utama:** `data/portfolio.json`.
- **Cadangan untuk dibuka langsung dari folder:** `data/portfolio-fallback.js`, salinan otomatis yang sudah disertakan.
- **CMS:** `Sign-In.html`, `admin.html`, `css/admin.css`, dan `js/admin.js`.
- **Hosting:** GitHub Pages, tanpa MySQL, PHP, maupun server backend milik sendiri.
- **Publikasi:** CMS mengirim commit perubahan `data/portfolio.json` ke repository melalui GitHub REST API; GitHub Pages memublikasikan perubahan dari branch yang diatur.

## Perbaikan versi ini — buka langsung dari folder tanpa server

Sekarang Anda dapat membuka `index.html` dengan double-click di Windows. Untuk menghindari pemblokiran `fetch()` oleh browser pada protokol `file://`, website membaca salinan data di `data/portfolio-fallback.js`. Foto asli juga tampil berwarna karena filter grayscale telah dihapus.

- **Online / localhost:** yang dibaca adalah `data/portfolio.json` terbaru (jika JSON gagal dimuat, fallback tetap tersedia).
- **Offline / double-click:** yang dibaca adalah `data/portfolio-fallback.js` yang dipaketkan dalam ZIP.
- **CMS lokal:** draft disimpan di browser, dan bisa diperiksa lewat tombol Preview. Agar file lokal permanen terbarui, gunakan Export JSON dan Export offline JS, lalu gantikan kedua file tersebut di folder `data/`. Hal ini merupakan batasan keamanan browser, bukan error.
- Untuk memperbarui kedua file tanpa coding: di CMS gunakan **Export JSON** dan **Export offline JS**, kemudian letakkan kedua file hasil unduhan dengan nama `portfolio.json` dan `portfolio-fallback.js` di folder `data/`. Saat Publish ke GitHub, CMS akan mengunggah file JSON terlebih dahulu lalu mencoba menyinkronkan JS snapshot secara otomatis.
- **GitHub Pages:** konten yang sudah dipublikasikan dibaca langsung dari file JSON di repository. Publikasi GitHub tetap mengikuti petunjuk di bawah.

## Langkah 1 — Upload project ke GitHub

1. Buat repository khusus portofolio Anda di GitHub.
2. Ekstrak file ZIP yang diberikan.
3. Upload **semua file dan folder di dalam** `Xander_Portfolio_Revamp_A/` ke **root repository**. Jangan mengunggah folder pembungkusnya saja.
4. Buka **Settings > Pages > Build and deployment**.
5. Pilih **Deploy from a branch** lalu pilih **main** dan **/(root)**, kemudian **Save**.
6. Setelah deployment selesai, buka URL portofolio Anda di GitHub Pages.

## Langkah 2 — Login ke CMS

1. Buka `https://AKUN-GITHUB.github.io/NAMA-REPOSITORY/Sign-In.html` (sesuaikan URL dengan repository yang dipakai).
2. Masukkan username CMS yang telah Anda tetapkan, **VIERXANVEL88**.
3. Masukkan password CMS yang telah Anda tentukan sebelumnya.
4. Setelah login berhasil, Anda akan diarahkan ke halaman dashboard CMS.

> **Penting:** Mekanisme login ini merupakan gerbang antarmuka (client-side), bukan proteksi backend. Pada GitHub Pages, setiap pengunjung tetap bisa mengunduh HTML/JS dari halaman CMS. **Keamanan perubahan production ditegakkan oleh hak tulis GitHub**, bukan oleh username/password JavaScript. Jika menginginkan CMS benar-benar tertutup dari publik, gunakan penyedia autentikasi/proxy eksternal atau backend.

## Langkah 3 — Ubah konten tanpa coding

1. Pilih menu yang ingin diubah: **Profile & About**, **Projects**, **Experience**, **Skills**, **Achievements**, **Certifications**, **Education**, **Appearance & SEO**, atau **Social & Contact**.
2. Ketik perubahan langsung pada field yang tersedia. Perubahan draft otomatis disimpan di browser yang Anda gunakan.
3. Untuk menambah item baru klik **+ Add new**. Gunakan tombol **↑** dan **↓** untuk mengubah urutan item.
4. Untuk menyembunyikan item di halaman pengunjung, matikan checkbox **Visible on public website**.
5. Klik **Preview** untuk melihat tampilan front-end sebelum dipublikasikan.

## Langkah 4 — Hubungkan GitHub untuk Publish

1. Di GitHub buka **Settings > Developer settings > Personal access tokens > Fine-grained tokens**, atau https://github.com/settings/personal-access-tokens/new.
2. Buat token baru. Berikan **Repository access: Only select repositories**, lalu pilih repository portofolio saja.
3. Pada **Repository permissions**, atur **Contents: Read and write**. Sebaiknya set tanggal kedaluwarsa dan aktifkan autentikasi dua faktor di akun GitHub.
4. Di CMS buka **GitHub & Publish**.
5. Isi **GitHub owner / account**, **Repository name**, **Publishing branch** (biasanya `main`), dan token.
6. Klik **Test & connect** hingga status terhubung.
7. Klik **Publish JSON changes** untuk menyimpan perubahan ke repository.
8. GitHub Pages akan melakukan deployment. **Tidak selalu instan**; sesuai dokumentasi GitHub, proses publikasi dapat memerlukan beberapa menit, bahkan hingga sekitar 10 menit.

**Token hanya digunakan dalam memori tab CMS yang sedang terbuka**, bukan disimpan di source code atau `localStorage`. Setelah refresh halaman, masukkan token dan lakukan koneksi lagi jika akan memublikasikan perubahan.

## Langkah 5 — Mengubah foto atau gambar

1. Hubungkan GitHub dahulu seperti pada Langkah 4.
2. Buka **Media Library** > pilih file gambar (PNG/JPG/WEBP/GIF/SVG, maksimum 2 MB) > klik **Upload to repository**.
3. Upload ini membuat commit file gambar secara langsung ke GitHub.
4. Salin path hasil upload, misalnya `assets/uploads/1730000000000-foto-saya.jpg`.
5. Buka editor konten yang menggunakan gambar tersebut; masukkan path ke field **Portrait image path**, **Project image / logo path**, dan sebagainya.
6. Klik **Preview** lalu **Publish JSON changes**.

## Backup dan pembaruan

- Gunakan **Export JSON backup** untuk menyimpan salinan lengkap sebelum melakukan perubahan besar.
- Gunakan **Import JSON backup** untuk mengembalikan draft dari file backup.
- Gunakan **Reload published JSON** untuk mengambil kembali data dari halaman production dan membuang draft saat ini.
- Riwayat commit dan pemulihan versi dapat dikelola melalui halaman repository GitHub.

## Hal yang perlu diperiksa sebelum melamar pekerjaan

- Perbarui pengalaman kerja terbaru dan tanggal yang benar, karena kode website lama belum mencantumkan semua informasi terkini.
- Periksa kembali status sertifikasi, prestasi, tautan dokumen, dan CV.
- Tambahkan tautan LinkedIn dan GitHub jika tersedia.
- Gunakan narasi *business problem → contribution → outcome* pada setiap project.
- Jangan mencantumkan alamat lengkap rumah, data pelanggan, atau dokumen internal perusahaan yang tidak boleh dipublikasikan.

Baca juga `README.md` untuk catatan teknis dan keamanan lebih lengkap.


## Tombol Sign In di header (pembaruan)

Di halaman portofolio `index.html`, tombol **Sign In** sekarang tersedia pada bagian kanan header untuk desktop maupun ponsel. Klik tombol tersebut untuk membuka `Sign-In.html` tanpa mengubah URL secara manual. Tombol dapat digunakan baik saat membuka website secara lokal (`file://`) maupun setelah dipublikasikan di GitHub Pages. Kredensial dan alur CMS tidak diubah.

Catatan: tombol publik merupakan jalur navigasi saja, bukan perlindungan keamanan. Hak untuk melakukan commit/publikasi ke repository tetap memerlukan otorisasi GitHub.
