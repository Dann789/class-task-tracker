const { errorResponse } = require("../utils/response");

function notFoundHandler(req, res, next) {
  return errorResponse(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
}

function errorHandler(err, req, res, next) {
  console.error("Unhandled Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || null;

  return errorResponse(res, message, statusCode, errors);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

