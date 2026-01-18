import { Router, Request, Response, NextFunction } from 'express';
import { guestService } from '../services';
import { validate, adminAuth } from '../middleware';
import { createGuestSchema, createGuestBulkSchema, validateGuestSchema, paginationSchema, updateGuestSchema } from '../validators';

const router = Router();

// Public route - validate guest (must be before /:id routes)
router.post(
    '/validate',
    validate(validateGuestSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { code, publishId } = req.body;
            const result = await guestService.validateGuest(code, publishId);

            if (!result.valid) {
                res.status(400).json({ valid: false, message: result.message });
                return;
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
            const { websiteId } = req.params as { websiteId: string };
            const guest = await guestService.create(websiteId, req.body);
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
            const { websiteId } = req.params as { websiteId: string };
            const guests = await guestService.createBulk(websiteId, req.body.guests);
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
            const { websiteId } = req.params as { websiteId: string };
            const { page, limit } = req.query as unknown as { page: number; limit: number };
            const result = await guestService.findByWebsite(websiteId, page, limit);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    '/:id',
    adminAuth,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            const guest = await guestService.findById(id);
            if (!guest) {
                res.status(404).json({ error: 'Guest not found' });
                return;
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
    validate(updateGuestSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            const guest = await guestService.update(id, req.body);
            if (!guest) {
                res.status(404).json({ error: 'Guest not found' });
                return;
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
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            const deleted = await guestService.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Guest not found' });
                return;
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
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            const baseUrl = req.query.baseUrl as string;
            if (!baseUrl) {
                res.status(400).json({ error: 'baseUrl query parameter required' });
                return;
            }
            const link = await guestService.generateShareableLink(id, baseUrl);
            res.json({ link });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
