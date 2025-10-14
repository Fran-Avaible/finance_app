
# 🤖 FINANCE MANAGER SUPER APP v3.0.0 (IndexedDB Edition)
Aplikasi Manajemen Keuangan Pribadi Single-Page Application (SPA) berbasis Vanilla JavaScript dan HTML5. Versi ini telah dimigrasikan untuk menggunakan **IndexedDB**, database sisi klien yang lebih kuat dan andal untuk kontrol penuh atas keuangan pengguna.

---

### 🚀 **Fitur Utama**
Aplikasi ini beroperasi sepenuhnya secara offline (data disimpan di browser Anda) dan menawarkan serangkaian alat keuangan yang komprehensif:

* **💵 Multi-Wallet Management**: Kelola Kas, Rekening Bank, dan Dompet Digital dengan mudah.
* **🎯 Budgeting & Goals**: Tetapkan target anggaran bulanan untuk pengeluaran dan lacak progres tabungan.
* **🏦 Liabilitas & Tagihan**: Catat hutang, lacak jadwal pembayaran, dan kelola pengingat tagihan bulanan.
* **🪙 Portfolio Emas**: Lacak investasi emas (dalam gram) dan hitung keuntungan/kerugian (Profit/Loss).
* **🎨 Personalisasi Lanjutan**: Kontrol penuh atas tampilan aplikasi dengan skema warna, tipografi, dan efek yang dapat disesuaikan.
* **🗓️ Kalender Terintegrasi**: Lihat riwayat transaksi dan kelola jadwal pribadi dalam satu tampilan kalender yang intuitif.
* **💾 Manajemen Data**: Fitur Backup dan Restore data lengkap dalam format `.json` untuk memastikan data Anda aman.

---

### 🛠️ **Arsitektur & Teknologi**
Aplikasi ini dibangun dengan arsitektur modular yang rapi, memfasilitasi pemeliharaan dan skalabilitas.

* **Teknologi Inti**: Vanilla JavaScript (ES Modules), HTML5, CSS3, dan **IndexedDB API**.
* **Organisasi Kode**: Menggunakan pola ES Modules (`import`/`export`) untuk pemisahan *logic* yang bersih (`main.js`, `utils.js`, `database.js`, dll.).
* **Penyimpanan Data**: Mengandalkan **IndexedDB** secara eksklusif untuk persistensi data, memungkinkan penyimpanan yang lebih besar dan terstruktur dibandingkan `localStorage`.
* **Visualisasi Data**: Menggunakan pustaka **Chart.js** untuk laporan visual yang dinamis (di modul Reports).

---

### ⚙️ **Instalasi dan Deployment**
Karena ini adalah *static website*, instalasi sangat sederhana:

#### 1. Lokal (Untuk Pengembangan)
* *Clone* repositori ini.
* Buka file `index.html` menggunakan *live server* (seperti ekstensi Live Server di VS Code) atau langsung di browser Anda.

#### 2. Deployment Gratis (GitHub Pages)
Anda dapat menghosting aplikasi ini di GitHub Pages secara gratis:
* *Push* semua file ke *branch* `main` Anda.
* Buka **Settings -> Pages** di repositori Anda.
* Pilih *branch* `main` dan folder `/(root)`.
* Klik **Save**. Aplikasi Anda akan *live* dalam beberapa menit.

---

### ⚠️ **Peringatan Penting (Data)**
* **Data Offline**: Semua data keuangan Anda hanya disimpan di IndexedDB pada browser Anda. Data tidak pernah dikirim ke server mana pun.
* **Reset Data**: Jika Anda menghapus data situs dari browser, data Anda akan hilang. Selalu gunakan fitur **Backup LENGKAP** (file `.json`) yang tersedia di tab **Settings** secara teratur.
* **Integritas Data**: Migrasi ke IndexedDB mengurangi risiko kehilangan data yang sering terjadi pada `localStorage` yang memiliki kapasitas terbatas.

---

### 🗺️ **Masa Depan Aplikasi**
Dengan fondasi yang solid menggunakan IndexedDB, fokus pengembangan selanjutnya adalah penambahan fitur analitik yang lebih canggih dan peningkatan pengalaman pengguna, sambil tetap mempertahankan filosofi aplikasi yang cepat, privat, dan sepenuhnya *offline*.
