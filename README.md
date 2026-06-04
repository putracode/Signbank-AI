# Financial Sign Language (Signbank-AI)

Proyek ini adalah sistem penerjemah Bahasa Isyarat khususnya untuk istilah-istilah di bidang Keuangan (Financial Sign Language). Proyek ini merupakan Capstone Project yang bertujuan untuk meningkatkan inklusi keuangan bagi komunitas Tuli menggunakan teknologi AI.

## Struktur Repositori

Proyek ini terbagi menjadi 3 komponen utama:

1. **[ai](file:///d:/Kuliah/Dicoding/Capstone/Project/Financial%20Sign%20Language/ai)**: Layanan kecerdasan buatan berbasis Python menggunakan FastAPI, TensorFlow, dan MediaPipe untuk pengenalan/klasifikasi gerakan bahasa isyarat keuangan.
2. **[backend](file:///d:/Kuliah/Dicoding/Capstone/Project/Financial%20Sign%20Language/backend)**: Server backend berbasis Node.js & Express dengan database PostgreSQL.
3. **[frontend](file:///d:/Kuliah/Dicoding/Capstone/Project/Financial%20Sign%20Language/frontend)**: Aplikasi web antarmuka pengguna berbasis React dan Vite, ditata menggunakan Tailwind CSS.

---

## Petunjuk Menjalankan Proyek

### 1. Prasyarat (Prerequisites)
Pastikan Anda telah menginstal tools berikut di sistem Anda:
- Node.js (v18 atau lebih baru)
- Python (v3.9 s.d v3.11 direkomendasikan)
- PostgreSQL

### 2. Konfigurasi Lingkungan (Environment Variables)
- Konfigurasikan file `.env` di dalam folder `backend/` berdasarkan file konfigurasi yang ada.

### 3. Cara Memulai Pengembangan (Lokal)

#### Menjalankan Layanan AI
```bash
cd ai
# Buat virtual environment
python -m venv .venv
# Aktifkan virtual environment (Windows)
.venv\Scripts\activate
# Instal dependensi
pip install -r requirements.txt
# Jalankan server AI
python app.py
```

#### Menjalankan Backend
```bash
cd backend
# Instal dependensi
npm install
# Jalankan migrasi database (jika ada/diperlukan)
npm run migrate
# Jalankan server backend dalam mode pengembangan
npm run start:dev
```

#### Menjalankan Frontend
```bash
cd frontend
# Instal dependensi
npm install
# Jalankan aplikasi frontend
npm run dev
```

---