import { z } from 'zod';

// Website schemas
export const createWebsiteSchema = z.object({
  publishId: z.string().min(1, 'Publish ID is required'),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  eventDate: z.string().datetime().optional(),
});

export const updateWebsiteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  eventDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

// Guest schemas
export const createGuestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  maxAttendees: z.number().int().min(1).max(20).default(1),
});

export const createGuestBulkSchema = z.object({
  guests: z.array(createGuestSchema).min(1).max(500),
});

export const validateGuestSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  publishId: z.string().min(1, 'Publish ID is required'),
});

// RSVP schemas
export const createRSVPSchema = z.object({
  guestCode: z.string().min(1, 'Guest code is required'),
  publishId: z.string().min(1, 'Publish ID is required'),
  status: z.enum(['attending', 'not_attending', 'maybe']),
  attendeeCount: z.number().int().min(0).max(20).default(1),
  dietaryRestrictions: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
});

export const updateRSVPSchema = z.object({
  status: z.enum(['attending', 'not_attending', 'maybe']).optional(),
  attendeeCount: z.number().int().min(0).max(20).optional(),
  dietaryRestrictions: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
});

// Wish schemas
export const createWishSchema = z.object({
  guestCode: z.string().min(1, 'Guest code is required'),
  publishId: z.string().min(1, 'Publish ID is required'),
  message: z.string().min(1, 'Message is required').max(1000),
});

export const updateWishSchema = z.object({
  isApproved: z.boolean().optional(),
  isHidden: z.boolean().optional(),
});

// Query schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Admin auth schema
export const adminAuthSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

// Type exports
export type CreateWebsiteInput = z.infer<typeof createWebsiteSchema>;
export type UpdateWebsiteInput = z.infer<typeof updateWebsiteSchema>;
export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type CreateGuestBulkInput = z.infer<typeof createGuestBulkSchema>;
export type ValidateGuestInput = z.infer<typeof validateGuestSchema>;
export type CreateRSVPInput = z.infer<typeof createRSVPSchema>;
export type UpdateRSVPInput = z.infer<typeof updateRSVPSchema>;
export type CreateWishInput = z.infer<typeof createWishSchema>;
export type UpdateWishInput = z.infer<typeof updateWishSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
