require("dotenv").config();
const { test, describe, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/database");

describe("1. Endpoint Autentikasi (/api/auth)", () => {
  after(async () => {
    // Bersihkan pool jika pengujian selesai
  });

  const uniqueSuffix = Date.now();
  const newUserData = {
    name: "User Test Formal",
    email: `test.formal.${uniqueSuffix}@example.com`,
    password: "password123",
    role: "siswa",
  };

  test("POST /api/auth/register - Registrasi berhasil mengembalikan status 201 & token JWT", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(newUserData);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, newUserData.email);
    assert.equal(res.body.data.user.role, "siswa");
    assert.ok(res.body.data.token, "Token JWT harus ada");
    assert.equal(res.body.data.user.password_hash, undefined, "Password hash tidak boleh bocor");
  });

  test("POST /api/auth/register - Registrasi gagal (400) jika email sudah terdaftar", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(newUserData);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /sudah terdaftar/i);
  });

  test("POST /api/auth/register - Registrasi gagal (400) jika format input tidak valid", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "",
        email: "bukan-email",
        password: "123",
        role: "admin",
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(Array.isArray(res.body.errors), "Harus memiliki array errors");
  });

  test("POST /api/auth/login - Login berhasil mengembalikan status 200 & token JWT", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "budi.guru@example.com",
        password: "password123",
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, "budi.guru@example.com");
    assert.equal(res.body.data.user.role, "guru");
    assert.ok(res.body.data.token);
  });

  test("POST /api/auth/login - Login gagal (401) jika password salah", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "budi.guru@example.com",
        password: "passwordsalah",
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test("GET /api/auth/me - Mengembalikan profil user jika menyertakan Bearer Token", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "budi.guru@example.com",
        password: "password123",
      });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.success, true);
    assert.equal(meRes.body.data.user.email, "budi.guru@example.com");
  });

  test("GET /api/auth/me - Menolak akses (401) jika token tidak disediakan", async () => {
    const res = await request(app).get("/api/auth/me");
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });
});
