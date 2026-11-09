const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const classRoutes = require("./routes/classRoutes");
const taskRoutes = require("./routes/taskRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Class Task Tracker API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/tasks", taskRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;