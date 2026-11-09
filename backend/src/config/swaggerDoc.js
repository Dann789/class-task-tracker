const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Class Task Tracker REST API",
    version: "1.0.0",
    description: "Dokumentasi REST API interaktif untuk aplikasi manajemen tugas kelas (Schooltech Indonesia).",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Development Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Masukkan JWT Token hasil dari login atau registrasi.",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Budi Santoso" },
          email: { type: "string", example: "budi.guru@example.com" },
          role: { type: "string", enum: ["guru", "siswa"], example: "guru" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "Membuat ERD Perpustakaan" },
          description: { type: "string", example: "Buat ERD lengkap dengan relasi dan kardinalitas." },
          due_date: { type: "string", format: "date-time", example: "2026-11-20T23:59:00.000Z" },
          class_id: { type: "integer", example: 1 },
          class_name: { type: "string", example: "XI RPL 1" },
          teacher_name: { type: "string", example: "Budi Santoso" },
          is_done: { type: "boolean", example: false },
          completed_at: { type: "string", format: "date-time", nullable: true },
          completed_students_count: { type: "integer", example: 2 },
          total_students_count: { type: "integer", example: 3 },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operasi berhasil" },
          data: { type: "object" },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 10 },
              totalItems: { type: "integer", example: 15 },
              totalPages: { type: "integer", example: 2 },
            },
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Pesan error" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrasi Pengguna Baru (Guru atau Siswa)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "role"],
                properties: {
                  name: { type: "string", example: "Rudi Hartono" },
                  email: { type: "string", example: "rudi@example.com" },
                  password: { type: "string", example: "password123" },
                  role: { type: "string", enum: ["guru", "siswa"], example: "siswa" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Registrasi berhasil",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
          },
          400: {
            description: "Validasi gagal atau email sudah terdaftar",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login Pengguna & Mendapatkan JWT Token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "budi.guru@example.com" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login berhasil",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
          },
          401: {
            description: "Email atau password salah",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Mengambil profil pengguna yang sedang login",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Profil pengguna berhasil diambil",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
          },
          401: { description: "Token tidak valid atau belum disediakan" },
        },
      },
    },
    "/classes": {
      get: {
        tags: ["Classes"],
        summary: "Daftar kelas aktif (kelas yang diajar guru atau diikuti siswa)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Daftar kelas berhasil diambil",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
          },
        },
      },
    },
    "/classes/all": {
      get: {
        tags: ["Classes"],
        summary: "Ambil seluruh daftar kelas di sistem",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Semua kelas berhasil diambil" },
        },
      },
    },
    "/classes/join": {
      post: {
        tags: ["Classes"],
        summary: "Siswa bergabung ke kelas",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["class_id"],
                properties: {
                  class_id: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Berhasil bergabung ke kelas" },
        },
      },
    },
    "/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "Daftar tugas dengan pencarian, filter status, dan paginasi",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "search",
            in: "query",
            description: "Cari judul tugas (didukung pg_trgm)",
            schema: { type: "string" },
          },
          {
            name: "status",
            in: "query",
            description: "Filter status tugas: semua, selesai, belum (khusus siswa)",
            schema: { type: "string", enum: ["semua", "selesai", "belum"], default: "semua" },
          },
          {
            name: "class_id",
            in: "query",
            description: "Filter ID kelas",
            schema: { type: "integer" },
          },
          {
            name: "page",
            in: "query",
            description: "Nomor halaman (default: 1)",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            description: "Jumlah tugas per halaman (default: 10)",
            schema: { type: "integer", default: 10 },
          },
        ],
        responses: {
          200: {
            description: "Daftar tugas berhasil diambil",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
          },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Membuat Tugas Baru (Khusus Guru)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "due_date", "class_id"],
                properties: {
                  title: { type: "string", example: "Tugas REST API" },
                  description: { type: "string", example: "Buat dokumentasi dan implementasi endpoint." },
                  due_date: { type: "string", format: "date-time", example: "2026-11-20T23:59:00.000Z" },
                  class_id: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Tugas berhasil dibuat" },
          403: { description: "Ditolak: hanya guru pemilik kelas yang berwenang" },
        },
      },
    },
    "/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Detail Satu Tugas",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Detail tugas berhasil diambil" },
          404: { description: "Tugas tidak ditemukan" },
        },
      },
      put: {
        tags: ["Tasks"],
        summary: "Mengubah Tugas (Khusus Guru)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "due_date", "class_id"],
                properties: {
                  title: { type: "string", example: "Tugas REST API (Updated)" },
                  description: { type: "string", example: "Deskripsi diperbarui." },
                  due_date: { type: "string", format: "date-time", example: "2026-11-25T23:59:00.000Z" },
                  class_id: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Tugas berhasil diubah" },
          403: { description: "Ditolak: bukan pemilik tugas" },
          404: { description: "Tugas tidak ditemukan" },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Menghapus Tugas (Khusus Guru)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Tugas berhasil dihapus" },
          403: { description: "Ditolak: bukan pemilik tugas" },
          404: { description: "Tugas tidak ditemukan" },
        },
      },
    },
    "/tasks/{id}/toggle-status": {
      patch: {
        tags: ["Tasks"],
        summary: "Tandai / Batal Tandai Tugas Selesai (Khusus Siswa)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: {
            description: "Status tugas berhasil diperbarui",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Tugas berhasil ditandai selesai" },
                    data: {
                      type: "object",
                      properties: {
                        task_id: { type: "integer", example: 1 },
                        is_done: { type: "boolean", example: true },
                        completed_at: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
          403: { description: "Ditolak: hanya siswa yang boleh menandai selesai" },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
