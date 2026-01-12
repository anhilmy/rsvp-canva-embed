import { Router, Request, Response, NextFunction } from 'express';
import { websiteService } from '../services';
import { validate, adminAuth } from '../middleware';
import { createWebsiteSchema, updateWebsiteSchema, paginationSchema } from '../validators';

const router = Router();

// Admin routes - require authentication
router.post(
    '/',
    adminAuth,
    validate(createWebsiteSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const website = await websiteService.create(req.body);
            res.status(201).json(website);
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    '/',
    adminAuth,
    validate(paginationSchema, 'query'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page, limit } = req.query as unknown as { page: number; limit: number };
            const result = await websiteService.findAll(page, limit);
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
            const website = await websiteService.findById(id);
            if (!website) {
                res.status(404).json({ error: 'Website not found' });
                return;
            }
            res.json(website);
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    '/:id',
    adminAuth,
    validate(updateWebsiteSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            const website = await websiteService.update(id, req.body);
            if (!website) {
                res.status(404).json({ error: 'Website not found' });
                return;
            }
            res.json(website);
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
            const deleted = await websiteService.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Website not found' });
                return;
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
);

// Public route - validate website by publishId
router.get(
    '/validate/:publishId',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { publishId } = req.params as { publishId: string };
            const result = await websiteService.validateWebsite(publishId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
