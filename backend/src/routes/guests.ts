import { Router, Request, Response, NextFunction } from 'express';
import { guestService, broadcastTemplateService } from '../services';
import { validate, adminAuth } from '../middleware';
import { createGuestSchema, createGuestBulkSchema, validateGuestSchema, paginationSchema, updateGuestSchema } from '../validators';
import { Website, Guest } from '../models';
import ExcelJS from 'exceljs';

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

// Export guests to Excel
router.post(
    '/:websiteId/export',
    adminAuth,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { websiteId } = req.params as { websiteId: string };
            const { guestIds, templateId, baseUrl } = req.body as { guestIds: string[]; templateId?: string; baseUrl: string };

            if (!guestIds || guestIds.length === 0) {
                res.status(400).json({ error: 'No guests selected' });
                return;
            }

            if (!baseUrl) {
                res.status(400).json({ error: 'baseUrl is required' });
                return;
            }

            // Get website
            const website = await Website.findById(websiteId);
            if (!website) {
                res.status(404).json({ error: 'Website not found' });
                return;
            }

            // Get guests
            const guests = await Guest.find({ _id: { $in: guestIds }, websiteId });

            // Get template if provided
            let template = null;
            if (templateId) {
                template = await broadcastTemplateService.findById(templateId);
            }

            // Generate Excel
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Guests');

            // Define columns
            sheet.columns = [
                { header: 'Name', key: 'name', width: 25 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Phone', key: 'phone', width: 15 },
                { header: 'Greeting', key: 'greeting', width: 12 },
                { header: 'Code', key: 'code', width: 10 },
                { header: 'Max Attendees', key: 'maxAttendees', width: 12 },
                { header: 'Type', key: 'type', width: 10 },
                { header: 'RSVP Link', key: 'link', width: 50 },
                { header: 'Broadcast Message', key: 'broadcast', width: 80 },
            ];

            // Style header row
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' },
            };

            // Add rows
            for (const guest of guests) {
                const link = guest.personalLink || `${baseUrl}/f/simple/${website.publishId}?code=${guest.uniqueCode}`;
                let broadcastMessage = '';

                if (template) {
                    broadcastMessage = broadcastTemplateService.fillTemplate(
                        template.body,
                        {
                            name: guest.name,
                            greeting: guest.greeting,
                            personalLink: guest.personalLink,
                            uniqueCode: guest.uniqueCode,
                        },
                        baseUrl,
                        website.publishId
                    );
                }

                sheet.addRow({
                    name: guest.name,
                    email: guest.email || '',
                    phone: guest.phone || '',
                    greeting: guest.greeting || '',
                    code: guest.uniqueCode,
                    maxAttendees: guest.maxAttendees,
                    type: guest.isManual ? 'Walk-in' : 'Invited',
                    link,
                    broadcast: broadcastMessage,
                });
            }

            // Generate buffer
            const buffer = await workbook.xlsx.writeBuffer();

            // Send response
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=guests-${website.publishId}-${Date.now()}.xlsx`);
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
