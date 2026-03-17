import { z } from 'zod';

import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
} from './regex';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name too short'),
    email: z
      .string()
      .min(1, 'Email is required')
      .refine(isValidEmail, {
        message: 'Invalid email address'
      }),

    phone: z.string().optional(),

    password: z
      .string()
      .refine(isValidPassword, {
        message:
          'Password must contain letters and numbers (min 8 chars)',
      }),
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .refine(isValidEmail, {
      message: 'Invalid email address'
    }),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .refine(isValidEmail, {
      message: 'Invalid email address'
    }),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .refine(isValidPassword, {
      message: 'Password must contain letters and numbers (min 8 chars)',
    }),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const profileSchema = z
  .object({
    name: z.string().trim().optional(),
    phone: z.string().trim().refine(isValidPhone, {
      message: 'Invalid phone number'
    }),
  });