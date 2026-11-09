const { errorResponse } = require("../utils/response");

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateRegister(req, res, next) {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.push({ field: "name", message: "Nama wajib diisi" });
  } else if (name.trim().length > 100) {
    errors.push({ field: "name", message: "Nama maksimal 100 karakter" });
  }

  if (!email || typeof email !== "string" || email.trim() === "") {
    errors.push({ field: "email", message: "Email wajib diisi" });
  } else if (!validateEmail(email.trim())) {
    errors.push({ field: "email", message: "Format email tidak valid" });
  } else if (email.trim().length > 150) {
    errors.push({ field: "email", message: "Email maksimal 150 karakter" });
  }

  if (!password || typeof password !== "string") {
    errors.push({ field: "password", message: "Password wajib diisi" });
  } else if (password.length < 6) {
    errors.push({ field: "password", message: "Password minimal 6 karakter" });
  }

  if (!role || typeof role !== "string") {
    errors.push({ field: "role", message: "Peran wajib dipilih ('guru' atau 'siswa')" });
  } else if (!["guru", "siswa"].includes(role.toLowerCase())) {
    errors.push({ field: "role", message: "Peran harus berupa 'guru' atau 'siswa'" });
  }

  if (errors.length > 0) {
    return errorResponse(res, "Validasi formulir gagal", 400, errors);
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.role = role.toLowerCase();
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== "string" || email.trim() === "") {
    errors.push({ field: "email", message: "Email wajib diisi" });
  } else if (!validateEmail(email.trim())) {
    errors.push({ field: "email", message: "Format email tidak valid" });
  }

  if (!password || typeof password !== "string" || password === "") {
    errors.push({ field: "password", message: "Password wajib diisi" });
  }

  if (errors.length > 0) {
    return errorResponse(res, "Validasi formulir gagal", 400, errors);
  }

  req.body.email = email.trim().toLowerCase();
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
};

