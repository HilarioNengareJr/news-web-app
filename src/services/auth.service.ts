import { findUserByEmail } from '../entities/User';
import { AppError } from '../utils/errors';

export const authService = {
  async signIn(email: string, password: string) {
    try {
      const user = await findUserByEmail(email);
      if (!user) {
        throw AppError.authentication('Invalid email or password');
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw AppError.authentication('Invalid email or password');
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      throw AppError.authentication('Authentication failed');
    }
  }
};
import * as bcrypt from 'bcryptjs';
