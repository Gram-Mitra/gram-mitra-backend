/**
 * Standard API Response format helpers
 */

const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, error = 'Internal Server Error', statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    error,
    ...(details && { details }),
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
