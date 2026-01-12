import rateLimit from 'express-rate-limit';
import { config } from '../config';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for submissions
export const submitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    error: 'Too many submissions, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict limiter for wish submissions (per guest handled separately)
export const wishLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50, // 50 wishes per IP per day (guests will be limited by code)
  message: {
    error: 'Too many wishes submitted today, please try again tomorrow',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
