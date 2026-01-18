import { Router, Request, Response, NextFunction } from 'express';
import { broadcastTemplateService } from '../services';
import { adminAuth, validate } from '../middleware';
import { createBroadcastTemplateSchema, updateBroadcastTemplateSchema } from '../validators';

const router = Router();

// All routes require admin auth
router.use(adminAuth);

// Get all templates for a website
router.get(
    '/:websiteId',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { websiteId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

            const result = await broadcastTemplateService.findByWebsite(websiteId, page, limit);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

// Get all templates for a website (no pagination, for dropdown)
router.get(
    '/:websiteId/all',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { websiteId } = req.params;
            const templates = await broadcastTemplateService.findAllByWebsite(websiteId);
            res.json({ templates });
        } catch (error) {
            next(error);
        }
    }
);

// Get single template
router.get(
    '/:websiteId/:id',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const template = await broadcastTemplateService.findById(id);
            
            if (!template) {
                res.status(404).json({ error: 'Template not found' });
                return;
            }

            res.json(template);
        } catch (error) {
            next(error);
        }
    }
);

// Create new template
router.post(
    '/:websiteId',
    validate(createBroadcastTemplateSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { websiteId } = req.params;
            const template = await broadcastTemplateService.create(websiteId, req.body);
            res.status(201).json(template);
        } catch (error) {
            next(error);
        }
    }
);

// Update template
router.put(
    '/:id',
    validate(updateBroadcastTemplateSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const template = await broadcastTemplateService.update(id, req.body);
            res.json(template);
        } catch (error) {
            next(error);
        }
    }
);

// Delete template (permanent)
router.delete(
    '/:id',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await broadcastTemplateService.delete(id);
            res.json({ success: true, message: 'Template deleted' });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
