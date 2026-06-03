# Layanan Frontend (React + Vite)

Folder ini berisi kode frontend (antarmuka pengguna) untuk aplikasi Signbank-AI. Aplikasi ini dirancang dengan menggunakan React, Vite, dan Tailwind CSS untuk memberikan antarmuka yang modern, cepat, dan responsif.

## Fitur Utama
- **React + Vite**: Setup modern dengan Hot Module Replacement (HMR) berkinerja tinggi.
- **Tailwind CSS**: Penggunaan CSS utility-first untuk desain yang bersih dan responsif.
- **React Router Dom**: Manajemen navigasi halaman (routing).
- **FilePond**: Pengunggahan file berkas media (seperti video/gambar gerakan isyarat) dengan visualisasi yang menarik.
- **React Hook Speech-to-Text**: Pengenalan ucapan suara ke teks secara langsung untuk mendukung penerjemahan suara ke isyarat.
- **SweetAlert2 & React Hot Toast**: Untuk notifikasi visual yang interaktif kepada pengguna.

## Struktur Folder Utama
- `src/components/`: Komponen UI yang dapat digunakan kembali (Reusable Components).
- `src/pages/`: Halaman-halaman utama aplikasi (seperti Translator, Dictionary, Dashboard, Login/Register).
- `src/hooks/`: Custom React Hooks.
- `src/services/`: Berkas integrasi API/Axios ke server backend.
- `index.html` & `src/main.jsx`: Titik masuk rendering aplikasi React.

## Cara Instalasi & Menjalankan

1. **Instal Dependensi**
   ```bash
   npm install
   ```

2. **Menjalankan Server Pengembangan Lokal**
   ```bash
   npm run dev
   ```
   Secara default, aplikasi web dapat diakses melalui alamat lokal yang ditunjukkan di terminal (biasanya [http://localhost:5173](http://localhost:5173)).

3. **Membangun Aplikasi untuk Produksi**
   ```bash
   npm run build
   ```
   Hasil build akan disimpan di folder `dist/` untuk siap disajikan (deployment).
