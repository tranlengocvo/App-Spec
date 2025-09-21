import { z } from 'zod';

// CRN validation - must be exactly 5 digits
const crnSchema = z.string()
  .length(5, 'CRN must be exactly 5 digits')
  .regex(/^\d{5}$/, 'CRN must contain only numbers');

// Create swap form schema
export const createSwapSchema = z.object({
  course_id: z.string().min(1, 'Please select a course'),
  current_crn: crnSchema,
  desired_crns: z.array(crnSchema)
    .min(1, 'At least one desired CRN is required')
    .max(3, 'Maximum 3 desired CRNs allowed'),
  term: z.string().min(1, 'Term is required'),
  campus: z.string().min(1, 'Campus is required'),
  time_window: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // Ensure current CRN is not in desired CRNs
  return !data.desired_crns.includes(data.current_crn);
}, {
  message: 'Current CRN cannot be in desired CRNs',
  path: ['desired_crns']
});

// Offer form schema
export const createOfferSchema = z.object({
  offered_crn: crnSchema,
  note: z.string().optional(),
});

// Message form schema
export const createMessageSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty').max(500, 'Message too long'),
});

// Course search schema
export const courseSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
});

export type CreateSwapFormData = z.infer<typeof createSwapSchema>;
export type CreateOfferFormData = z.infer<typeof createOfferSchema>;
export type CreateMessageFormData = z.infer<typeof createMessageSchema>;
export type CourseSearchFormData = z.infer<typeof courseSearchSchema>;
