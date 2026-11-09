-- =====================================================================
-- Class Task Tracker - Skema PostgreSQL (migrasi + index + seeder)
-- Semua primary key / foreign key memakai INT (SERIAL)
-- Jalankan: psql -U <user> -d <database> -f schema.sql
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 0. Extension
--    pgcrypto : hash password pada seeder (bcrypt via crypt/gen_salt)
--    pg_trgm  : mempercepat pencarian judul (ILIKE '%kata%')
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------------------
-- 1. Reset (agar skrip bisa dijalankan ulang di database pengembangan)
--    HATI-HATI: menghapus data. Hapus bagian ini di produksi.
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS task_completions CASCADE;
DROP TABLE IF EXISTS tasks            CASCADE;
DROP TABLE IF EXISTS class_students   CASCADE;
DROP TABLE IF EXISTS classes          CASCADE;
DROP TABLE IF EXISTS users            CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- ---------------------------------------------------------------------
-- 2. Fungsi trigger: otomatis memperbarui kolom updated_at
-- ---------------------------------------------------------------------
CREATE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- 3. Tabel users
--    Menyimpan akun guru dan siswa. Password disimpan dalam bentuk hash.
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id            SERIAL        PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          VARCHAR(10)   NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT chk_users_role CHECK (role IN ('guru', 'siswa'))
);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- 4. Tabel classes
--    Kelas yang dimiliki oleh seorang guru (1 guru : N kelas).
--    Backend wajib memvalidasi bahwa teacher_id berrole 'guru'.
-- ---------------------------------------------------------------------
CREATE TABLE classes (
    id         SERIAL       PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    teacher_id INT          NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_classes_teacher
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);

-- ---------------------------------------------------------------------
-- 5. Tabel class_students
--    Penghubung many-to-many antara siswa dan kelas.
--    PK komposit mencegah siswa terdaftar dua kali di kelas yang sama.
-- ---------------------------------------------------------------------
CREATE TABLE class_students (
    class_id   INT         NOT NULL,
    student_id INT         NOT NULL,
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (class_id, student_id),
    CONSTRAINT fk_cs_class
        FOREIGN KEY (class_id)   REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_cs_student
        FOREIGN KEY (student_id) REFERENCES users(id)   ON DELETE CASCADE
);

CREATE INDEX idx_class_students_student_id ON class_students(student_id);

-- ---------------------------------------------------------------------
-- 6. Tabel tasks
--    Tugas yang dibuat guru: judul, deskripsi, tenggat, kelas.
--    Hak ubah/hapus: hanya guru pemilik kelas (dicek di backend).
-- ---------------------------------------------------------------------
CREATE TABLE tasks (
    id          SERIAL       PRIMARY KEY,
    class_id    INT          NOT NULL,
    created_by  INT          NOT NULL,
    title       VARCHAR(150) NOT NULL,
    description TEXT,
    due_date    TIMESTAMPTZ  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_tasks_class
        FOREIGN KEY (class_id)   REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_creator
        FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE RESTRICT
);

CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Daftar tugas per kelas, urut tenggat, paginasi cepat
CREATE INDEX idx_tasks_class_due ON tasks(class_id, due_date);

-- Pencarian judul (ILIKE '%kata%') memakai trigram
CREATE INDEX idx_tasks_title_trgm ON tasks USING GIN (title gin_trgm_ops);

-- ---------------------------------------------------------------------
-- 7. Tabel task_completions
--    Status selesai bersifat PER SISWA.
--      - ada baris   -> selesai
--      - tidak ada   -> belum
--      - batal tandai -> hapus baris
--    UNIQUE mencegah data ganda.
-- ---------------------------------------------------------------------
CREATE TABLE task_completions (
    id           SERIAL      PRIMARY KEY,
    task_id      INT         NOT NULL,
    student_id   INT         NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_task_student UNIQUE (task_id, student_id),
    CONSTRAINT fk_tc_task
        FOREIGN KEY (task_id)    REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_tc_student
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_task_completions_student_id ON task_completions(student_id);

-- =====================================================================
-- SEEDER (data contoh)
-- Password semua akun contoh: password123  (disimpan sebagai hash bcrypt)
-- =====================================================================

-- Users: 2 guru, 3 siswa
INSERT INTO users (name, email, password_hash, role) VALUES
    ('Budi Santoso', 'budi.guru@example.com',  crypt('password123', gen_salt('bf', 10)), 'guru'),
    ('Siti Rahma',   'siti.guru@example.com',  crypt('password123', gen_salt('bf', 10)), 'guru'),
    ('Andi Pratama', 'andi.siswa@example.com', crypt('password123', gen_salt('bf', 10)), 'siswa'),
    ('Dewi Lestari', 'dewi.siswa@example.com', crypt('password123', gen_salt('bf', 10)), 'siswa'),
    ('Rizky Maulana','rizky.siswa@example.com',crypt('password123', gen_salt('bf', 10)), 'siswa');

-- Classes: masing-masing guru punya 1 kelas
INSERT INTO classes (name, teacher_id)
SELECT 'XI RPL 1', id FROM users WHERE email = 'budi.guru@example.com';

INSERT INTO classes (name, teacher_id)
SELECT 'XI RPL 2', id FROM users WHERE email = 'siti.guru@example.com';

-- Class students
INSERT INTO class_students (class_id, student_id)
SELECT c.id, u.id
FROM (VALUES
        ('XI RPL 1', 'andi.siswa@example.com'),
        ('XI RPL 1', 'dewi.siswa@example.com'),
        ('XI RPL 2', 'dewi.siswa@example.com'),
        ('XI RPL 2', 'rizky.siswa@example.com')
     ) AS v(class_name, email)
JOIN classes c ON c.name  = v.class_name
JOIN users   u ON u.email = v.email;

-- Tasks (created_by = guru pemilik kelas)
INSERT INTO tasks (class_id, created_by, title, description, due_date)
SELECT c.id, c.teacher_id, t.title, t.description, t.due_date
FROM (VALUES
        ('XI RPL 1', 'Membuat ERD Perpustakaan',
         'Buat ERD lengkap dengan kardinalitas untuk sistem perpustakaan.',
         now() + INTERVAL '3 days'),
        ('XI RPL 1', 'Latihan Query SQL Dasar',
         'Kerjakan 10 soal SELECT, WHERE, dan ORDER BY.',
         now() + INTERVAL '7 days'),
        ('XI RPL 1', 'Laporan Praktikum REST API',
         'Dokumentasikan endpoint yang sudah dibuat pada praktikum.',
         now() + INTERVAL '10 days'),
        ('XI RPL 2', 'Membuat Halaman Login',
         'Buat halaman login dengan validasi form di sisi klien.',
         now() + INTERVAL '5 days'),
        ('XI RPL 2', 'Presentasi Pemrograman Web',
         'Siapkan presentasi 5 menit tentang framework pilihan.',
         now() + INTERVAL '14 days')
     ) AS t(class_name, title, description, due_date)
JOIN classes c ON c.name = t.class_name;

-- Task completions (contoh status selesai per siswa)
INSERT INTO task_completions (task_id, student_id)
SELECT t.id, u.id
FROM (VALUES
        ('Membuat ERD Perpustakaan',  'andi.siswa@example.com'),
        ('Membuat ERD Perpustakaan',  'dewi.siswa@example.com'),
        ('Latihan Query SQL Dasar',   'andi.siswa@example.com'),
        ('Membuat Halaman Login',     'rizky.siswa@example.com')
     ) AS v(task_title, email)
JOIN tasks t ON t.title = v.task_title
JOIN users u ON u.email = v.email;

COMMIT;

-- =====================================================================
-- CONTOH QUERY: daftar tugas siswa (cari + filter status + paginasi)
-- Ganti :student_id, :search, :status, :limit, :offset dengan parameter
-- (gunakan prepared statement di backend, jangan string concatenation).
--
-- SELECT t.id, t.title, t.description, t.due_date, c.name AS class_name,
--        (tc.id IS NOT NULL) AS is_done
-- FROM tasks t
-- JOIN classes c         ON c.id = t.class_id
-- JOIN class_students cs ON cs.class_id = t.class_id AND cs.student_id = :student_id
-- LEFT JOIN task_completions tc
--        ON tc.task_id = t.id AND tc.student_id = :student_id
-- WHERE t.title ILIKE '%' || :search || '%'
--   AND ( :status = 'semua'
--      OR (:status = 'selesai' AND tc.id IS NOT NULL)
--      OR (:status = 'belum'   AND tc.id IS NULL) )
-- ORDER BY t.due_date ASC
-- LIMIT :limit OFFSET :offset;
-- =====================================================================
