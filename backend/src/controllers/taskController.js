const pool = require("../config/database");
const { successResponse, errorResponse } = require("../utils/response");

async function getTasks(req, res, next) {
  try {
    const user = req.user;
    const {
      search = "",
      status = "semua",
      class_id,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const normalizedStatus = status.toLowerCase();

    if (user.role === "siswa") {
      let whereClauses = [
        "cs.student_id = $1",
        "t.title ILIKE $" + 2,
      ];
      let queryParams = [user.id, `%${search}%`];
      let paramIndex = 3;

      if (class_id) {
        whereClauses.push(`t.class_id = $${paramIndex}`);
        queryParams.push(Number(class_id));
        paramIndex++;
      }

      if (["selesai", "completed"].includes(normalizedStatus)) {
        whereClauses.push("tc.id IS NOT NULL");
      } else if (["belum", "pending", "belum_selesai"].includes(normalizedStatus)) {
        whereClauses.push("tc.id IS NULL");
      }

      const whereSql = whereClauses.join(" AND ");

      const countQuery = `
        SELECT COUNT(DISTINCT t.id)::int AS total
        FROM tasks t
        JOIN classes c         ON c.id = t.class_id
        JOIN class_students cs ON cs.class_id = t.class_id
        LEFT JOIN task_completions tc
               ON tc.task_id = t.id AND tc.student_id = $1
        WHERE ${whereSql}
      `;
      const countResult = await pool.query(countQuery, queryParams);
      const totalItems = countResult.rows[0].total;

      const dataQuery = `
        SELECT t.id, t.title, t.description, t.due_date, t.class_id, t.created_at, t.updated_at,
               c.name AS class_name, u.name AS teacher_name,
               (tc.id IS NOT NULL) AS is_done,
               tc.completed_at
        FROM tasks t
        JOIN classes c         ON c.id = t.class_id
        JOIN class_students cs ON cs.class_id = t.class_id
        JOIN users u           ON u.id = t.created_by
        LEFT JOIN task_completions tc
               ON tc.task_id = t.id AND tc.student_id = $1
        WHERE ${whereSql}
        ORDER BY t.due_date ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      queryParams.push(limitNum, offset);

      const dataResult = await pool.query(dataQuery, queryParams);

      return successResponse(
        res,
        "Daftar tugas siswa berhasil diambil",
        dataResult.rows,
        200,
        {
          page: pageNum,
          limit: limitNum,
          totalItems,
          totalPages: Math.ceil(totalItems / limitNum) || 1,
        }
      );
    } else {
      let whereClauses = [
        "t.created_by = $1",
        "t.title ILIKE $" + 2,
      ];
      let queryParams = [user.id, `%${search}%`];
      let paramIndex = 3;

      if (class_id) {
        whereClauses.push(`t.class_id = $${paramIndex}`);
        queryParams.push(Number(class_id));
        paramIndex++;
      }

      const whereSql = whereClauses.join(" AND ");

      const countQuery = `
        SELECT COUNT(DISTINCT t.id)::int AS total
        FROM tasks t
        WHERE ${whereSql}
      `;
      const countResult = await pool.query(countQuery, queryParams);
      const totalItems = countResult.rows[0].total;

      const dataQuery = `
        SELECT t.id, t.title, t.description, t.due_date, t.class_id, t.created_at, t.updated_at,
               c.name AS class_name,
               COUNT(DISTINCT tc.student_id)::int AS completed_students_count,
               COUNT(DISTINCT cs.student_id)::int AS total_students_count
        FROM tasks t
        JOIN classes c ON c.id = t.class_id
        LEFT JOIN class_students cs ON cs.class_id = t.class_id
        LEFT JOIN task_completions tc ON tc.task_id = t.id
        WHERE ${whereSql}
        GROUP BY t.id, c.name, c.id
        ORDER BY t.due_date ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      queryParams.push(limitNum, offset);

      const dataResult = await pool.query(dataQuery, queryParams);

      return successResponse(
        res,
        "Daftar tugas guru berhasil diambil",
        dataResult.rows,
        200,
        {
          page: pageNum,
          limit: limitNum,
          totalItems,
          totalPages: Math.ceil(totalItems / limitNum) || 1,
        }
      );
    }
  } catch (error) {
    next(error);
  }
}

async function getTaskById(req, res, next) {
  try {
    const { id } = req.params;
    const user = req.user;

    const taskResult = await pool.query(
      `SELECT t.*, c.name AS class_name, u.name AS teacher_name
       FROM tasks t
       JOIN classes c ON c.id = t.class_id
       JOIN users u ON u.id = t.created_by
       WHERE t.id = $1`,
      [id]
    );

    if (taskResult.rows.length === 0) {
      return errorResponse(res, "Tugas tidak ditemukan", 404);
    }

    const task = taskResult.rows[0];

    if (user.role === "siswa") {
      const completionResult = await pool.query(
        "SELECT completed_at FROM task_completions WHERE task_id = $1 AND student_id = $2",
        [id, user.id]
      );
      task.is_done = completionResult.rows.length > 0;
      task.completed_at = completionResult.rows[0]?.completed_at || null;
    } else {
      const studentsCompleted = await pool.query(
        `SELECT u.id, u.name, u.email, tc.completed_at
         FROM task_completions tc
         JOIN users u ON u.id = tc.student_id
         WHERE tc.task_id = $1
         ORDER BY tc.completed_at ASC`,
        [id]
      );
      task.completed_students = studentsCompleted.rows;
    }

    return successResponse(res, "Detail tugas berhasil diambil", task);
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description, due_date, class_id } = req.body;
    const teacherId = req.user.id;

    const classCheck = await pool.query(
      "SELECT id, name FROM classes WHERE id = $1 AND teacher_id = $2",
      [class_id, teacherId]
    );

    if (classCheck.rows.length === 0) {
      return errorResponse(
        res,
        "Kelas tidak ditemukan atau Anda tidak memiliki akses ke kelas ini",
        403
      );
    }

    const insertResult = await pool.query(
      `INSERT INTO tasks (class_id, created_by, title, description, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, class_id, created_by, title, description, due_date, created_at, updated_at`,
      [class_id, teacherId, title, description || null, new Date(due_date)]
    );

    const newTask = insertResult.rows[0];
    newTask.class_name = classCheck.rows[0].name;

    return successResponse(res, "Tugas berhasil dibuat", newTask, 201);
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, due_date, class_id } = req.body;
    const teacherId = req.user.id;

    const existingTask = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (existingTask.rows.length === 0) {
      return errorResponse(res, "Tugas tidak ditemukan", 404);
    }

    if (existingTask.rows[0].created_by !== teacherId) {
      return errorResponse(
        res,
        "Anda tidak memiliki izin untuk mengubah tugas ini",
        403
      );
    }

    const classCheck = await pool.query(
      "SELECT id, name FROM classes WHERE id = $1 AND teacher_id = $2",
      [class_id, teacherId]
    );

    if (classCheck.rows.length === 0) {
      return errorResponse(
        res,
        "Kelas tidak valid atau Anda tidak memiliki akses ke kelas tersebut",
        403
      );
    }

    const updateResult = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, due_date = $3, class_id = $4
       WHERE id = $5
       RETURNING id, class_id, created_by, title, description, due_date, created_at, updated_at`,
      [title, description || null, new Date(due_date), class_id, id]
    );

    const updatedTask = updateResult.rows[0];
    updatedTask.class_name = classCheck.rows[0].name;

    return successResponse(res, "Tugas berhasil diperbarui", updatedTask);
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const existingTask = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (existingTask.rows.length === 0) {
      return errorResponse(res, "Tugas tidak ditemukan", 404);
    }

    if (existingTask.rows[0].created_by !== teacherId) {
      return errorResponse(
        res,
        "Anda tidak memiliki izin untuk menghapus tugas ini",
        403
      );
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    return successResponse(res, "Tugas berhasil dihapus", { id: Number(id) });
  } catch (error) {
    next(error);
  }
}

async function toggleTaskStatus(req, res, next) {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const taskCheck = await pool.query(
      `SELECT t.id, t.title
       FROM tasks t
       JOIN class_students cs ON cs.class_id = t.class_id AND cs.student_id = $1
       WHERE t.id = $2`,
      [studentId, id]
    );

    if (taskCheck.rows.length === 0) {
      return errorResponse(
        res,
        "Tugas tidak ditemukan atau Anda tidak terdaftar di kelas tugas ini",
        404
      );
    }

    const existing = await pool.query(
      "SELECT id FROM task_completions WHERE task_id = $1 AND student_id = $2",
      [id, studentId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        "DELETE FROM task_completions WHERE task_id = $1 AND student_id = $2",
        [id, studentId]
      );

      return successResponse(res, "Tugas ditandai belum selesai", {
        task_id: Number(id),
        is_done: false,
      });
    } else {
      const insertResult = await pool.query(
        `INSERT INTO task_completions (task_id, student_id)
         VALUES ($1, $2)
         RETURNING completed_at`,
        [id, studentId]
      );

      return successResponse(res, "Tugas berhasil ditandai selesai", {
        task_id: Number(id),
        is_done: true,
        completed_at: insertResult.rows[0].completed_at,
      });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
};

