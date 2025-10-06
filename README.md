# finance_super_app
Manage Balance

🤖 FINANCE MANAGER SUPER APP v2.1.0
Aplikasi Manajemen Keuangan Pribadi Single-Page Application (SPA) berbasis Vanilla JavaScript dan HTML5. Dirancang untuk memberikan kontrol penuh atas keuangan pengguna dengan penyimpanan data lokal (LocalStorage).

🚀 Fitur Utama
Aplikasi ini beroperasi sepenuhnya secara offline (data disimpan di browser Anda) dan menawarkan serangkaian alat keuangan yang komprehensif:

💵 Multi-Wallet Management: Kelola Kas, Rekening Bank, dan Dompet Digital dengan mudah.

🎯 Budgeting & Goals: Tetapkan target anggaran bulanan untuk pengeluaran dan lacak progres tabungan.

🏦 Liabilitas & Tagihan: Catat hutang, lacak jadwal pembayaran, dan kelola pengingat tagihan bulanan.

🪙 Portfolio Emas: Lacak investasi emas (dalam gram) dan hitung keuntungan/kerugian (Profit/Loss).

🖼️ Estetika V2.1.0 (BARU): Kontrol Tema Gelap/Terang dan fitur Custom Wallpaper (Fitur Plot).

📝 Quick Note (BARU): Fitur catatan mengambang cepat untuk ide atau pengeluaran mendadak.

💱 Kurs Mata Uang (BARU): Tab untuk melihat nilai tukar dan kalkulator konversi.

🛠️ Arsitektur & Teknologi
Aplikasi ini dibangun dengan arsitektur modular yang rapi sebagai persiapan untuk migrasi ke framework modern.

Teknologi Inti: Vanilla JavaScript (ES Modules), HTML5, CSS3.

Organisasi Kode: Menggunakan pola ES Modules (import/export) untuk pemisahan logic yang bersih (main.js, utils.js, database.js, dll.).

State Management: Mengandalkan localStorage secara eksklusif untuk persistensi data.

Visualisasi Data: Menggunakan pustaka Chart.js untuk laporan visual (di modul Reports).

⚙️ Instalasi dan Deployment
Karena ini adalah static website, instalasi sangat sederhana:

1. Lokal (Untuk Pengembangan)
Clone repositori ini: git clone https://vandal.elespanol.com/juegos/pc/repo/193985

Buka folder proyek.

Buka file index.html menggunakan live server (seperti ekstensi Live Server di VS Code) atau langsung di browser Anda.

2. Deployment Gratis (GitHub Pages)
Anda dapat menghosting aplikasi ini di GitHub Pages secara gratis:

Push semua file ke branch main Anda.

Buka Settings -> Pages di repositori Anda.

Pilih branch main dan folder /(root).

Klik Save. Aplikasi Anda akan live dalam beberapa menit.

⚠️ Peringatan Penting (Data)
Data Offline: Semua data keuangan Anda hanya disimpan di LocalStorage browser Anda. Data tidak pernah dikirim ke server mana pun.

Reset Data: Jika Anda menghapus cache atau menggunakan Private/Incognito Mode, data Anda akan hilang. Selalu gunakan fitur Backup LENGKAP (file .json) yang tersedia di tab Settings atau Dashboard secara teratur.

🗺️ Rencana Versi 3.0 (Plot Twist Reveal!)
Proyek ini akan segera beralih ke Versi 3.0, yang melibatkan migrasi ke framework modern (direkomendasikan Vue.js) untuk meningkatkan stabilitas dan fitur real-time.
