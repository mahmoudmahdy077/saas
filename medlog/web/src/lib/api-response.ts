/**
 * API Response Wrapper
 * Standardized API response format
 */

import { NextResponse } from 'next/server';
import { ApiResponse, PaginatedResponse, ErrorResponse } from '@/types';

export function successResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json<ApiResponse<T>>({
    data,
    message,
    status,
  }, { status });
}

export function errorResponse(error: ErrorResponse, status: number = 500) {
  return NextResponse.json<ErrorResponse>(error, { status });
}

export function paginatedResponse<T>(data: T[], pagination: PaginatedResponse<T>['pagination'], status: number = 200) {
  return NextResponse.json<PaginatedResponse<T>>({
    data,
    pagination,
  }, { status });
}

export function notFoundResponse(message: string = 'Not found') {
  return errorResponse({ error: { message, code: 'NOT_FOUND' }, status: 404 }, 404);
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return errorResponse({ error: { message, code: 'UNAUTHORIZED' }, status: 401 }, 401);
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return errorResponse({ error: { message, code: 'FORBIDDEN' }, status: 403 }, 403);
}

export function badRequestResponse(message: string = 'Bad Request') {
  return errorResponse({ error: { message, code: 'BAD_REQUEST' }, status: 400 }, 400);
}

export function conflictResponse(message: string = 'Conflict') {
  return errorResponse({ error: { message, code: 'CONFLICT' }, status: 409 }, 409);
}

export function tooManyRequestsResponse(message: string = 'Too Many Requests') {
  return errorResponse({ error: { message, code: 'RATE_LIMITED' }, status: 429 }, 429);
}
