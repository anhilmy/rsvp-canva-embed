import { Router, Request, Response, NextFunction } from 'express';
import { rsvpService } from '../services';
import { validate, adminAuth, submitLimiter } from '../middleware';
import { createRSVPSchema, updateRSVPSchema, paginationSchema } from '../validators';

const router = Router();

// Public routes
router.post(
  '/',
  submitLimiter,
  validate(createRSVPSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rsvp = await rsvpService.create(req.body);
      res.status(201).json(rsvp);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/check/:code',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rsvp = await rsvpService.findByGuestCode(req.params.code);
      if (!rsvp) {
        return res.json({ hasRSVP: false });
      }
      res.json({
        hasRSVP: true,
        rsvp: {
          status: rsvp.status,
          attendeeCount: rsvp.attendeeCount,
          submittedAt: rsvp.submittedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:code',
  submitLimiter,
  validate(updateRSVPSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rsvp = await rsvpService.update(req.params.code, req.body);
      if (!rsvp) {
        return res.status(404).json({ error: 'RSVP not found' });
      }
      res.json(rsvp);
    } catch (error) {
      next(error);
    }
  }
);

// Admin routes
router.get(
  '/website/:websiteId',
  adminAuth,
  validate(paginationSchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query as unknown as { page: number; limit: number };
      const result = await rsvpService.findByWebsite(req.params.websiteId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/status/:websiteId',
  adminAuth,
  validate(paginationSchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query as unknown as { page: number; limit: number };
      const result = await rsvpService.getGuestStatus(req.params.websiteId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
