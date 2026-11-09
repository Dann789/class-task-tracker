const express = require("express");
const { getClasses, getAllClasses, joinClass } = require("../controllers/classController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getClasses);

router.get("/all", getAllClasses);

router.post("/join", authorize("siswa"), joinClass);

module.exports = router;

