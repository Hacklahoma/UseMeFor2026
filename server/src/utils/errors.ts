// Custom error classes
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

// Error handler utility
export const handleError = (error: Error): { message: string; statusCode: number } => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode
    };
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    return {
      message: 'Validation failed',
      statusCode: 400
    };
  }

  // Handle Mongoose duplicate key errors
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    return {
      message: 'Resource already exists',
      statusCode: 409
    };
  }

  // Default to internal server error
  return {
    message: 'Internal server error',
    statusCode: 500
  };
};
