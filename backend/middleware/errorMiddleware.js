import AppError from '../utils/AppError.js';

const handleCastError = () => new AppError('Resource not found', 404);

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  return new AppError(`${field} already exists`, 400);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors || {}).map((e) => e.message);
  return new AppError(messages.join('. ') || 'Validation failed', 400);
};

export const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof AppError)) {
    if (error.name === 'CastError') {
      error = handleCastError();
    } else if (error.code === 11000) {
      error = handleDuplicateKey(error);
    } else if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    } else {
      error = new AppError(error.message || 'Internal server error', 500);
    }
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
