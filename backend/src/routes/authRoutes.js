const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../validators/authValidator");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Endpoint publik
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

// Endpoint terproteksi
router.get("/me", authenticate, getMe);

module.exports = router;

