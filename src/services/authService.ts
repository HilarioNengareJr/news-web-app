import { pool } from '../data/db';
import bcrypt from 'bcryptjs';
import { User } from '../types/userType';

export class AuthService {
  public async login(email: string, password: string): Promise<User | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM admins WHERE email = $1',
        [email]
      );

      const admin = result.rows[0];
      if (!admin || !await bcrypt.compare(password, admin.password)) {
        return null;
      }

      return {
        id: admin.id,
        email: admin.email,
        isAdmin: true
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to authenticate user');
    }
  }
}