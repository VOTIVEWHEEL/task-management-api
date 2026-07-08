import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/pool';

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'inprogress' | 'done';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority: Priority;
  status?: Status;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  due_date?: string | null;
  priority?: Priority;
  status?: Status;
}

export interface TaskFilters {
  status?: Status;
  priority?: Priority;
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<Task> {
  const id = uuidv4();
  const { rows } = await pool.query(
    `INSERT INTO tasks (id, user_id, title, description, due_date, priority, status)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'todo'))
     RETURNING *`,
    [
      id,
      userId,
      input.title,
      input.description ?? null,
      input.due_date ?? null,
      input.priority,
      input.status ?? null,
    ]
  );
  return rows[0];
}

export async function getTasksForUser(userId: string, filters: TaskFilters): Promise<Task[]> {
  const conditions = ['user_id = $1'];
  const values: unknown[] = [userId];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters.priority) {
    values.push(filters.priority);
    conditions.push(`priority = $${values.length}`);
  }

  const { rows } = await pool.query(
    `SELECT * FROM tasks WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    values
  );

  return rows;
}

export async function getTaskByIdForUser(taskId: string, userId: string): Promise<Task | null> {
  const { rows } = await pool.query(
    'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
    [taskId, userId]
  );
  return rows[0] ?? null;
}

export async function updateTaskForUser(
  taskId: string,
  userId: string,
  input: UpdateTaskInput
): Promise<Task | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  const settable: (keyof UpdateTaskInput)[] = ['title', 'description', 'due_date', 'priority', 'status'];
  for (const key of settable) {
    if (input[key] !== undefined) {
      values.push(input[key]);
      fields.push(`${key} = $${values.length}`);
    }
  }

  if (fields.length === 0) {
    return getTaskByIdForUser(taskId, userId);
  }

  fields.push('updated_at = now()');
  values.push(taskId, userId);

  const { rows } = await pool.query(
    `UPDATE tasks SET ${fields.join(', ')}
     WHERE id = $${values.length - 1} AND user_id = $${values.length}
     RETURNING *`,
    values
  );

  return rows[0] ?? null;
}

export async function deleteTaskForUser(taskId: string, userId: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
    [taskId, userId]
  );
  return (rowCount ?? 0) > 0;
    }
