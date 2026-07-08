import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/pool';

const SALT_ROUNDS = 12;

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export async function createUser(email: string, password: string): Promise<Omit<User, 'password_hash'>> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = uuidv4();

  const { rows } = await pool.query(
    `INSERT INTO users (id, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, created_at`,
    [id, email.toLowerCase().trim(), passwordHash]
  );

  return rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );
  return rows[0] ?? null;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password_hash);
     }
