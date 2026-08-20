class ApiError extends Error {
  constructor(message, statusCode, isOperational = true, stack = "") {
    super(message);
    this.statusCode = statusCode || 500;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const badRequest = (message) => new ApiError(message, 400);
export const unauthorized = (message) => new ApiError(message, 401);
export const forbidden = (message) => new ApiError(message, 403);
export const notFound = (message) => new ApiError(message, 404);
export const internalServerError = (message) => new ApiError(message, 500);

export default ApiError;
