import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { pool } from '../db/connection';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createUser(email: string, password: string): Promise<User> {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, role) 
     VALUES ($1, $2, $3) 
     RETURNING id, email, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt"`,
    [email, passwordHash, 'user']
  );
  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(
    `SELECT id, email, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt"
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

export async function comparePassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}
