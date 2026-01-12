import { Router, Request, Response, NextFunction } from 'express';
import { wishService } from '../services';
import { validate, adminAuth, wishLimiter } from '../middleware';
import { createWishSchema, updateWishSchema, paginationSchema } from '../validators';

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
            const { page, limit } = req.query as unknown as { page: number; limit: number };
            const result = await wishService.findByWebsite(req.params.publishId, page, limit);

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
            const wishes = await wishService.findByGuest(req.params.code);
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
            const { page, limit } = req.query as unknown as { page: number; limit: number };
            const result = await wishService.findAllByWebsite(req.params.websiteId, page, limit);
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
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const wish = await wishService.update(req.params.id, req.body);
            if (!wish) {
                return res.status(404).json({ error: 'Wish not found' });
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
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const wish = await wishService.toggleVisibility(req.params.id);
            if (!wish) {
                return res.status(404).json({ error: 'Wish not found' });
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
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const wish = await wishService.toggleApproval(req.params.id);
            if (!wish) {
                return res.status(404).json({ error: 'Wish not found' });
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
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const deleted = await wishService.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Wish not found' });
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
);

export default router;
