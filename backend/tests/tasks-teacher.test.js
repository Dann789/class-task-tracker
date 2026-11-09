require("dotenv").config();
const { test, describe, before } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");

describe("2. Endpoint Manajemen Tugas Guru (/api/tasks - CRUD Guru)", () => {
  let teacherToken;
  let studentToken;
  let classId;
  let createdTaskId;

  before(async () => {
    // Login Teacher (Budi)
    const teacherLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "budi.guru@example.com", password: "password123" });
    teacherToken = teacherLogin.body.data.token;

    // Login Student (Andi)
    const studentLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "andi.siswa@example.com", password: "password123" });
    studentToken = studentLogin.body.data.token;

    // Ambil kelas yang diajar Guru Budi
    const classesRes = await request(app)
      .get("/api/classes")
      .set("Authorization", `Bearer ${teacherToken}`);
    classId = classesRes.body.data[0].id;
  });

  test("POST /api/tasks - Guru berhasil membuat tugas baru (201)", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        title: "Tugas Pengujian Guru Formal",
        description: "Deskripsi tugas untuk testing otomatis",
        due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
        class_id: classId,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, "Tugas Pengujian Guru Formal");
    assert.ok(res.body.data.id);
    createdTaskId = res.body.data.id;
  });

  test("POST /api/tasks - Gagal (400) jika judul atau tenggat waktu tidak diisi", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        title: "",
        due_date: "tanggal-tidak-valid",
        class_id: classId,
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(Array.isArray(res.body.errors));
  });

  test("POST /api/tasks - Siswa ditolak membuat tugas (403 Forbidden)", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        title: "Tugas Buatan Siswa Yang Dilarang",
        due_date: new Date().toISOString(),
        class_id: classId,
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /tidak memiliki izin/i);
  });

  test("PUT /api/tasks/:id - Guru berhasil memperbarui tugas miliknya (200)", async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        title: "Tugas Pengujian Guru Formal (Telah Diperbarui)",
        description: "Deskripsi yang sudah diperbarui",
        due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
        class_id: classId,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, "Tugas Pengujian Guru Formal (Telah Diperbarui)");
  });

  test("PUT /api/tasks/:id - Siswa ditolak mengubah tugas (403 Forbidden)", async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        title: "Coba Ubah Judul oleh Siswa",
        due_date: new Date().toISOString(),
        class_id: classId,
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  test("DELETE /api/tasks/:id - Siswa ditolak menghapus tugas (403 Forbidden)", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set("Authorization", `Bearer ${studentToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  test("DELETE /api/tasks/:id - Guru berhasil menghapus tugas (200)", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set("Authorization", `Bearer ${teacherToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /berhasil dihapus/i);
  });
});
