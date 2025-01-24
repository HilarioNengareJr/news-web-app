import { getRepository } from 'typeorm';
import { UserEntity } from '../entities/User.js';
import { AppError } from '../utils/errors';

export const authService = {
  async signIn(email: string, password: string) {
    try {
      const userRepository = getRepository(UserEntity);
      const user = await userRepository.findOne({ where: { email } });

      if (!user) {
        throw AppError.authentication('Invalid email or password');
      }

      const isValidPassword = await user.comparePassword(password);
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
