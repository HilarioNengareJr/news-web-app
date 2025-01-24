import { getRepository } from 'typeorm';
import { User } from '../entities/User';
import { AppError } from '../utils/errors';

export const authService = {
  async signIn(email: string, password: string) {
    try {
      const userRepository = getRepository(UserEntity);
      const user = await findUserByEmail(email);
      if (!user) {
        throw AppError.authentication('Invalid email or password');
      }

      const userInstance = new User(user);

      if (!user) {
        throw AppError.authentication('Invalid email or password');
      }

      const isValidPassword = await userInstance.comparePassword(password);
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
