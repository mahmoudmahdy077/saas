/**
 * Input Validation Schemas
 * Zod schemas for all API inputs
 */

import { z } from 'zod';

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional(),
  institutionId: z.string().uuid().optional(),
  role: z.enum(['user', 'admin', 'superadmin']).default('user'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['user', 'admin', 'superadmin']).optional(),
  institutionId: z.string().uuid().optional(),
});

// Case schemas
export const createCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  patientAge: z.number().int().min(0).max(150, 'Invalid age'),
  patientGender: z.enum(['male', 'female', 'other']),
  diagnosis: z.string().min(10, 'Diagnosis required'),
  treatment: z.string().min(10, 'Treatment required'),
  outcome: z.string().min(10, 'Outcome required'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags').optional(),
});

export const updateCaseSchema = createCaseSchema.partial();

export const caseStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']),
});

// Image schemas
export const uploadImageSchema = z.object({
  url: z.string().url('Invalid URL'),
  caption: z.string().max(500).optional(),
  order: z.number().int().min(0),
});

// Institution schemas
export const createInstitutionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: z.enum(['hospital', 'clinic', 'university', 'research']),
  country: z.string().min(2, 'Country required'),
});

export const institutionSettingsSchema = z.object({
  branding: z.object({
    logoUrl: z.string().url().optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  }).optional(),
  features: z.object({
    cases: z.boolean().default(true),
    analytics: z.boolean().default(true),
    marketplace: z.boolean().default(true),
    integrations: z.boolean().default(true),
  }).optional(),
  limits: z.object({
    maxUsers: z.number().int().min(1).optional(),
    maxCases: z.number().int().min(1).optional(),
    maxStorage: z.number().int().min(1).optional(),
  }).optional(),
});

// Analytics schemas
export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  institutionId: z.string().uuid().optional(),
  category: z.string().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Utility types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type CreateInstitutionInput = z.infer<typeof createInstitutionSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;

// Validation helper
export function validate<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  return schema.parse(data);
}

export function validateSafe<T extends z.ZodType>(schema: T, data: unknown) {
  return schema.safeParse(data);
}
