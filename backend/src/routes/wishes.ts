import { Router, Request, Response, NextFunction } from 'express';
import { wishService } from '../services';
import { validate, adminAuth, wishLimiter } from '../middleware';
import { createWishSchema, updateWishSchema, paginationSchema, bulkDeleteSchema } from '../validators';

const router = Router();

// Public routes
router.post(
    '/',
    wishLimiter,
    validate(createWishSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const wish = await wishService.create(req.body);
            res.status(201).json({
                id: wish._id,
                guestName: wish.guestName,
                message: wish.message,
                createdAt: wish.createdAt,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    '/public/:publishId',
    validate(paginationSchema, 'query'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { publishId } = req.params as { publishId: string };
            const { page, limit } = req.query as unknown as { page: number; limit: number };
            const result = await wishService.findByWebsite(publishId, page, limit);

            // Return only public-safe data
            const publicWishes = result.wishes.map((wish) => ({
                id: wish._id,
                guestName: wish.guestName,
                message: wish.message,
                createdAt: wish.createdAt,
            }));

            res.json({
                wishes: publicWishes,
                total: result.total,
                pages: result.pages,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    '/my/:code',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { code } = req.params as { code: string };
            const wishes = await wishService.findByGuest(code);
            res.json(wishes);
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
            const result = await wishService.findAllByWebsite(websiteId, page, limit);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    '/:id',
    adminAuth,
    validate(updateWishSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            const wish = await wishService.update(id, req.body);
            if (!wish) {
                res.status(404).json({ error: 'Wish not found' });
                return;
            }
            res.json(wish);
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    '/:id/toggle-visibility',
    adminAuth,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            const wish = await wishService.toggleVisibility(id);
            if (!wish) {
                res.status(404).json({ error: 'Wish not found' });
                return;
            }
            res.json(wish);
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    '/:id/toggle-approval',
    adminAuth,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            const wish = await wishService.toggleApproval(id);
            if (!wish) {
                res.status(404).json({ error: 'Wish not found' });
                return;
            }
            res.json(wish);
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
            const deleted = await wishService.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Wish not found' });
                return;
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
);

// Bulk delete wishes
router.delete(
    '/:websiteId/bulk',
    adminAuth,
    validate(bulkDeleteSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { websiteId } = req.params as { websiteId: string };
            const { ids } = req.body as { ids: string[] };
            const deletedCount = await wishService.bulkDelete(websiteId, ids);
            res.json({ success: true, deleted: deletedCount });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
