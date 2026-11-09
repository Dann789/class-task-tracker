const pool = require("../config/database");
const { successResponse } = require("../utils/response");

async function getClasses(req, res, next) {
  try {
    const user = req.user;

    if (user.role === "guru") {
      const result = await pool.query(
        `SELECT c.id, c.name, c.teacher_id, c.created_at,
                COUNT(cs.student_id)::int AS student_count
         FROM classes c
         LEFT JOIN class_students cs ON cs.class_id = c.id
         WHERE c.teacher_id = $1
         GROUP BY c.id
         ORDER BY c.name ASC`,
        [user.id]
      );
      return successResponse(res, "Daftar kelas guru berhasil diambil", result.rows);
    } else {
      const result = await pool.query(
        `SELECT c.id, c.name, c.teacher_id, u.name AS teacher_name, cs.joined_at
         FROM classes c
         JOIN class_students cs ON cs.class_id = c.id
         JOIN users u ON u.id = c.teacher_id
         WHERE cs.student_id = $1
         ORDER BY c.name ASC`,
        [user.id]
      );
      return successResponse(res, "Daftar kelas siswa berhasil diambil", result.rows);
    }
  } catch (error) {
    next(error);
  }
}

async function getAllClasses(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.teacher_id, u.name AS teacher_name
       FROM classes c
       JOIN users u ON u.id = c.teacher_id
       ORDER BY c.name ASC`
    );
    return successResponse(res, "Semua kelas berhasil diambil", result.rows);
  } catch (error) {
    next(error);
  }
}

async function joinClass(req, res, next) {
  try {
    const studentId = req.user.id;
    const { class_id } = req.body;

    if (!class_id) {
      return errorResponse(res, "class_id wajib diisi", 400);
    }

    await pool.query(
      `INSERT INTO class_students (class_id, student_id)
       VALUES ($1, $2)
       ON CONFLICT (class_id, student_id) DO NOTHING`,
      [class_id, studentId]
    );

    return successResponse(res, "Berhasil bergabung ke kelas", null, 201);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getClasses,
  getAllClasses,
  joinClass,
};

