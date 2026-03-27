/**
 * Environment Configuration Validation
 * Ensures all required environment variables are set
 */

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Optional services
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  
  // Storage (MinIO/S3)
  MINIO_USER: z.string().optional(),
  MINIO_PASSWORD: z.string().optional(),
  MINIO_ENDPOINT: z.string().optional(),
  MINIO_PORT: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

let validatedConfig: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (validatedConfig) {
    return validatedConfig;
  }

  try {
    validatedConfig = envSchema.parse(process.env);
    return validatedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues.map(e => e.path.join('.')).join(', ');
      throw new Error(`Missing or invalid environment variables: ${missing}`);
    }
    throw error;
  }
}

export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}
