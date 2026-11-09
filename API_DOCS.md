# 📖 Dokumentasi Lengkap REST API: Class Task Tracker

Dokumentasi resmi spesifikasi REST API untuk aplikasi **Class Task Tracker**.

---

## 🌐 Informasi Dasar

- **Base URL:** `http://localhost:3000/api`
- **Format Pertukaran Data:** JSON (`Content-Type: application/json`)
- **Mekanisme Autentikasi:** HTTP Bearer Token (`Authorization: Bearer <jwt_token>`)

---

## 📋 Standar Format Respons

### 1. Format Berhasil (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3
  }
}
```
*(Properti `pagination` bersifat opsional, hanya muncul pada endpoint dengan paginasi)*

### 2. Format Error (HTTP 400 / 401 / 403 / 404 / 500)
```json
{
  "success": false,
  "message": "Keterangan pesan error",
  "errors": [
    {
      "field": "email",
      "message": "Format email tidak valid"
    }
  ]
}
```

---

## 🔐 1. Autentikasi (`/api/auth`)

### 1.1. Registrasi Akun
Mendaftarkan akun baru dengan peran guru atau siswa.

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Akses:** Publik
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi.guru@example.com",
    "password": "password123",
    "role": "guru"
  }
  ```
  *Keterangan field:*
  - `name` *(string, wajib)*: Maksimal 100 karakter.
  - `email` *(string, wajib)*: Format email valid, unik.
  - `password` *(string, wajib)*: Minimal 6 karakter.
  - `role` *(string, wajib)*: Nilai harus `'guru'` atau `'siswa'`.

- **Respons Berhasil (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registrasi berhasil",
    "data": {
      "user": {
        "id": 1,
        "name": "Budi Santoso",
        "email": "budi.guru@example.com",
        "role": "guru",
        "created_at": "2026-11-09T08:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

- **Respons Error (400 Bad Request):**
  ```json
  {
    "success": false,
    "message": "Email sudah terdaftar. Silakan gunakan email lain",
    "errors": [
      { "field": "email", "message": "Email sudah digunakan" }
    ]
  }
  ```

---

### 1.2. Login Pengguna
Melakukan autentikasi dan mendapatkan token JWT.

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Akses:** Publik
- **Request Body:**
  ```json
  {
    "email": "budi.guru@example.com",
    "password": "password123"
  }
  ```

- **Respons Berhasil (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login berhasil",
    "data": {
      "user": {
        "id": 1,
        "name": "Budi Santoso",
        "email": "budi.guru@example.com",
        "role": "guru",
        "created_at": "2026-11-09T08:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

- **Respons Error (401 Unauthorized):**
  ```json
  {
    "success": false,
    "message": "Email atau password salah"
  }
  ```

---

### 1.3. Get Profile Pengguna Aktif
Mengambil data profil pengguna berdasarkan Bearer Token yang dikirim.

- **URL:** `/api/auth/me`
- **Method:** `GET`
- **Akses:** Terproteksi (Semua Pengguna Terautentikasi)
- **Request Headers:**
  - `Authorization: Bearer <jwt_token>`

- **Respons Berhasil (200 OK):**
  ```json
  {
    "success": true,
    "message": "Data profil berhasil diambil",
    "data": {
      "user": {
        "id": 1,
        "name": "Budi Santoso",
        "email": "budi.guru@example.com",
        "role": "guru",
        "created_at": "2026-11-09T08:00:00.000Z"
      }
    }
  }
  ```

---

## 🏫 2. Kelas (`/api/classes`)

### 2.1. Daftar Kelas Pengguna Aktif
Mengambil kelas yang diajar (untuk Guru) atau kelas yang diikuti (untuk Siswa).

- **URL:** `/api/classes`
- **Method:** `GET`
- **Akses:** Terproteksi (Guru & Siswa)
- **Request Headers:**
  - `Authorization: Bearer <jwt_token>`

- **Respons Berhasil untuk Guru (200 OK):**
  ```json
  {
    "success": true,
    "message": "Daftar kelas guru berhasil diambil",
    "data": [
      {
        "id": 1,
        "name": "XI RPL 1",
        "teacher_id": 1,
        "student_count": 2,
        "created_at": "2026-11-09T08:00:00.000Z"
      }
    ]
  }
  ```

- **Respons Berhasil untuk Siswa (200 OK):**
  ```json
  {
    "success": true,
    "message": "Daftar kelas siswa berhasil diambil",
    "data": [
      {
        "id": 1,
        "name": "XI RPL 1",
        "teacher_id": 1,
        "teacher_name": "Budi Santoso",
        "joined_at": "2026-11-09T08:00:00.000Z"
      }
    ]
  }
  ```

---

### 2.2. Siswa Bergabung ke Kelas
Menambahkan siswa ke kelas yang tersedia.

- **URL:** `/api/classes/join`
- **Method:** `POST`
- **Akses:** Khusus Siswa
- **Request Headers:**
  - `Authorization: Bearer <jwt_token_siswa>`
- **Request Body:**
  ```json
  {
    "class_id": 2
  }
  ```

- **Respons Berhasil (201 Created):**
  ```json
  {
    "success": true,
    "message": "Berhasil bergabung ke kelas"
  }
  ```

---

## 📝 3. Manajemen Tugas (`/api/tasks`)

### 3.1. Daftar Tugas (dengan Pencarian, Filter & Paginasi)
Mengambil daftar tugas sesuai peran:
- **Siswa:** Menampilkan tugas dari kelas yang diikutinya dengan penanda `is_done`.
- **Guru:** Menampilkan tugas yang dibuatnya dengan statistik siswa yang selesai.

- **URL:** `/api/tasks`
- **Method:** `GET`
- **Akses:** Terproteksi (Guru & Siswa)
- **Query Parameters:**
  | Parameter | Tipe | Default | Deskripsi |
  |---|---|---|---|
  | `search` | string | `""` | Kata kunci pencarian judul (didukung indeks trigram `pg_trgm`). |
  | `status` | string | `"semua"` | Filter status: `"semua"`, `"selesai"`, atau `"belum"` (khusus siswa). |
  | `class_id` | number | - | Filter ID kelas tertentu. |
  | `page` | number | `1` | Nomor halaman aktif. |
  | `limit` | number | `10` | Jumlah item per halaman. |

- **Contoh Request URL:**
  `/api/tasks?search=ERD&status=selesai&page=1&limit=5`

- **Respons Berhasil Siswa (200 OK):**
  ```json
  {
    "success": true,
    "message": "Daftar tugas siswa berhasil diambil",
    "data": [
      {
        "id": 1,
        "title": "Membuat ERD Perpustakaan",
        "description": "Buat ERD lengkap dengan kardinalitas.",
        "due_date": "2026-11-12T14:00:00.000Z",
        "class_id": 1,
        "class_name": "XI RPL 1",
        "teacher_name": "Budi Santoso",
        "is_done": true,
        "completed_at": "2026-11-09T08:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "totalItems": 1,
      "totalPages": 1
    }
  }
  ```

- **Respons Berhasil Guru (200 OK):**
  ```json
  {
    "success": true,
    "message": "Daftar tugas guru berhasil diambil",
    "data": [
      {
        "id": 1,
        "title": "Membuat ERD Perpustakaan",
        "description": "Buat ERD lengkap dengan kardinalitas.",
        "due_date": "2026-11-12T14:00:00.000Z",
        "class_id": 1,
        "class_name": "XI RPL 1",
        "completed_students_count": 2,
        "total_students_count": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "totalItems": 1,
      "totalPages": 1
    }
  }
  ```

---

### 3.2. Detail Tugas
Mengambil rincian satu tugas tertentu.

- **URL:** `/api/tasks/:id`
- **Method:** `GET`
- **Akses:** Terproteksi (Guru & Siswa)

- **Respons Berhasil (200 OK):**
  ```json
  {
    "success": true,
    "message": "Detail tugas berhasil diambil",
    "data": {
      "id": 1,
      "title": "Membuat ERD Perpustakaan",
      "description": "Buat ERD lengkap dengan kardinalitas.",
      "due_date": "2026-11-12T14:00:00.000Z",
      "class_id": 1,
      "class_name": "XI RPL 1",
      "teacher_name": "Budi Santoso",
      "is_done": false
    }
  }
  ```

---

### 3.3. Membuat Tugas Baru
Menambahkan tugas ke kelas yang diampu guru.

- **URL:** `/api/tasks`
- **Method:** `POST`
- **Akses:** Khusus Guru (`role: 'guru'`)
- **Request Headers:**
  - `Authorization: Bearer <jwt_token_guru>`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Tugas Desain Antarmuka",
    "description": "Buat wireframe interaktif menggunakan Figma.",
    "due_date": "2026-11-20T23:59:00.000Z",
    "class_id": 1
  }
  ```

- **Respons Berhasil (201 Created):**
  ```json
  {
    "success": true,
    "message": "Tugas berhasil dibuat",
    "data": {
      "id": 7,
      "class_id": 1,
      "created_by": 1,
      "title": "Tugas Desain Antarmuka",
      "description": "Buat wireframe interaktif menggunakan Figma.",
      "due_date": "2026-11-20T23:59:00.000Z",
      "class_name": "XI RPL 1"
    }
  }
  ```

- **Respons Ditolak jika Siswa Mencoba (403 Forbidden):**
  ```json
  {
    "success": false,
    "message": "Akses dilarang. Peran 'siswa' tidak memiliki izin untuk tindakan ini"
  }
  ```

---

### 3.4. Memperbarui Tugas
Mengubah informasi tugas yang dibuat oleh guru bersangkutan.

- **URL:** `/api/tasks/:id`
- **Method:** `PUT`
- **Akses:** Khusus Guru Pembuat Tugas
- **Request Body:**
  ```json
  {
    "title": "Tugas Desain Antarmuka (Revisi)",
    "description": "Tambahkan skenario prototipe interaktif.",
    "due_date": "2026-11-22T23:59:00.000Z",
    "class_id": 1
  }
  ```

- **Respons Berhasil (200 OK):**
  ```json
  {
    "success": true,
    "message": "Tugas berhasil diperbarui",
    "data": {
      "id": 7,
      "title": "Tugas Desain Antarmuka (Revisi)",
      "description": "Tambahkan skenario prototipe interaktif.",
      "due_date": "2026-11-22T23:59:00.000Z",
      "class_id": 1,
      "class_name": "XI RPL 1"
    }
  }
  ```

---

### 3.5. Menghapus Tugas
Menghapus tugas beserta seluruh riwayat penyelesaian siswa.

- **URL:** `/api/tasks/:id`
- **Method:** `DELETE`
- **Akses:** Khusus Guru Pembuat Tugas

- **Respons Berhasil (200 OK):**
  ```json
  {
    "success": true,
    "message": "Tugas berhasil dihapus",
    "data": {
      "id": 7
    }
  }
  ```

---

### 3.6. Menandai / Batal Tandai Selesai Tugas
Siswa mengubah status penyelesaian tugas (toggle).
- Jika belum selesai $\rightarrow$ ditandai selesai (`is_done: true`, membuat baris di `task_completions`).
- Jika sudah selesai $\rightarrow$ dibatalkan (`is_done: false`, menghapus baris dari `task_completions`).

- **URL:** `/api/tasks/:id/toggle-status`
- **Method:** `PATCH`
- **Akses:** Khusus Siswa Terdaftar di Kelas Tugas Tersebut
- **Request Headers:**
  - `Authorization: Bearer <jwt_token_siswa>`

- **Respons Berhasil Menandai Selesai (200 OK):**
  ```json
  {
    "success": true,
    "message": "Tugas berhasil ditandai selesai",
    "data": {
      "task_id": 1,
      "is_done": true,
      "completed_at": "2026-11-09T08:35:12.345Z"
    }
  }
  ```

- **Respons Berhasil Membatalkan Selesai (200 OK):**
  ```json
  {
    "success": true,
    "message": "Tugas ditandai belum selesai",
    "data": {
      "task_id": 1,
      "is_done": false
    }
  }
  ```

- **Respons Ditolak jika Guru Mencoba (403 Forbidden):**
  ```json
  {
    "success": false,
    "message": "Akses dilarang. Peran 'guru' tidak memiliki izin untuk tindakan ini"
  }
  ```
