const { errorResponse } = require("../utils/response");

function validateTask(req, res, next) {
  const { title, description, due_date, class_id } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || title.trim() === "") {
    errors.push({ field: "title", message: "Judul tugas wajib diisi" });
  } else if (title.trim().length > 150) {
    errors.push({ field: "title", message: "Judul tugas maksimal 150 karakter" });
  }

  if (!class_id || isNaN(Number(class_id)) || Number(class_id) <= 0) {
    errors.push({ field: "class_id", message: "Kelas wajib dipilih dengan ID yang valid" });
  }

  if (!due_date) {
    errors.push({ field: "due_date", message: "Tenggat waktu (due date) wajib diisi" });
  } else {
    const parsedDate = new Date(due_date);
    if (isNaN(parsedDate.getTime())) {
      errors.push({ field: "due_date", message: "Format tenggat waktu tidak valid" });
    }
  }

  if (errors.length > 0) {
    return errorResponse(res, "Validasi formulir tugas gagal", 400, errors);
  }

  req.body.title = title.trim();
  req.body.description = description ? description.trim() : "";
  req.body.class_id = Number(class_id);
  next();
}

module.exports = {
  validateTask,
};

