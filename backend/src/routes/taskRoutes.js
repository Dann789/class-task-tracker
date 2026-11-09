const express = require("express");
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
} = require("../controllers/taskController");
const { validateTask } = require("../validators/taskValidator");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getTasks);
router.get("/:id", getTaskById);

router.post("/", authorize("guru"), validateTask, createTask);
router.put("/:id", authorize("guru"), validateTask, updateTask);
router.delete("/:id", authorize("guru"), deleteTask);

router.patch("/:id/toggle-status", authorize("siswa"), toggleTaskStatus);

module.exports = router;

