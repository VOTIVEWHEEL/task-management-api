import { Request, Response, NextFunction, RequestHandler } from 'express';

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Wraps an async route handler so rejected promises are forwarded
 * to Express's error handling middleware instead of crashing the process.
 */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Malformed JSON in the request body (thrown by express's json body-parser
  // before our route handlers ever run).
  if (isRecord(err) && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }

  // Defense-in-depth: translate known PostgreSQL error codes into clean 4xx
  // responses in case something slips past our own input validation
  // (e.g. a race condition on a unique constraint).
  if (isRecord(err) && typeof err.code === 'string') {
    switch (err.code) {
      case '22P02': // invalid_text_representation, e.g. malformed UUID
        return res.status(400).json({ error: 'Invalid id or field format' });
      case '22007': // invalid_datetime_format
      case '22008': // datetime_field_overflow
        return res.status(400).json({ error: 'Invalid date format' });
      case '23505': // unique_violation
        return res.status(409).json({ error: 'Resource already exists' });
      case '23503': // foreign_key_violation
        return res.status(400).json({ error: 'Referenced resource does not exist' });
      default:
        break;
    }
  }

  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Internal server error' });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'Route not found' });
    }
