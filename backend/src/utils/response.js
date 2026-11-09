function successResponse(res, message, data = null, statusCode = 200, pagination = null) {
  const payload = {
    success: true,
    message,
  };

  if (data !== null) {
    payload.data = data;
  }

  if (pagination !== null) {
    payload.pagination = pagination;
  }

  return res.status(statusCode).json(payload);
}

function errorResponse(res, message, statusCode = 500, errors = null) {
  const payload = {
    success: false,
    message,
  };

  if (errors !== null) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  successResponse,
  errorResponse,
};

