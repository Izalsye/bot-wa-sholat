# 🕌 Bot-WA-Sholat - WhatsApp Jadwal Sholat API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PHP Version](https://img.shields.io/badge/PHP-7.0%2B-blue.svg)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-5.6%2B-orange.svg)](https://www.mysql.com/)

BotWASholat adalah webhook WhatsApp yang memudahkan umat Muslim untuk mengecek jadwal sholat di seluruh Indonesia. Dengan antarmuka WhatsApp yang sederhana, pengguna dapat mengakses jadwal sholat kapan saja dan di mana saja.

## ✨ Fitur

- **🕒 Jadwal Sholat Lengkap**: Tampilkan jadwal sholat untuk lebih dari 500 kota di Indonesia
- **🔍 Pencarian Kota**: Temukan kota dengan mudah melalui kata kunci
- **⏰ Waktu Sholat Selanjutnya**: Dapatkan informasi waktu sholat yang akan datang berikutnya
- **📊 Perbandingan Jadwal**: Bandingkan jadwal sholat antara dua kota (Ideal untuk musafir)
- **🌟 Personalisasi**: Simpan kota default untuk akses cepat
- **👤 Multi User**: Mendukung banyak pengguna dengan preferensi terpisah
- **🎨 UI Responsif**: Tampilan menggunakan tombol dan template untuk UX yang lebih baik

## 🚀 Cara Menggunakan

### Perintah yang Tersedia:

| Perintah | Deskripsi |
|----------|-----------|
| `/jadwal <namaKota>` | Menampilkan jadwal sholat untuk kota tertentu |
| `/jadwal` | Menampilkan jadwal untuk kota default (jika sudah diatur) |
| `/carikota <keyword>` | Mencari kota berdasarkan kata kunci |
| `/setkota <namaKota>` | Menyimpan kota default untuk pengguna |
| `/bandingkan <kota1> <kota2>` | Membandingkan jadwal sholat antara dua kota |
| `/waktu` | Menampilkan waktu sholat yang akan datang berikutnya |
| `/info` | Menampilkan bantuan dan informasi tentang bot |

## 📋 Prasyarat

- Node Js 18 - 20
- PHP 7.0+
- MySQL 5.6+
- Layanan Webhook WhatsApp

## ⚙️ Instalasi

1. Clone repository ini
   ```bash
   git clone https://github.com/classyid/SholatBot-WhatsApp.git
   cd sholat-bot
   ```

2. Import skema database
   ```bash
   mysql -u username -p < database-schema.sql
   ```

3. Edit konfigurasi
   ```php
   // Menyimpan variabel konfigurasi global
    global.sessionName = 'izalsye-server'; //Ganti
    global.linkwebhook = 'http://localhost/SholatBot-WhatsApp/'; //Ganti
    global.database = 'wabot'; //Ganti
    global.username = 'root'; //Ganti
    global.password = ''; //Ganti
    global.owner = ['6282229738027'] //Ganti
    global.botName = 'Izalsye' //Ganti
   ```

4. Upload file ke server web Anda
5. Konfigurasi webhook WhatsApp Anda untuk mengarah ke URL file ini

## 🧩 Struktur Proyek

```
bot-wa-sholat/
├── db 
    ├──config.js           # File configurasi 
├── index.js               # File connection bot via baileys
├── izalsye.js             # File responded pesan wa dan diteruskan ke index.php
├── index.php              # File utama webhook
├── ResponWebhookFormatter.php  # Kelas untuk memformat respons WhatsApp
├── database-schema.sql    # Skema database
└── README.md              # Dokumentasi
```

## 🔄 API yang Digunakan

Bot ini menggunakan API jadwal sholat dengan endpoint berikut:

- Jadwal Sholat: `https://script.google.com/macros/s/AKfycbx8CtuEFQrYxM5sF2pZYvjrcIQa4Mj25lO6BUVqFHrhURw05bg06dBtpeYtvax5NIi1/exec?kota={namaKota}`
- Daftar Kota: `https://script.google.com/macros/s/AKfycbx8CtuEFQrYxM5sF2pZYvjrcIQa4Mj25lO6BUVqFHrhURw05bg06dBtpeYtvax5NIi1/exec?action=daftar-kota`

## 📱 Contoh Penggunaan

### Melihat Jadwal Sholat
Kirim pesan `/jadwal surabaya` untuk melihat jadwal sholat di Surabaya.

### Mencari Kota
Kirim pesan `/carikota bandung` untuk mencari kota dengan kata kunci "bandung".

### Menyimpan Kota Default
Kirim pesan `/setkota jakarta` untuk menyimpan Jakarta sebagai kota default Anda.

### Membandingkan Jadwal
Kirim pesan `/bandingkan jakarta surabaya` untuk membandingkan jadwal sholat antara Jakarta dan Surabaya.

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan fork repository ini, buat branch fitur baru, dan kirimkan pull request.

## 📜 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file [LICENSE](LICENSE) untuk detailnya.

## 📞 Kontak

Jika Anda memiliki pertanyaan atau saran, silakan buka issue baru atau hubungi saya melalui email: kontak@classy.id
