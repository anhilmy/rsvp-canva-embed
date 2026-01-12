import rateLimit from "express-rate-limit";

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: { message: "Too many requests, please try again later" },
  },
});

// RSVP submission rate limiter (1 per guest - handled by business logic)
export const rsvpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 attempts per minute
  message: {
    success: false,
    error: { message: "Too many RSVP attempts, please try again later" },
  },
});

// Wish submission rate limiter (1 per hour per guest)
export const wishLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 wishes per hour
  message: {
    success: false,
    error: { message: "Too many wishes submitted, please try again later" },
  },
});
