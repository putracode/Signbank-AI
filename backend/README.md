# Layanan Backend (Node.js & Express)

Folder ini berisi kode sumber untuk layanan **Backend API** dari **SignBank AI**. Server ini dibangun menggunakan **Node.js** dan framework **Express**, dengan database **PostgreSQL** untuk menyimpan seluruh data terstruktur.

Layanan ini mengelola autentikasi administrator, data kategori istilah, data kamus glosarium bahasa isyarat keuangan, serta upload aset video/gambar.

---

## Fitur Utama Backend

1. **Autentikasi & Otorisasi Administrator**:
   - Proses pendaftaran dan masuk menggunakan enkripsi kata sandi satu arah (**bcrypt**).
   - Pengamanan akses endpoint API menggunakan skema **JSON Web Token (JWT)**.
   - Manajemen Token Akses (*Access Token*) dan Token Penyegaran (*Refresh Token*) untuk kenyamanan dan keamanan pengguna admin.

2. **Manajemen Kamus Istilah Keuangan (Glosarium)**:
   - Pencarian istilah keuangan dinamis berdasarkan nama kata dan filter kategori.
   - API lengkap untuk operasi CRUD (Create, Read, Update, Delete) entitas glosarium.
   - Pengarsipan file media peraga (video gestur) menggunakan middleware **Multer** untuk penyimpanan aset fisik lokal.

3. **Skema Migrasi Database Terstruktur**:
   - Penggunaan **node-pg-migrate** untuk mendefinisikan, menguji, dan menjalankan perubahan tabel database secara konsisten tanpa merusak data yang ada.
   - Otomatisasi pembuatan database awal (*seeding*) untuk akun administrator utama.

4. **Validasi Skema Data**:
   - Pengecekan input data API menggunakan pustaka **Joi** untuk mencegah SQL injection, tipe data salah, dan data kosong sebelum diproses ke database.

---

## Struktur Folder Lengkap

```text
backend/
├── migrations/              # Definisi file migrasi tabel PostgreSQL (node-pg-migrate)
├── scripts/                 # Kumpulan script bantu (seperti seeding data admin)
│   └── seed-admin.js        # Script seeding akun administrator awal
├── src/
│   ├── config/              # Inisialisasi pool koneksi PostgreSQL (pg Pool)
│   ├── exceptions/          # Kelas kustom penanganan error (ClientError, InvariantError, dll.)
│   ├── middlewares/         # Middleware Express
│   │   ├── auth.js               # Verifikasi Access Token JWT
│   │   └── upload.js             # Konfigurasi multer untuk upload file video/gambar
│   ├── routes/              # Routing utama router Express
│   ├── security/            # Modul token manager (JWT generate & verify)
│   ├── services/            # Komponen logika bisnis & kueri database (modul terpisah)
│   │   ├── authentications/      # Modul autentikasi admin
│   │   ├── categories/           # Modul manajemen kategori
│   │   └── glosarium/            # Modul manajemen data glosarium istilah keuangan
│   ├── utils/               # Fungsi utilitas pembantu (seperti mapping objek db ke json)
│   ├── server.js            # Entrypoint inisialisasi server Express & global error handler
├── .env                     # File konfigurasi environment variabel lokal
├── package.json             # Manifes dependensi Node.js & script pengerjaan
└── README.md                # Dokumentasi petunjuk backend ini
```

---

## API Endpoints Reference

Semua respon REST API mengembalikan format JSON standar.

### 1. Autentikasi (`/authentications`)
*   **POST `/authentications`**
    *   *Deskripsi*: Masuk sebagai Administrator.
    *   *Request Body*: `{ "email": "admin@signbank.com", "password": "password" }`
    *   *Respon*: Mengembalikan `accessToken` dan `refreshToken`.
*   **PUT `/authentications`**
    *   *Deskripsi*: Memperbarui `accessToken` yang kadaluarsa menggunakan `refreshToken`.
    *   *Request Body*: `{ "refreshToken": "string_refresh_token" }`
*   **DELETE `/authentications`**
    *   *Deskripsi*: Keluar (logout) dan menghapus `refreshToken` dari sistem.
    *   *Request Body*: `{ "refreshToken": "string_refresh_token" }`

### 2. Kategori (`/categories`)
*   **GET `/categories`**
    *   *Deskripsi*: Mengambil daftar seluruh kategori istilah keuangan.
*   **POST `/categories`** *(Memerlukan JWT)*
    *   *Deskripsi*: Menambah kategori baru.
    *   *Request Body*: `{ "name": "Perbankan" }`
*   **PUT `/categories/:id`** *(Memerlukan JWT)*
    *   *Deskripsi*: Mengubah nama kategori berdasarkan ID.
*   **DELETE `/categories/:id`** *(Memerlukan JWT)*
    *   *Deskripsi*: Menghapus kategori berdasarkan ID.

### 3. Glosarium istilah (`/glosarium`)
*   **GET `/glosarium`**
    *   *Deskripsi*: Mengambil daftar istilah keuangan dengan parameter opsional query string (`?search=...`, `?category=...`).
*   **GET `/glosarium/:id`**
    *   *Deskripsi*: Mengambil detail lengkap suatu istilah keuangan berdasarkan ID.
*   **POST `/glosarium`** *(Memerlukan JWT, multipart/form-data)*
    *   *Deskripsi*: Menambahkan data glosarium baru beserta file video gerakan isyarat.
*   **PUT `/glosarium/:id`** *(Memerlukan JWT, multipart/form-data)*
    *   *Deskripsi*: Mengubah data glosarium berdasarkan ID.
*   **DELETE `/glosarium/:id`** *(Memerlukan JWT)*
    *   *Deskripsi*: Menghapus data glosarium berdasarkan ID dari database beserta file video terkait.

---

## Panduan Instalasi & Menjalankan

### 1. Prasyarat
*   [Node.js](https://nodejs.org/) (Versi 18 ke atas)
*   [PostgreSQL](https://www.postgresql.org/) yang aktif di mesin lokal. Buat database baru bernama `signbank`.

### 2. Konfigurasi Lingkungan (`.env`)
Buat berkas `.env` di dalam folder `backend/` dengan parameter berikut:
```env
# Konfigurasi Port Aplikasi
HOST=localhost
PORT=3000

# Konfigurasi Database PostgreSQL
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=password_db_anda
PGDATABASE=signbank
PGPORT=5432

# Kunci Rahasia JWT (Gunakan string acak panjang untuk keamanan)
ACCESS_TOKEN_KEY=36efcdc8eb8ab1d7cc057749b3ee416661243dd2d863d7d931263f0cf086d3a1e1d18f6cca64e341d96c89e1752ed547e0c26e4b17a02877f40fe7ceee80b5c1
REFRESH_TOKEN_KEY=6e3c846e1a8f4b3ad11c3a8bf908083ee7abde457999f3e337c76590f4831a235b47d1859a47d246a23dbcbd05970d058ac271b340e24e075b56033d82bf9800
ACCESS_TOKEN_AGE=24h

# Alamat URL WebSocket AI (Opsional)
AI_WS_URL=ws://127.0.0.1:8000/ws
```

### 3. Menginstal Dependensi
Di folder `backend/`, jalankan perintah:
```bash
npm install
```

### 4. Menjalankan Migrasi Database
Untuk membuat struktur tabel yang dibutuhkan oleh sistem secara otomatis, jalankan perintah migrasi berikut:
```bash
npm run migrate up
```

### 5. Seeding Akun Administrator Awal
Untuk mengisi akun admin default ke database, jalankan perintah:
```bash
npm run seed:admin
```
Setelah script selesai, Anda dapat masuk ke panel admin frontend menggunakan akun berikut:
*   **Email**: `admin@signbank.com`
*   **Password**: `password`

### 6. Menjalankan Server (Local Development)
Untuk memulai pengembangan server backend dengan fitur auto-reload (Nodemon), jalankan:
```bash
npm run start:dev
```
Server backend akan aktif pada [http://localhost:3000](http://localhost:3000).
