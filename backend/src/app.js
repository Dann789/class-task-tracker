const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

module.exports = app;