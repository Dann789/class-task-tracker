# Class Task Tracker

Aplikasi manajemen tugas kelas berbasis web dengan arsitektur decoupled (**Backend Express.js + PostgreSQL** dan **Frontend React 19 + Vite**).

---

## 🌟 Fitur Utama

1. **Autentikasi Multi-Peran (Guru & Siswa):**
   - Registrasi dan login dengan enkripsi password menggunakan `bcryptjs`.
   - Autentikasi berbasis JWT Token (`Bearer Token`) dengan proteksi rute di backend dan frontend.

2. **Manajemen Tugas Khusus Guru (Full CRUD):**
   - Guru dapat membuat tugas baru (`title`, `description`, `due_date`, `class_id`).
   - Guru dapat mengubah detail tugas dan tenggat waktu.
   - Guru dapat menghapus tugas dengan modal konfirmasi.
   - Guru dapat memantau progres siswa yang telah menyelesaikan tugas (`X/Y Siswa Selesai`).

3. **Akses & Aksi Siswa:**
   - Siswa hanya dapat melihat daftar tugas dari kelas yang diikutinya.
   - Siswa dapat menandai tugas sebagai selesai atau membatalkan status selesai.
   - Hak cipta data terproteksi: siswa dilarang keras mengubah atau menghapus tugas (HTTP 403 Forbidden).

4. **Navigasi & Pencarian Canggih:**
   - Pencarian instan (debounced) berdasarkan judul tugas dengan akselerasi indeks PostgreSQL `pg_trgm`.
   - Filter status penyelesaian: **Semua**, **Belum Selesai**, dan **Selesai**.
   - Filter berdasarkan kelas.
   - Paginasi dinamis dengan navigasi halaman dan informasi total tugas.

5. **Antarmuka Modern & Responsif:**
   - Desain modern, bersih, dan intuitif.
   - Indikator keterlambatan (overdue badge).
   - Penanganan error dan status loading yang jelas di setiap aksi.

---

## 🔑 Akun Demo (Bawaan Seeder)

Semua akun seeder menggunakan kata sandi: `password123`

| Peran | Nama | Email | Kelas Terkait |
|---|---|---|---|
| **Guru** | Budi Santoso | `budi.guru@example.com` | Pengajar XI RPL 1 |
| **Guru** | Siti Rahma | `siti.guru@example.com` | Pengajar XI RPL 2 |
| **Siswa** | Andi Pratama | `andi.siswa@example.com` | Siswa XI RPL 1 |
| **Siswa** | Dewi Lestari | `dewi.siswa@example.com` | Siswa XI RPL 1 & XI RPL 2 |
| **Siswa** | Rizky Maulana | `rizky.siswa@example.com` | Siswa XI RPL 2 |

> *Tip: Pada halaman login, tersedia tombol pintasan akun demo untuk mengisi email & password secara otomatis.*

---

## 🚀 Panduan Menjalankan Proyek

### Opsi A: Menjalankan Menggunakan Docker (Rekomendasi Cepat)

Jika Anda memiliki Docker terpasang, seluruh stack (PostgreSQL + skema auto-seeder, Backend Express, dan Frontend Nginx) dapat dijalankan dengan satu perintah:

```bash
docker compose up --build -d
```
- **Frontend Web:** `http://localhost:5173`
- **Backend API:** `http://localhost:3000`
- **Swagger UI:** `http://localhost:3000/api-docs`

Untuk menghentikan:
```bash
docker compose down
```

---

### Opsi B: Menjalankan Secara Manual (Lokal)

#### 1. Inisialisasi Basis Data (PostgreSQL)

Pastikan layanan PostgreSQL sedang berjalan dan database `tasktracker_db` sudah dibuat. Konfigurasikan file `backend/.env` sesuai kredensial database Anda:

```env
PORT=number_port
DB_HOST=localhost
DB_PORT=db_port
DB_NAME=db_name
DB_USER=postgres
DB_PASSWORD=db_password
JWT_SECRET=class_task_tracker_secret_key_jwt_2026
JWT_EXPIRES_IN=7d
```

Jalankan perintah inisialisasi skema & seeder:
```bash
cd backend
npm run db:init
```

### 2. Menjalankan Backend API

```bash
cd backend
npm run dev
```
Backend berjalan di: `http://localhost:3000`  
Dokumentasi interaktif (Swagger UI): `http://localhost:3000/api-docs`

### 3. Menjalankan Frontend

```bash
cd frontend
npm run dev
```
Frontend berjalan di: `http://localhost:5173`

---

## 🧪 Pengujian Otomatis Backend (Automated Tests)

Tersedia **20 automated unit & feature tests** yang mencakup pengujian menyeluruh pada 3 kelompok endpoint utama:
1. **Endpoint Autentikasi** (`/api/auth`): Register, Login, Me, Token JWT, validasi masukan, dan proteksi password hash.
2. **Endpoint Manajemen Tugas Guru** (`/api/tasks`): Create, Read, Update, Delete (CRUD), validasi form, dan proteksi otorisasi.
3. **Endpoint Akses & Status Siswa** (`/api/tasks`): Pencarian judul, filter status (`selesai`/`belum`), paginasi, penandaan status selesai (toggle), serta penolakan siswa mengubah/menghapus tugas (HTTP 403).

Jalankan test suite resmi:
```bash
cd backend
npm test
```

Atau jalankan skrip pengujian terintegrasi cepat:
```bash
cd backend
node src/test-api.js
```

---

## 📡 Daftar Endpoint REST API

### Autentikasi (`/api/auth`)
- `POST /api/auth/register` - Registrasi pengguna baru (`name`, `email`, `password`, `role`).
- `POST /api/auth/login` - Login & penerbitan token JWT.
- `GET /api/auth/me` - Ambil profil pengguna yang sedang login.

### Kelas (`/api/classes`)
- `GET /api/classes` - Ambil kelas yang diampu guru atau kelas yang diikuti siswa.
- `GET /api/classes/all` - Ambil seluruh kelas di sistem.
- `POST /api/classes/join` - Siswa bergabung ke kelas tertentu.

### Tugas (`/api/tasks`)
- `GET /api/tasks?search=&status=&page=1&limit=10` - Daftar tugas dengan pencarian, filter, dan paginasi.
- `GET /api/tasks/:id` - Detail tugas.
- `POST /api/tasks` - **(Guru)** Membuat tugas baru.
- `PUT /api/tasks/:id` - **(Guru)** Memperbarui tugas.
- `DELETE /api/tasks/:id` - **(Guru)** Menghapus tugas.
- `PATCH /api/tasks/:id/toggle-status` - **(Siswa)** Menandai tugas selesai / belum selesai.

## Jika masih ada waktu lebih
- Lebih merapikan tampilan web untuk semua role agar terlihat lebih clean
- Menambah beberapa halaman baru seperti dashboard dan daftar siswa setiap kelas