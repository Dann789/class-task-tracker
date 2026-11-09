require("dotenv").config();
const { test, describe, before } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");

describe("3. Endpoint Daftar Tugas & Aksi Siswa (/api/tasks - Read, Filter, Toggle)", () => {
  let studentToken;
  let teacherToken;
  let sampleTaskId;

  before(async () => {
    // Login Student (Andi)
    const studentLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "andi.siswa@example.com", password: "password123" });
    studentToken = studentLogin.body.data.token;

    // Login Teacher (Budi)
    const teacherLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "budi.guru@example.com", password: "password123" });
    teacherToken = teacherLogin.body.data.token;
  });

  test("GET /api/tasks - Siswa dapat melihat daftar tugas kelasnya dengan paginasi", async () => {
    const res = await request(app)
      .get("/api/tasks?page=1&limit=2")
      .set("Authorization", `Bearer ${studentToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.pagination);
    assert.equal(res.body.pagination.page, 1);
    assert.equal(res.body.pagination.limit, 2);
    assert.ok(res.body.pagination.totalItems >= 1);

    // Ambil id tugas contoh untuk pengetesan toggle
    sampleTaskId = res.body.data[0].id;
  });

  test("GET /api/tasks - Pencarian berdasarkan judul tugas (search parameter)", async () => {
    const res = await request(app)
      .get("/api/tasks?search=ERD")
      .set("Authorization", `Bearer ${studentToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    res.body.data.forEach((task) => {
      assert.match(task.title, /ERD/i);
    });
  });

  test("GET /api/tasks - Filter tugas berdasarkan status selesai (?status=selesai)", async () => {
    const res = await request(app)
      .get("/api/tasks?status=selesai")
      .set("Authorization", `Bearer ${studentToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    res.body.data.forEach((task) => {
      assert.equal(task.is_done, true, "Semua tugas hasil filter harus berstatus is_done: true");
    });
  });

  test("GET /api/tasks - Filter tugas berdasarkan status belum selesai (?status=belum)", async () => {
    const res = await request(app)
      .get("/api/tasks?status=belum")
      .set("Authorization", `Bearer ${studentToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    res.body.data.forEach((task) => {
      assert.equal(task.is_done, false, "Semua tugas hasil filter harus berstatus is_done: false");
    });
  });

  test("PATCH /api/tasks/:id/toggle-status - Siswa dapat mengubah status penyelesaian tugas", async () => {
    // Langkah 1: Toggle pertama
    const toggle1 = await request(app)
      .patch(`/api/tasks/${sampleTaskId}/toggle-status`)
      .set("Authorization", `Bearer ${studentToken}`);

    assert.equal(toggle1.status, 200);
    assert.equal(toggle1.body.success, true);
    const firstStatus = toggle1.body.data.is_done;

    // Langkah 2: Toggle kedua (kebalikan dari status sebelumnya)
    const toggle2 = await request(app)
      .patch(`/api/tasks/${sampleTaskId}/toggle-status`)
      .set("Authorization", `Bearer ${studentToken}`);

    assert.equal(toggle2.status, 200);
    assert.equal(toggle2.body.success, true);
    assert.equal(toggle2.body.data.is_done, !firstStatus);
  });

  test("PATCH /api/tasks/:id/toggle-status - Guru ditolak mengubah status siswa (403 Forbidden)", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${sampleTaskId}/toggle-status`)
      .set("Authorization", `Bearer ${teacherToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /tidak memiliki izin/i);
  });
});
