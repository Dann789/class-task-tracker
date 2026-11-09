const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { errorResponse } = require("../utils/response");

const JWT_SECRET = process.env.JWT_SECRET || "class_task_tracker_secret_key_jwt_2026";

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Akses ditolak. Token tidak disediakan", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return errorResponse(res, "Akses ditolak. Format token tidak valid", 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, "Sesi tidak valid. Pengguna tidak ditemukan", 401);
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, "Sesi telah berakhir, silakan login kembali", 401);
    }
    return errorResponse(res, "Token tidak valid", 401);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, "Pengguna belum terautentikasi", 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Akses dilarang. Peran '${req.user.role}' tidak memiliki izin untuk tindakan ini`,
        403
      );
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
};

