import { Response } from 'express';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiSuccess {
  static send<T = any>(res: Response, data: T, message?: string, statusCode: number = 200) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    return res.status(statusCode).json(response);
  }

  static sendWithPagination<T = any>(
    res: Response,
    data: T,
    pagination: ApiResponse['pagination'],
    message?: string,
    statusCode: number = 200
  ) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      pagination,
      message,
    };
    return res.status(statusCode).json(response);
  }
}

