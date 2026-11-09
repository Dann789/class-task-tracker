const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { successResponse, errorResponse } = require("../utils/response");

const JWT_SECRET = process.env.JWT_SECRET || "class_task_tracker_secret_key_jwt_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    // Cek apakah email sudah terdaftar
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return errorResponse(res, "Email sudah terdaftar. Silakan gunakan email lain", 400, [
        { field: "email", message: "Email sudah digunakan" },
      ]);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Simpan user baru
    const insertResult = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, role]
    );

    const newUser = insertResult.rows[0];
    const token = generateToken(newUser);

    return successResponse(
      res,
      "Registrasi berhasil",
      {
        user: newUser,
        token,
      },
      201
    );
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, "Email atau password salah", 401);
    }

    const user = result.rows[0];

    // Verifikasi password hash
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      return errorResponse(res, "Email atau password salah", 401);
    }

    // Hapus password_hash dari payload yang dikembalikan
    delete user.password_hash;

    const token = generateToken(user);

    return successResponse(res, "Login berhasil", {
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    return successResponse(res, "Data profil berhasil diambil", {
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
};

