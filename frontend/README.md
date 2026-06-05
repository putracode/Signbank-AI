# Layanan Frontend (React + Vite)

Folder ini berisi kode sumber untuk aplikasi antarmuka pengguna (Frontend) dari **SignBank AI**. Aplikasi web ini dibangun menggunakan **React** dan **Vite** sebagai build tool, serta ditata secara modern dan responsif menggunakan **Tailwind CSS**. 

Antarmuka ini dirancang agar mudah digunakan baik oleh nasabah Tuli maupun petugas perbankan secara berdampingan.

---

## Fitur Utama Frontend

1. **Interaksi Penerjemah Isyarat (Sign-to-Text)**:
   - Akses webcam pengguna secara aman langsung di browser.
   - Perekaman frame video dinamis yang dikonversi ke format string base64 secara periodik.
   - Koneksi dua arah berlatensi rendah ke server AI menggunakan **WebSocket**.
   - Validasi kestabilan prediksi berdasarkan tingkat kepercayaan (*confidence threshold* ≥ 85%) dan kerangka frame berturut-turut (*consecutive frames*) untuk menghindari hasil deteksi palsu (flicker).
   - Penggabungan otomatis karakter huruf demi huruf menjadi kata dan kalimat terstruktur dengan aturan spasi cerdas (misal: penggabungan huruf eja menjadi kata singkatan seperti "A" + "T" + "M" -> "ATM").

2. **Input Suara Petugas (Speech-to-Text)**:
   - Integrasi Web Speech API melalui custom hook untuk mengubah ucapan verbal petugas bank menjadi teks secara instan.
   - Deteksi otomatis jeda bicara untuk merangkai kalimat penjelasan petugas.

3. **Kamus Glosarium Istilah Keuangan**:
   - Penyajian visual data istilah keuangan yang dikelompokkan berdasarkan kategori.
   - Halaman detail yang menampilkan video peraga gerakan isyarat berformat definisi tinggi, deskripsi istilah, dan cara penggunaan praktis dalam transaksi keuangan.

4. **Panel Administrasi (Dashboard)**:
   - Autentikasi Admin yang aman dengan penyimpanan token JWT.
   - Manajemen CRUD lengkap untuk Glosarium dan Kategori.
   - Pengintegrasian **FilePond** untuk unggah berkas video gerakan isyarat dengan drag-and-drop, validasi tipe file, serta progress bar yang interaktif.

---

## Struktur Folder Lengkap

```text
frontend/
├── public/                  # Aset statis publik
│   ├── favicon.svg          # Favicon aplikasi
│   ├── logo.png             # Logo SignBank AI
│   └── icons.svg            # Koleksi SVG icon
├── src/
│   ├── assets/              # Aset gambar, ilustrasi, dan logo tim
│   ├── components/          # Komponen UI reusable (Navbar, Footer, ProtectedRoute, dll.)
│   ├── hooks/               # Custom hooks React (seperti integrasi speech-to-text)
│   ├── pages/               # Halaman-halaman utama aplikasi:
│   │   ├── LandingPage.jsx        # Halaman depan/informasi utama
│   │   ├── TranslatorPage.jsx     # Halaman utama penerjemahan dua arah (Webcam + Mic)
│   │   ├── GlossaryPage.jsx       # Daftar kamus istilah keuangan publik
│   │   ├── GlossaryDetailPage.jsx # Detail per istilah keuangan dan video peraga
│   │   ├── TeamPage.jsx           # Halaman pengenalan tim pengembang
│   │   ├── AdminLoginPage.jsx     # Form masuk untuk administrator
│   │   ├── AdminDashboardPage.jsx # Panel ringkasan statistik dan manajemen data
│   │   ├── AdminGlossaryPage.jsx  # Manajemen entitas glosarium (tambah, edit, hapus)
│   │   └── AdminCategoryPage.jsx  # Manajemen kategori istilah keuangan
│   ├── services/            # Modul komunikasi API menggunakan Axios
│   │   ├── api.js                 # Konfigurasi instansi Axios & interseptor token JWT
│   │   ├── auth.js                # API service untuk login/logout admin
│   │   ├── glossary.js            # API service untuk query glosarium
│   │   └── category.js            # API service untuk query kategori
│   ├── App.css              # Custom styling dasar
│   ├── index.css            # Konfigurasi Tailwind CSS directives
│   ├── App.jsx              # Routing & struktur utama aplikasi
│   └── main.jsx             # Entrypoint render aplikasi ke DOM
├── .env                     # File konfigurasi environment variabel
├── tailwind.config.js       # Konfigurasi kustomisasi utility Tailwind CSS
└── vite.config.js           # Konfigurasi server & plugin Vite
```

---

## Dependensi Utama

Berikut adalah daftar pustaka (*library*) utama yang digunakan pada proyek frontend ini:

*   **react-router-dom** (v6): Untuk manajemen rute halaman aplikasi (Client-Side Routing).
*   **axios**: Mengirimkan HTTP request ke backend API.
*   **filepond & react-filepond**: Komponen unggah berkas media yang kaya fitur untuk admin.
*   **sweetalert2**: Untuk modal dialog alert yang interaktif dan cantik.
*   **react-hot-toast**: Untuk notifikasi melayang (toast notifications) yang ringan dan modern.

---

## Panduan Instalasi & Menjalankan

### 1. Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (Direkomendasikan versi 18.x atau yang lebih baru).

### 2. Pengaturan File `.env`
Buat berkas `.env` di dalam folder `frontend/` dan isi dengan konfigurasi alamat WebSocket AI:
```env
# Alamat WebSocket server FastAPI AI (Lokal)
VITE_WS_URL=ws://127.0.0.1:8000/ws

# Catatan: Jika server AI dideploy di cloud, ganti dengan protokol wss:// (misal wss://nama-app.hf.space/ws)
```

### 3. Menginstal Dependensi
Di dalam direktori `frontend/`, jalankan perintah berikut:
```bash
npm install
```

### 4. Menjalankan Server Pengembangan (Local Development)
Jalankan perintah berikut untuk mengaktifkan server lokal:
```bash
npm run dev
```
Setelah server aktif, terminal akan menampilkan URL lokal untuk mengakses aplikasi web (secara default pada [http://localhost:5173](http://localhost:5173)).

### 5. Membangun Kode Produksi (Production Build)
Untuk melakukan kompilasi kode ke dalam bentuk berkas statis yang dioptimalkan untuk produksi, jalankan:
```bash
npm run build
```
Hasil build akan tersimpan di dalam folder `dist/` yang siap dideploy ke berbagai layanan hosting web statis seperti Vercel, Netlify, atau AWS S3.

---

## Logika Aliran Pengenalan Bahasa Isyarat di `TranslatorPage.jsx`

Di halaman **Penerjemah**, sistem melakukan pemrosesan sebagai berikut:
1. Mengakses kamera pengguna menggunakan `navigator.mediaDevices.getUserMedia`.
2. Menangkap frame video menggunakan canvas HTML5 setiap ~100 milidetik.
3. Mengubah gambar frame tersebut menjadi format data URL Base64.
4. Mengirimkan string Base64 ke server AI melalui koneksi WebSocket.
5. Menerima hasil respon klasifikasi berupa nama label/istilah keuangan beserta nilai *confidence*.
6. Jika nilai *confidence* dari AI lebih besar dari 85% (`confidence >= 0.85`), frontend akan melakukan akumulasi kata pada editor kalimat.
7. Pengguna dapat menekan tombol **"Bersihkan Hasil"** untuk menghapus kalimat atau **"Suarakan Kalimat"** untuk mengubah teks terjemahan menjadi suara melalui Web Speech Synthesis.
