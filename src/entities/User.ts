import { pool } from '../db/connection';
import * as bcrypt from 'bcryptjs';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  comparePassword(password: string): Promise<boolean>;
}

export class User implements UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  role: string;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.email = user.email;
    this.passwordHash = user.passwordHash;
    this.role = user.role;
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }
}

export async function createUser(email: string, password: string): Promise<UserEntity> {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query<User>(
    `INSERT INTO users (email, password_hash) 
     VALUES ($1, $2) 
     RETURNING id, email, password_hash as "passwordHash", role`,
    [email, passwordHash]
  );
  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<UserEntity | null> {
  const result = await pool.query<User>(
    `SELECT id, email, password_hash as "passwordHash", role
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

export async function comparePassword(user: UserEntity, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

export async function updateUser(id: string, updates: Partial<UserEntity>): Promise<UserEntity> {
  const result = await pool.query<User>(
    `UPDATE users 
     SET email = COALESCE($1, email),
         password_hash = COALESCE($2, password_hash),
         role = COALESCE($3, role)
     WHERE id = $4
     RETURNING id, email, password_hash as "passwordHash", role`,
    [updates.email, updates.passwordHash, updates.role, id]
  );
  return result.rows[0];
}

export async function deleteUser(id: string): Promise<void> {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

export async function isAdmin(userId: string): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1 FROM users 
      WHERE id = $1 AND role = 'admin'
    )`,
    [userId]
  );
  return result.rows[0].exists;
}
