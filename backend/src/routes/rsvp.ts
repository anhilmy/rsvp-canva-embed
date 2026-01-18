import { Router, Request, Response, NextFunction } from 'express';
import { rsvpService } from '../services';
import { validate, adminAuth, submitLimiter } from '../middleware';
import { createRSVPSchema, updateRSVPSchema, paginationSchema, bulkDeleteSchema } from '../validators';

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
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { code } = req.params as { code: string };
            const rsvp = await rsvpService.findByGuestCode(code);
            if (!rsvp) {
                res.json({ hasRSVP: false });
                return;
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
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { code } = req.params as { code: string };
            const rsvp = await rsvpService.update(code, req.body);
            if (!rsvp) {
                res.status(404).json({ error: 'RSVP not found' });
                return;
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
            const { websiteId } = req.params as { websiteId: string };
            const { page, limit } = req.query as unknown as { page: number; limit: number };
            const result = await rsvpService.findByWebsite(websiteId, page, limit);
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
            const { websiteId } = req.params as { websiteId: string };
            const { page, limit } = req.query as unknown as { page: number; limit: number };
            const result = await rsvpService.getGuestStatus(websiteId, page, limit);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

// Bulk delete RSVPs
router.delete(
    '/:websiteId/bulk',
    adminAuth,
    validate(bulkDeleteSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { websiteId } = req.params as { websiteId: string };
            const { ids } = req.body as { ids: string[] };
            const deletedCount = await rsvpService.bulkDelete(websiteId, ids);
            res.json({ success: true, deleted: deletedCount });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
