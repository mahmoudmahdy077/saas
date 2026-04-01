/**
 * Unit Tests for Core Utilities
 * Test coverage for critical functions
 */

import { describe, it, expect } from 'vitest';
import { validateSafe } from '../lib/validation';
import { createCaseSchema, createUserSchema, paginationSchema } from '../lib/validation';

describe('Validation', () => {
  describe('createUserSchema', () => {
    it('should validate valid user input', () => {
      const validUser = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = validateSafe(createUserSchema, validUser);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = validateSafe(createUserSchema, invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject short password', () => {
      const invalidUser = {
        email: 'test@example.com',
        password: 'short',
      };

      const result = validateSafe(createUserSchema, invalidUser);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const minimalUser = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = validateSafe(createUserSchema, minimalUser);
      expect(result.success).toBe(true);
    });
  });

  describe('createCaseSchema', () => {
    it('should validate valid case input', () => {
      const validCase = {
        title: 'Case Study: Appendectomy',
        description: 'This is a detailed description of the case with sufficient length.',
        patientAge: 35,
        patientGender: 'male' as const,
        diagnosis: 'Acute appendicitis',
        treatment: 'Laparoscopic appendectomy',
        outcome: 'Full recovery with no complications',
      };

      const result = validateSafe(createCaseSchema, validCase);
      expect(result.success).toBe(true);
    });

    it('should reject title too long', () => {
      const invalidCase = {
        title: 'A'.repeat(201),
        description: 'Valid description here',
        patientAge: 35,
        patientGender: 'male' as const,
        diagnosis: 'Diagnosis',
        treatment: 'Treatment',
        outcome: 'Outcome',
      };

      const result = validateSafe(createCaseSchema, invalidCase);
      expect(result.success).toBe(false);
    });

    it('should reject invalid age', () => {
      const invalidCase = {
        title: 'Valid Title',
        description: 'Valid description',
        patientAge: 200,
        patientGender: 'male' as const,
        diagnosis: 'Diagnosis',
        treatment: 'Treatment',
        outcome: 'Outcome',
      };

      const result = validateSafe(createCaseSchema, invalidCase);
      expect(result.success).toBe(false);
    });

    it('should accept valid tags', () => {
      const validCase = {
        title: 'Case Title',
        description: 'Valid description',
        patientAge: 35,
        patientGender: 'female' as const,
        diagnosis: 'Diagnosis',
        treatment: 'Treatment',
        outcome: 'Outcome',
        tags: ['surgery', 'emergency', 'laparoscopic'],
      };

      const result = validateSafe(createCaseSchema, validCase);
      expect(result.success).toBe(true);
    });

    it('should reject too many tags', () => {
      const invalidCase = {
        title: 'Case Title',
        description: 'Valid description',
        patientAge: 35,
        patientGender: 'female' as const,
        diagnosis: 'Diagnosis',
        treatment: 'Treatment',
        outcome: 'Outcome',
        tags: Array(11).fill('tag'),
      };

      const result = validateSafe(createCaseSchema, invalidCase);
      expect(result.success).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    it('should use default values', () => {
      const result = validateSafe(paginationSchema, {});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortOrder).toBe('asc');
      }
    });

    it('should accept valid pagination params', () => {
      const params = {
        page: 5,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      const result = validateSafe(paginationSchema, params);
      expect(result.success).toBe(true);
    });

    it('should reject negative page', () => {
      const params = { page: -1 };
      const result = validateSafe(paginationSchema, params);
      expect(result.success).toBe(false);
    });

    it('should reject limit over 100', () => {
      const params = { limit: 101 };
      const result = validateSafe(paginationSchema, params);
      expect(result.success).toBe(false);
    });
  });
});
