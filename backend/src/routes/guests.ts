import { Router, Request, Response, NextFunction } from 'express';
import { guestService } from '../services';
import { validate, adminAuth } from '../middleware';
import { createGuestSchema, createGuestBulkSchema, validateGuestSchema, paginationSchema } from '../validators';

const router = Router();

// Public route - validate guest (must be before /:id routes)
router.post(
  '/validate',
  validate(validateGuestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, publishId } = req.body;
      const result = await guestService.validateGuest(code, publishId);
      
      if (!result.valid) {
        return res.status(400).json({ valid: false, message: result.message });
      }

      // Return only safe guest info
      res.json({
        valid: true,
        guest: {
          name: result.guest!.name,
          maxAttendees: result.guest!.maxAttendees,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Admin routes
router.post(
  '/:websiteId',
  adminAuth,
  validate(createGuestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const guest = await guestService.create(req.params.websiteId, req.body);
      res.status(201).json(guest);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:websiteId/bulk',
  adminAuth,
  validate(createGuestBulkSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const guests = await guestService.createBulk(req.params.websiteId, req.body.guests);
      res.status(201).json({ guests, count: guests.length });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/website/:websiteId',
  adminAuth,
  validate(paginationSchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query as unknown as { page: number; limit: number };
      const result = await guestService.findByWebsite(req.params.websiteId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  adminAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const guest = await guestService.findById(req.params.id);
      if (!guest) {
        return res.status(404).json({ error: 'Guest not found' });
      }
      res.json(guest);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  adminAuth,
  validate(createGuestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const guest = await guestService.update(req.params.id, req.body);
      if (!guest) {
        return res.status(404).json({ error: 'Guest not found' });
      }
      res.json(guest);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  adminAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await guestService.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Guest not found' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/shareable-link',
  adminAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const baseUrl = req.query.baseUrl as string;
      if (!baseUrl) {
        return res.status(400).json({ error: 'baseUrl query parameter required' });
      }
      const link = await guestService.generateShareableLink(req.params.id, baseUrl);
      res.json({ link });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
