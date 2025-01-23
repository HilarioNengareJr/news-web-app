// Error types
export const ErrorType = {
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION',
  DATABASE: 'DATABASE',
  SERVER: 'SERVER'
};

// User-friendly error messages
export const ErrorMessages = {
  [ErrorType.AUTHENTICATION]: {
    default: 'Unable to sign in. Please check your credentials and try again.',
    invalid: 'The email or password you entered is incorrect.',
    expired: 'Your session has expired. Please sign in again.',
  },
  [ErrorType.AUTHORIZATION]: {
    default: 'You don\'t have permission to perform this action.',
    adminOnly: 'This action requires admin privileges.',
  },
  [ErrorType.NOT_FOUND]: {
    default: 'The requested resource was not found.',
    article: 'The article you\'re looking for doesn\'t exist or has been removed.',
    page: 'The page you\'re looking for doesn\'t exist.',
  },
  [ErrorType.VALIDATION]: {
    default: 'Please check your input and try again.',
    required: 'Please fill in all required fields.',
    email: 'Please enter a valid email address.',
    password: 'Password must be at least 6 characters long.',
  },
  [ErrorType.DATABASE]: {
    default: 'Unable to complete your request. Please try again later.',
    connection: 'We\'re having trouble connecting to our database. Please try again later.',
  },
  [ErrorType.SERVER]: {
    default: 'Something went wrong. Please try again later.',
    maintenance: 'We\'re performing maintenance. Please try again in a few minutes.',
  }
};

// Error handler class
export class AppError extends Error {
  constructor(type, message, status = 500, details = null) {
    super(message);
    this.type = type;
    this.status = status;
    this.details = details;
    this.userMessage = message || ErrorMessages[type].default;
  }

  static authentication(message = null, details = null) {
    return new AppError(ErrorType.AUTHENTICATION, message, 401, details);
  }

  static authorization(message = null, details = null) {
    return new AppError(ErrorType.AUTHORIZATION, message, 403, details);
  }

  static notFound(message = null, details = null) {
    return new AppError(ErrorType.NOT_FOUND, message, 404, details);
  }

  static validation(message = null, details = null) {
    return new AppError(ErrorType.VALIDATION, message, 400, details);
  }

  static database(message = null, details = null) {
    return new AppError(ErrorType.DATABASE, message, 500, details);
  }

  static server(message = null, details = null) {
    return new AppError(ErrorType.SERVER, message, 500, details);
  }
}