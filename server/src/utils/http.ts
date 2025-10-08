import { Response } from 'express';

// Standard HTTP response helpers
export class HttpResponse {
  static success<T>(res: Response, data: T, message = 'Success'): void {
    res.status(200).json({
      success: true,
      message,
      data
    });
  }

  static created<T>(res: Response, data: T, message = 'Created successfully'): void {
    res.status(201).json({
      success: true,
      message,
      data
    });
  }

  static badRequest(res: Response, message = 'Bad request', errors?: any): void {
    res.status(400).json({
      success: false,
      message,
      errors
    });
  }

  static unauthorized(res: Response, message = 'Unauthorized'): void {
    res.status(401).json({
      success: false,
      message
    });
  }

  static forbidden(res: Response, message = 'Forbidden'): void {
    res.status(403).json({
      success: false,
      message
    });
  }

  static notFound(res: Response, message = 'Not found'): void {
    res.status(404).json({
      success: false,
      message
    });
  }

  static serverError(res: Response, message = 'Internal server error'): void {
    res.status(500).json({
      success: false,
      message
    });
  }
}

// HTTP status codes enum
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}
