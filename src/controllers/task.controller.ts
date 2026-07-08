import { Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import {
  createTask,
  getTasksForUser,
  getTaskByIdForUser,
  updateTaskForUser,
  deleteTaskForUser,
} from '../services/task.service';
import {
  assertValidTitle,
  assertValidPriority,
  assertValidUUID,
  assertValidDueDate,
  isOneOf,
  ALLOWED_PRIORITIES,
  ALLOWED_STATUSES,
} from '../utils/validate';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, due_date, priority, status } = req.body;

  assertValidTitle(title);
  assertValidPriority(priority);
  assertValidDueDate(due_date);

  if (status !== undefined && !isOneOf(status, ALLOWED_STATUSES as readonly string[])) {
    throw new ApiError(400, `Status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }

  const task = await createTask(req.userId as string, {
    title: title.trim(),
    description: description ?? null,
    due_date: due_date ?? null,
    priority,
    status,
  });

  res.status(201).json({ task });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { status, priority } = req.query;

  if (status !== undefined && !isOneOf(status, ALLOWED_STATUSES as readonly string[])) {
    throw new ApiError(400, `status filter must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }
  if (priority !== undefined && !isOneOf(priority, ALLOWED_PRIORITIES as readonly string[])) {
    throw new ApiError(400, `priority filter must be one of: ${ALLOWED_PRIORITIES.join(', ')}`);
  }

  const tasks = await getTasksForUser(req.userId as string, {
    status: status as never,
    priority: priority as never,
  });

  res.json({ tasks });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  assertValidUUID(req.params.id);
  const task = await getTaskByIdForUser(req.params.id as string, req.userId as string);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  res.json({ task });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, due_date, priority, status } = req.body;

  assertValidUUID(req.params.id);
  if (title !== undefined) assertValidTitle(title);
  if (priority !== undefined) assertValidPriority(priority);
  if (due_date !== undefined) assertValidDueDate(due_date);
  if (status !== undefined && !isOneOf(status, ALLOWED_STATUSES as readonly string[])) {
    throw new ApiError(400, `Status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }

  const task = await updateTaskForUser(req.params.id as string, req.userId as string, {
    title,
    description,
    due_date,
    priority,
    status,
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  res.json({ task });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  assertValidUUID(req.params.id);
  const deleted = await deleteTaskForUser(req.params.id as string, req.userId as string);
  if (!deleted) {
    throw new ApiError(404, 'Task not found');
  }
  res.status(204).send();
});
