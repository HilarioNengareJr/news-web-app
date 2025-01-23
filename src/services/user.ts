import { getRepository } from 'typeorm';
import { UserEntity } from '../entities/User';
import { AppError } from '../utils/errors';

export const userService = {
  async register(email: string, password: string) {
    const userRepository = getRepository(UserEntity);
    
    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw AppError.validation('Email already registered');
    }

    // Create new user
    const user = new UserEntity();
    user.email = email;
    user.passwordHash = password; // Will be hashed by the entity hooks
    user.role = 'user'; // Default role

    await userRepository.save(user);
    
    return {
      id: user.id,
      email: user.email,
      role: user.role
    };
  }
};
