import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Login validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Registration validation schema
const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: error.errors
        }
      });
    }
    next(error);
  }
};

export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  try {
    registrationSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: error.errors
        }
      });
    }
    next(error);
  }
};
