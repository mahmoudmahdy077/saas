/**
 * API Error Handler
 * Centralized error handling for API routes
 */

import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  code: string;
  details?: any;
  status?: number;
}

export class HttpError extends Error {
  constructor(
    public code: string,
    public status: number = 500,
    public details?: any
  ) {
    super(code);
    this.name = 'HttpError';
  }
}

export function createErrorResponse(error: ApiError | Error, status: number = 500) {
  const apiError: ApiError = error instanceof HttpError 
    ? { message: error.code, code: error.code, status: error.status, details: error.details }
    : error instanceof Error
    ? { message: error.message, code: 'INTERNAL_ERROR', status }
    : { message: 'Unknown error', code: 'UNKNOWN_ERROR', status };

  return NextResponse.json(apiError, { status: apiError.status || status });
}

export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(handler: T) {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof HttpError) {
        return createErrorResponse(error, error.status);
      }
      
      // Log error for monitoring
      
      
      return createErrorResponse(
        error instanceof Error ? error : new Error('Unknown error'),
        500
      );
    }
  };
}

// Common HTTP errors
export const errors = {
  badRequest: (message: string = 'Bad Request') => new HttpError(message, 400),
  unauthorized: (message: string = 'Unauthorized') => new HttpError(message, 401),
  forbidden: (message: string = 'Forbidden') => new HttpError(message, 403),
  notFound: (message: string = 'Not Found') => new HttpError(message, 404),
  conflict: (message: string = 'Conflict') => new HttpError(message, 409),
  tooManyRequests: (message: string = 'Too Many Requests') => new HttpError(message, 429),
  internal: (message: string = 'Internal Server Error') => new HttpError(message, 500),
  badGateway: (message: string = 'Bad Gateway') => new HttpError(message, 502),
  serviceUnavailable: (message: string = 'Service Unavailable') => new HttpError(message, 503),
};
