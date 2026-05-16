import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(res: Response, data: T, message = 'Created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }

  static error(res: Response, message = 'Internal Server Error', statusCode = 500, details?: string) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(details && { details }),
    });
  }

  static notFound(res: Response, message = 'Resource not found') {
    return ApiResponse.error(res, message, 404);
  }

  static badRequest(res: Response, message = 'Bad request') {
    return ApiResponse.error(res, message, 400);
  }
}
