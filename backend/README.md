# Layanan Backend (Node.js & Express)

Folder ini berisi kode backend untuk aplikasi Signbank-AI yang dibangun menggunakan Node.js dan Express. Backend ini mengelola autentikasi pengguna, penyimpanan data kamus isyarat keuangan, dan integrasi caching serta database.

## Teknologi Utama
- **Express**: Framework web Node.js yang minimalis dan fleksibel.
- **PostgreSQL**: Database relasional utama untuk menyimpan data pengguna, kamus, dan metadata.
- **node-pg-migrate**: Tool untuk melakukan migrasi database PostgreSQL secara terstruktur.
- **JSON Web Tokens (JWT) & bcrypt**: Digunakan untuk pengamanan autentikasi dan enkripsi kata sandi.

## Struktur Folder Utama
- `src/server.js`: Titik masuk utama aplikasi untuk mendengarkan port (default: 3000).
- `src/routes/`: Definisi endpoint API.
- `src/services/`: Logika bisnis dan interaksi dengan database / pihak ketiga.
- `src/middlewares/`: Penanganan error, validasi input, serta verifikasi otentikasi.
- `migrations/`: Berkas migrasi database SQL menggunakan `node-pg-migrate`.

## Cara Instalasi & Menjalankan

1. **Instal Dependensi**
   ```bash
   npm install
   ```

2. **Pengaturan Variabel Lingkungan**
   - Salin dan ubah konfigurasi `.env` sesuai dengan konfigurasi PostgreSQL lokal Anda.

3. **Menjalankan Migrasi Database**
   ```bash
   npm run migrate up
   ```

4. **Menjalankan Server dalam Mode Pengembangan**
   ```bash
   npm run start:dev
   ```
   Secara default, server backend akan berjalan pada [http://localhost:3000](http://localhost:3000).
