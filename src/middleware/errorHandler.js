import { AppError, ErrorType, ErrorMessages } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    type: err.type,
    message: err.message,
    status: err.status,
    stack: err.stack,
    details: err.details
  });

  // If headers are already sent, delegate to Express's default error handler
  if (res.headersSent) {
    return next(err);
  }

  // Convert unknown errors to AppError
  if (!(err instanceof AppError)) {
    err = AppError.server(err.message);
  }

  // Format the response based on the request type
  res.status(err.status).format({
    'application/json': () => {
      res.json({
        error: {
          type: err.type,
          message: err.userMessage,
          status: err.status
        }
      });
    },
    'text/html': () => {
      res.render('error', {
        title: getErrorTitle(err.type),
        message: err.userMessage,
        status: err.status,
        type: err.type
      });
    },
    default: () => {
      res.render('error', {
        title: getErrorTitle(err.type),
        message: err.userMessage,
        status: err.status,
        type: err.type
      });
    }
  });
};

function getErrorTitle(type) {
  switch (type) {
    case ErrorType.AUTHENTICATION:
      return 'Authentication Error';
    case ErrorType.AUTHORIZATION:
      return 'Access Denied';
    case ErrorType.NOT_FOUND:
      return 'Not Found';
    case ErrorType.VALIDATION:
      return 'Invalid Input';
    case ErrorType.DATABASE:
      return 'Database Error';
    case ErrorType.SERVER:
      return 'Server Error';
    default:
      return 'Error';
  }
}