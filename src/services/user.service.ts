/**
 * @license MIT 
 * @copyright Hilario Junior Nengare 2025
 */

'use strict';

/**
 * Node Modules
 */
import { getRepository } from 'typeorm';

/**
 * Custom Modules
 */
import { userService } from './user.service';
import { UserEntity } from '../entities/User';
import { AppError } from '../utils/errors';

/**
 * User service
 */
export const userService = {

  /**
   * 
   * @param email 
   * @param password 
   * @returns 
   */
  async register(email: string, password: string) {
    const userRepository = getRepository(UserEntity);
  
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw AppError.validation('Email already registered');
    }

    // Create new user
    const user = new UserEntity();3
    user.email = email;
    // Will be hashed by the entity hooks
    user.passwordHash = password; 
    // Default role
    user.role = 'user'; 

    
    await userRepository.save(user);
    
    return {
      id: user.id,
      email: user.email,
      role: user.role
    };
  }
};
