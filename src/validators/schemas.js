import { z } from 'zod';

// ====================== AUTH SCHEMAS ======================

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please provide a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  passwordConfirm: z.string(),
  role: z.enum(['candidate', 'recruiter', 'hiring_manager', 'admin']).optional()
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"]
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// ====================== JOB SCHEMAS ======================

export const createJobSchema = z.object({
  title: z.string().min(5, 'Job title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  responsibilities: z.array(z.string()).optional(),
  department: z.string().min(2),
  location: z.string().min(2),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']),
  salary: z.object({
    min: z.number().positive(),
    max: z.number().positive().optional(),
    currency: z.string().default('USD')
  }).optional(),
  deadline: z.string().datetime().optional()
});

// ====================== APPLICATION SCHEMAS ======================

export const applyJobSchema = z.object({
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters').optional()
});

// ====================== INTERVIEW SCHEMAS ======================

export const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1),
  type: z.enum(['phone', 'video', 'in-person', 'technical']),
  date: z.string().datetime(),
  duration: z.number().min(15).max(180).default(60),
  location: z.string().min(3),
  interviewers: z.array(z.string()).optional()
});

// ====================== OFFER SCHEMAS ======================

export const createOfferSchema = z.object({
  applicationId: z.string().min(1),
  salary: z.number().positive(),
  currency: z.string().default('USD'),
  startDate: z.string().datetime()
});

// ====================== USER SCHEMAS ======================

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  'profile.phone': z.string().optional(),
  'profile.location': z.string().optional(),
  'profile.linkedin': z.string().url().optional(),
  'profile.github': z.string().url().optional(),
  'profile.skills': z.array(z.string()).optional(),
  'profile.experienceYears': z.number().min(0).optional()
}).passthrough(); // Allow other fields if needed

// ====================== PARAMS VALIDATION ======================

export const idParamSchema = z.object({
  id: z.string().min(1)
});

export const jobIdParamSchema = z.object({
  jobId: z.string().min(1)
});

// Export all schemas
export default {
  registerSchema,
  loginSchema,
  createJobSchema,
  applyJobSchema,
  scheduleInterviewSchema,
  createOfferSchema,
  updateProfileSchema,
  idParamSchema,
  jobIdParamSchema
};