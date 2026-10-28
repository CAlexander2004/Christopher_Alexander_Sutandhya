# Panduan Pembaruan Keamanan dan Publish Cepat — Xander Portfolio V2

## Ringkasan perbaikan

1. **Privasi data:** JSON publik disusun melalui daftar field yang boleh tampil. Item dengan opsi **Visible on public website = Off** tidak masuk ke JSON ataupun JS offline yang dipublish. Item tersebut hanya tersimpan sebagai draft di browser Anda. Seluruh konten yang memang ingin ditampilkan kepada HRD tetap dapat dibaca publik, termasuk file JSON dan histori commit repository.
2. **Token GitHub tidak perlu ditempel ulang:** Anda dapat menyimpan token **terenkripsi AES-256-GCM** di browser, menggunakan frasa sandi vault terpisah minimal 12 karakter. Saat login berikutnya, cukup masukkan frasa sandi dan klik **Unlock saved token**. Token *tidak* otomatis terbuka setelah refresh, sebagai perlindungan terhadap pencurian dari penyimpanan browser.
3. **Deploy lebih efisien:** JSON dan offline fallback diperbarui dalam **satu commit**, bukan dua. Jika tidak ada perubahan data publik, CMS tidak membuat commit. Ini mengurangi pekerjaan/deployment berulang; antrean GitHub Pages tetap bisa memerlukan waktu dan tidak dapat dipercepat secara terjamin dari JavaScript.
4. **Perlindungan tambahan:** Content Security Policy (CSP), pemindahan script pemeriksaan sesi admin ke JS eksternal, dan export data terbatas.

## A. Cara UPDATE file di repository yang sudah online (PENTING)

Repository: `CAlexander2004/Christopher_Alexander_Sutandhya`, branch `main`, GitHub Pages diaktifkan seperti sebelumnya.

**Gunakan paket `Xander_Portfolio_PATCH_ONLY.zip`, jangan mengganti folder `data/`!** File JSON pada ZIP penuh berasal dari salinan yang Anda upload dan **mungkin sudah tidak sama dengan data production terbaru**. Menimpanya dapat mengembalikan wording ke versi lama.

**Cara aman via GitHub Desktop (direkomendasikan):**

1. Unduh dan install GitHub Desktop: https://desktop.github.com/ (jika belum ada).
2. Login menggunakan akun GitHub milik sendiri. Menu **File → Clone repository** → pilih `CAlexander2004/Christopher_Alexander_Sutandhya` → Clone.
3. Ekstrak ZIP **PATCH_ONLY**. Buka folder hasil clone. Salin **isi** ZIP patch ke root repository hasil clone, gabungkan folder `js/` dan timpa file yang namanya sama. Tidak ada file `data/` dalam patch.
4. Di GitHub Desktop, periksa tab Changes: hanya file kode/panduan yang berubah. **Pastikan `data/portfolio.json` dan `data/portfolio-fallback.js` tidak berubah.**
5. Isi commit message: `fix: encrypted token vault, public JSON whitelist, single-commit publishing`.
6. Klik **Commit to main**, lalu **Push origin**. Tidak perlu membuat repository baru, tidak perlu mengganti pengaturan Pages atau token GitHub.
7. Tunggu workflow **Actions → pages build and deployment** selesai, lalu refresh website dan CMS (Ctrl+F5) supaya file JavaScript baru termuat.

Bila ingin menggunakan GitHub Web, buka repo → **Add file → Upload files**, unggah *isi ZIP PATCH_ONLY* dalam struktur folder yang sama, review path yang akan ditimpa lalu Commit changes. Jangan upload ZIP mentah atau folder pembungkus.

## B. Aktifkan penyimpanan token terenkripsi (satu kali saja)

1. Buka website → **Sign In** → **GitHub & Publish**.
2. Isi Owner `CAlexander2004`, Repository `Christopher_Alexander_Sutandhya`, Branch `main`.
3. Tempel **fine-grained Personal Access Token** GitHub seperti sebelumnya.
4. Buat frasa sandi **vault** baru dan terpisah, minimal 12 karakter, panjang serta unik. Jangan gunakan password GitHub / password CMS yang sama. Simpan dengan aman di password manager.
5. Klik **Test & connect**. Jika berhasil, akan tertulis **Connected to GitHub as ...**, dengan informasi bahwa token tersimpan secara terenkripsi di browser ini.
6. Reload CMS: status berubah menjadi **Encrypted GitHub token saved on this device**. Isi *hanya* frasa sandi vault dan klik **Unlock saved token**. Anda tidak perlu menempelkan token GitHub kembali.
7. Jika ingin menghapus token tersimpan dari perangkat, klik **Forget saved token**. Tombol **Disconnect** hanya memutus koneksi tab saat ini.

**Keamanan:** Vault ini membantu menghindari penyimpanan token polos. Namun JavaScript yang berjalan di situs yang sama tetap dapat mencoba mencuri token setelah Anda membuka vault. Jangan gunakan di perangkat umum. Token memiliki izin menulis repository; gunakan masa kedaluwarsa pendek, `Only select repositories`, `Contents: Read and write` saja, dan cabut token dari GitHub bila perangkat terkompromi. Reset cache browser menghapus vault.

## C. Uji publish satu commit

1. Setelah Unlock atau Test & connect berhasil, ubah satu kalimat di menu **Profile & About**. Klik Preview.
2. Buka **GitHub & Publish** → **Publish changes (one commit)**.
3. Periksa URL commit yang diberikan CMS: harus hanya **1 commit** dengan perubahan pada **dua file**: `data/portfolio.json` dan `data/portfolio-fallback.js`.
4. Periksa halaman **Actions → pages build and deployment**. Setelah deployment selesai, refresh website.
5. Pengujian privasi opsional: tandai satu proyek **Visible on public website = Off** → Publish → lihat `data/portfolio.json`: item proyek tersebut tidak boleh muncul di JSON. Konten draft tersembunyi tetap tersimpan di browser CMS dan perlu diekspor sebagai backup jika ingin dibawa ke perangkat lain.
6. Bila CMS berkata **No changes to public content**, tidak ada commit baru dan tidak ada deployment karena data yang terlihat pengunjung tidak berubah.

## D. Batasan keamanan & performa yang wajib dipahami

- `https://.../data/portfolio.json` **tetap dapat dibuka publik**. Ini bukan celah khusus aplikasi: browser perlu mengunduh data yang akan ditampilkan dan repository-nya publik. Menyembunyikan nama file, mengganti ekstensi, atau menambahkan `robots.txt` tidak membuat data menjadi rahasia.
- Jangan masukkan informasi internal perusahaan, data pribadi sensitif, kredensial, atau dokumen non-publik ke website/repository. File yang pernah ter-commit masih dapat dibaca melalui riwayat Git meskipun sudah dihapus dari commit terbaru. Untuk informasi yang benar-benar rahasia, diperlukan layanan autentikasi/backend atau arsitektur repository privat yang berbeda.
- Password Sign In berbasis JavaScript **hanya membatasi penggunaan UI**; otorisasi update sungguhan berasal dari izin GitHub API.
- Durasi GitHub Pages setelah commit bergantung pada antrean/layanan GitHub. Satu commit menghindari dua deploy, **bukan jaminan update instan**.
- Jangan mengirimkan token, frasa sandi vault, atau file penyimpanan browser melalui chat/screenshot.

## E. Pemulihan cepat

- **Token lama tidak tersimpan:** Token dari versi sebelumnya memang *tidak* disimpan. Tempel token yang masih aktif **sekali** di versi ini dan buat vault.
- **Vault salah passphrase:** Gunakan passphrase yang tepat. Jika lupa, klik Forget saved token, lalu masukkan token GitHub baru dan buat vault baru.
- **GitHub 403/404:** Cek owner/repo/branch, token expiry, dan permission `Contents: Read and write`.
- **Publish gagal karena concurrent update:** Refresh draft/published JSON, pastikan perubahan tidak hilang, lalu coba lagi. Jangan memaksa rewrite branch.
- **Konten belum berubah:** cek commit & GitHub Actions; lakukan Ctrl+F5 setelah deployment berhasil.
