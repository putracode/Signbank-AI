# Layanan AI (Sign Language Recognition)

Folder ini berisi kode sumber untuk **Layanan Kecerdasan Buatan (AI)** dari **SignBank AI**. Layanan ini bertanggung jawab memproses rekaman frame gambar dari webcam pengguna, mendeteksi *landmark* (titik sendi) tangan, melakukan pra-pemrosesan data koordinat, dan memprediksi gerakan isyarat istilah keuangan secara *real-time* menggunakan model deep learning **LSTM (Long Short-Term Memory)**.

Layanan ini dibangun menggunakan **FastAPI** dengan komunikasi berlatensi sangat rendah melalui **WebSocket**.

---

## Arsitektur & Pipeline Pemrosesan AI

Alur pemrosesan data gambar dari saat dikirim oleh browser hingga diperoleh hasil prediksi adalah sebagai berikut:

```text
+-----------------------+      Data URL Base64       +------------------------+
|   Klien (Frontend)    | -------------------------> |  FastAPI Server (/ws)  |
+-----------------------+                            +------------------------+
            ^                                                     |
            |                                                     | 1. Decode Base64 ke CV2 Array
            |                                                     v
            |                                        +------------------------+
            |                                        |  Preprocessing Frame   |
            |                                        +------------------------+
            |                                                     |
            |                                                     | 2. Balik Gambar secara Horizontal (Mirroring)
            |                                                     | 3. Konversi format BGR ke RGB
            |                                                     v
            |                                        +------------------------+
            |                                        |    MediaPipe Hands     |
            |                                        +------------------------+
            |                                                     |
            |                                                     | 4. Deteksi Landmark (2 Tangan x 21 Titik x 3 Koordinat)
            |                                                     v
            |                                        +------------------------+
            |                                        | Normalisasi Koordinat  |
            |                                        +------------------------+
            |                                                     |
            |                                                     | 5. Pengurangan koordinat Wrist (Landmark 0)
            |                                                     | 6. Gabungkan kedua tangan menjadi array 126 elemen
            |                                                     v
            |                                        +------------------------+
            |                                        |  Sequence Buffer Queue |
            |                                        +------------------------+
            |                                                     |
            |                                                     | 7. Buat Sequence Frame (Panjang = 40 Frame)
            |                                                     | 8. Padding dengan nilai 0 bila Frame kurang
            |                                                     v
            |                                        +------------------------+
            |                                        |   TensorFlow Model     |
            |                                        +------------------------+
            |                                                     |
            |                                                     | 9. Inferensi Model LSTM (best_model.h5)
            |                                                     | 10. Konversi Indeks Kelas ke Label Teks (Label Encoder)
            |                                                     v
            |                                        +------------------------+
            |                                        | Smoothing & Threshold  |
            |                                        +------------------------+
            |                                                     |
            |                                                     | 11. Validasi Nilai Confidence (Threshold >= 85%)
            |                                                     | 12. Mode Smoothing Prediksi (Window Size = 3)
            |                                                     v
            +---------------- Send JSON Respon ------------------+
```

---

## Fitur Utama Layanan AI

1. **WebSocket Berkinerja Tinggi (`/ws`)**:
   - Menerima data gambar mentah berupa string base64 secara asinkronus dengan frekuensi tinggi.
   - Mengirimkan hasil klasifikasi beserta nilai akurasi (*confidence*) kembali ke klien tanpa overhead HTTP request.

2. **Ekstraksi & Normalisasi Hand Landmarks**:
   - Menggunakan model **MediaPipe Hands** untuk mengekstraksi 21 koordinat 3D (X, Y, Z) untuk masing-masing tangan (Tangan Kiri & Kanan).
   - Melakukan normalisasi koordinat yang bersifat *wrist-relative* (koordinat pergelangan tangan dikurangi dari semua titik lainnya). Hal ini membuat model kebal terhadap perubahan posisi tubuh di layar (*translation-invariant*).
   - Menghasilkan vektor representasi 126 dimensi per frame gambar.

3. **Inferensi Dinamis Sequence Model (LSTM)**:
   - Klasifikasi gerakan isyarat menggunakan model LSTM yang dilatih untuk mempelajari gestur dinamis dari urutan frame waktu (temporal).
   - **Tail-Padding**: Menambahkan padding bernilai nol secara otomatis pada urutan frame jika gerakan baru saja dimulai.
   - **Transition Detection**: Pembersihan buffer sequence secara dinamis ketika tingkat kepercayaan model turun secara drastis (di bawah 80%) atau ketika gerakan tangan berubah, agar model dapat langsung mengenali gerakan berikutnya tanpa harus menunggu buffer penuh kembali.
   - **Smoothing Predictor**: Menggunakan filter *smoothing* mayoritas suara terbanyak (*majority voting*) dengan lebar jendela 3 untuk menghilangkan riak (*flicker*) prediksi yang tidak stabil.

---

## Parameter Konfigurasi Utama

Parameter penting yang dikonfigurasi di dalam file `app.py`:

*   `SEQUENCE_LENGTH` = 40: Jumlah total frame sequence yang dikirim ke input model LSTM.
*   `SMOOTHING_WINDOW` = 3: Ukuran buffer untuk menstabilkan pembacaan teks prediksi.
*   `PREDICTION_THRESHOLD` = 0.85: Tingkat ambang batas kepercayaan minimal (85%) agar teks klasifikasi dikirim dan ditampilkan di antarmuka frontend.

---

## Struktur Folder Layanan AI

```text
ai/
├── models/                  # File model teruji & metadata label
│   ├── best_model.h5        # Model LSTM terexport dari proses training TensorFlow
│   └── label_encoder.pkl    # Serialisasi pengubah indeks label kembali menjadi kata (scikit-learn)
├── .venv/                   # Lingkungan Virtual Python (terbuat setelah instalasi)
├── app.py                   # Server FastAPI utama & implementasi pipeline inferensi
├── requirements.txt         # Daftar pustaka Python yang wajib diinstal
└── README.md                # Dokumentasi petunjuk penggunaan modul AI
```

---

## Panduan Instalasi & Menjalankan

### 1. Prasyarat
*   Python versi 3.9 sampai 3.11 (Sangat direkomendasikan).
*   Koneksi internet untuk mengunduh model MediaPipe otomatis saat inisialisasi pertama.

### 2. Langkah-Langkah Menjalankan

#### A. Membuat Virtual Environment (Opsional tetapi Direkomendasikan)
Buat virtual environment untuk memisahkan library proyek dari sistem global Anda:
```bash
python -m venv .venv
```

#### B. Mengaktifkan Virtual Environment
*   **Windows (PowerShell)**:
    ```powershell
    .venv\Scripts\activate
    ```
*   **Linux / macOS**:
    ```bash
    source .venv/bin/activate
    ```

#### C. Menginstal Dependensi Pustaka
Instal semua pustaka yang tercantum di file `requirements.txt`:
```bash
pip install -r requirements.txt
```

#### D. Menjalankan Server FastAPI
Jalankan server menggunakan uvicorn:
```bash
python app.py
```
Secara default, server FastAPI akan berjalan pada alamat [http://localhost:7860](http://localhost:7860) atau [http://localhost:8000](http://localhost:8000) (tergantung pada port di konfigurasi) dengan endpoint WebSocket di `ws://127.0.0.1:8000/ws` (atau port 7860).

---

## Catatan Tambahan Pengembangan
*   Aplikasi ini menggunakan modul `opencv-python-headless` untuk mengurangi ukuran package dan meminimalkan masalah dependency GUI pada lingkungan deployment cloud (seperti Hugging Face Spaces atau server Linux tanpa display driver).
*   Proses inferensi menggunakan pemanggilan fungsi TensorFlow langsung `model(input_data, training=False)` alih-alih `model.predict(input_data)` untuk menghindari overhead grafis eksekusi internal TF yang lambat saat menangani frame-by-frame websocket tunggal.
