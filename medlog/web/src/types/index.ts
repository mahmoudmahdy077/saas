/**
 * Shared Type Definitions
 * Enterprise-grade type safety for MedLog SaaS
 */

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
  status?: number;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  institutionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  institutionId?: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  institutionId?: string;
}

// Case Types
export interface MedicalCase {
  id: string;
  title: string;
  description: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  diagnosis: string;
  treatment: string;
  outcome: string;
  status: 'draft' | 'published' | 'archived';
  userId: string;
  institutionId?: string;
  tags: string[];
  images: CaseImage[];
  preopImages: CaseImage[];
  postopImages: CaseImage[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface CaseImage {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

export interface CreateCaseInput {
  title: string;
  description: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  diagnosis: string;
  treatment: string;
  outcome: string;
  tags?: string[];
}

export interface UpdateCaseInput extends Partial<CreateCaseInput> {
  status?: 'draft' | 'published' | 'archived';
}

// Institution Types
export interface Institution {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'university' | 'research';
  country: string;
  verified: boolean;
  settings: InstitutionSettings;
  createdAt: string;
  updatedAt: string;
}

export interface InstitutionSettings {
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  features: {
    cases: boolean;
    analytics: boolean;
    marketplace: boolean;
    integrations: boolean;
  };
  limits: {
    maxUsers: number;
    maxCases: number;
    maxStorage: number;
  };
}

// Analytics Types
export interface AnalyticsData {
  totalCases: number;
  totalUsers: number;
  totalViews: number;
  casesByCategory: CategoryStat[];
  casesByStatus: StatusStat[];
  recentActivity: ActivityLog[];
}

export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

export interface StatusStat {
  status: string;
  count: number;
  percentage: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: ValidationError[];
  };
  status: number;
}

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = void> = () => Promise<T>;

export type SuccessResponse<T = unknown> = Omit<ApiResponse<T>, 'error'>;
export type ErrorOnlyResponse = Omit<ApiResponse, 'data'>;
