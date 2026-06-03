# Layanan AI (Sign Language Recognition)

Folder ini berisi layanan kecerdasan buatan (AI) yang bertanggung jawab untuk mendeteksi landmark tangan dari feed kamera pengguna dan mengklasifikasikannya ke dalam istilah keuangan menggunakan model LSTM.

## Fitur Utama
- **FastAPI**: Kerangka kerja web berkinerja tinggi untuk melayani API.
- **WebSocket (`/ws`)**: Komunikasi dua arah (real-time) untuk mengirim gambar frame dari frontend dan menerima hasil prediksi gerakan isyarat.
- **MediaPipe Hands**: Untuk ekstraksi landmark tangan (koordinat 3D pergelangan dan jari tangan).
- **TensorFlow**: Menjalankan inferensi model LSTM (`best_model.h5`) untuk mengklasifikasikan urutan gerakan tangan.

## Struktur Folder
- `app.py`: Titik masuk utama aplikasi (Entrypoint) FastAPI server.
- `models/`: Folder tempat menyimpan berkas model terlatih (`best_model.h5`) dan label encoder (`label_encoder.pkl`).
- `requirements.txt`: Daftar pustaka Python yang dibutuhkan oleh proyek.

## Cara Instalasi & Menjalankan

1. **Membuat Virtual Environment (Opsional tetapi Direkomendasikan)**
   ```bash
   python -m venv .venv
   ```

2. **Mengaktifkan Virtual Environment**
   - Di Windows (PowerShell):
     ```powershell
     .venv\Scripts\activate
     ```
   - Di Linux / macOS:
     ```bash
     source .venv/bin/activate
     ```

3. **Menginstal Dependensi**
   ```bash
   pip install -r requirements.txt
   ```

4. **Menjalankan Server**
   ```bash
   python app.py
   ```
   Secara default, aplikasi akan berjalan pada alamat [http://127.0.0.1:8000](http://127.0.0.1:8000) dengan endpoint WebSocket di `ws://127.0.0.1:8000/ws`.
