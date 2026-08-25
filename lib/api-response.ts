// lib/api-response.ts — Standardized API response builder and error handler for Next.js App Router
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export const API_VERSION = 'v1';

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    version: string;
    [key: string]: unknown;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    timestamp: string;
    version: string;
  };
}

export function apiSuccess<T>(data: T, extraMeta: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: API_VERSION,
        ...extraMeta,
      },
    } as ApiSuccess<T>,
    { status }
  );
}

export function apiError(
  code: string,
  message: string,
  details?: unknown,
  status = 400
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: API_VERSION,
      },
    } as ApiError,
    { status }
  );
}

export function handleRouteError(err: unknown) {
  if (err instanceof ZodError) {
    return apiError('VALIDATION_ERROR', 'The request body contains validation errors.', err.issues, 400);
  }

  const message = err instanceof Error ? err.message : 'An unexpected server error occurred.';
  console.error('[API Error]:', err);
  return apiError('INTERNAL_ERROR', message, undefined, 500);
}
