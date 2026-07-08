import { ApiError } from '../middleware/errorHandler';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['todo', 'inprogress', 'done'];

export function assertValidEmail(email: unknown): asserts email is string {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    throw new ApiError(400, 'A valid email is required');
  }
}

export function assertValidPassword(password: unknown): asserts password is string {
  if (typeof password !== 'string' || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long');
  }
}

export function assertValidPriority(priority: unknown): asserts priority is 'low' | 'medium' | 'high' {
  if (typeof priority !== 'string' || !PRIORITIES.includes(priority)) {
    throw new ApiError(400, `Priority must be one of: ${PRIORITIES.join(', ')}`);
  }
}

export function assertValidStatus(status: unknown): asserts status is 'todo' | 'inprogress' | 'done' {
  if (typeof status !== 'string' || !STATUSES.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${STATUSES.join(', ')}`);
  }
}

export function assertValidTitle(title: unknown): asserts title is string {
  if (typeof title !== 'string' || title.trim().length === 0 || title.length > 255) {
    throw new ApiError(400, 'Title is required and must be 1-255 characters');
  }
}

export function assertValidUUID(id: unknown): asserts id is string {
  if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
    throw new ApiError(400, 'Invalid id format');
  }
}

/** Accepts null/undefined (no due date) or a valid YYYY-MM-DD calendar date. */
export function assertValidDueDate(dueDate: unknown): asserts dueDate is string | null | undefined {
  if (dueDate === undefined || dueDate === null) return;

  if (typeof dueDate !== 'string' || !DATE_REGEX.test(dueDate)) {
    throw new ApiError(400, 'due_date must be in YYYY-MM-DD format');
  }

  const parsed = new Date(`${dueDate}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, 'due_date must be a valid calendar date');
  }
}

export function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

export const ALLOWED_PRIORITIES = PRIORITIES;
export const ALLOWED_STATUSES = STATUSES;
