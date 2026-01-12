import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { websiteService, wishService, rsvpService, guestService } from '../services';
import { validate, submitLimiter, wishLimiter } from '../middleware';

const router = Router();

// Schema for open RSVP submission (public form without guest code)
const openRSVPSchema = z.object({
    publishId: z.string().min(1, 'Publish ID is required'),
    name: z.string().min(1, 'Name is required').max(100),
    attendeeCount: z.number().int().min(1).max(20).default(1),
    status: z.enum(['attending', 'not_attending', 'maybe']).default('attending'),
    message: z.string().max(1000).optional(), // Optional wish message
});

// Schema for open wish submission
const openWishSchema = z.object({
    publishId: z.string().min(1, 'Publish ID is required'),
    name: z.string().min(1, 'Name is required').max(100),
    message: z.string().min(1, 'Message is required').max(1000),
});

// Get embed configuration for a website
router.get(
    '/config/:publishId',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { publishId } = req.params as { publishId: string };
            const website = await websiteService.findByPublishId(publishId);

            if (!website || !website.isActive) {
                res.status(404).json({ error: 'Website not found or inactive' });
                return;
            }

            res.json({
                name: website.name,
                eventDate: website.eventDate,
                isActive: website.isActive,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Submit open RSVP (creates guest on the fly)
router.post(
    '/rsvp',
    submitLimiter,
    validate(openRSVPSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { publishId, name, attendeeCount, status, message } = req.body;

            // Find website
            const website = await websiteService.findByPublishId(publishId);
            if (!website || !website.isActive) {
                res.status(404).json({ error: 'Website not found or inactive' });
                return;
            }

            // Create a guest entry for this public submission
            const guest = await guestService.create(website._id.toString(), {
                name,
                maxAttendees: attendeeCount,
            });

            // Create RSVP
            const rsvp = await rsvpService.create({
                guestCode: guest.uniqueCode,
                publishId,
                status,
                attendeeCount,
            });

            // If message provided, create a wish
            let wish = null;
            if (message && message.trim()) {
                try {
                    wish = await wishService.create({
                        guestCode: guest.uniqueCode,
                        publishId,
                        message: message.trim(),
                    });
                    console.log('Wish created successfully:', wish._id);
                } catch (wishError) {
                    console.error('Failed to create wish:', wishError);
                    // Continue without wish - don't fail the whole RSVP
                }
            }

            res.status(201).json({
                success: true,
                rsvp: {
                    status: rsvp.status,
                    attendeeCount: rsvp.attendeeCount,
                },
                wish: wish
                    ? {
                        message: wish.message,
                        isApproved: wish.isApproved,
                    }
                    : null,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Submit open wish (without RSVP)
router.post(
    '/wish',
    wishLimiter,
    validate(openWishSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { publishId, name, message } = req.body;

            // Find website
            const website = await websiteService.findByPublishId(publishId);
            if (!website || !website.isActive) {
                res.status(404).json({ error: 'Website not found or inactive' });
                return;
            }

            // Create a guest entry for this public submission
            const guest = await guestService.create(website._id.toString(), {
                name,
                maxAttendees: 1,
            });

            // Create wish
            const wish = await wishService.create({
                guestCode: guest.uniqueCode,
                publishId,
                message: message.trim(),
            });

            res.status(201).json({
                success: true,
                wish: {
                    guestName: wish.guestName,
                    message: wish.message,
                    createdAt: wish.createdAt,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// Get public wishes for display
router.get(
    '/wishes/:publishId',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { publishId } = req.params as { publishId: string };
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

            const result = await wishService.findByWebsite(publishId, page, limit);

            res.json({
                wishes: result.wishes.map((w) => ({
                    id: w._id,
                    guestName: w.guestName,
                    message: w.message,
                    createdAt: w.createdAt,
                })),
                total: result.total,
                pages: result.pages,
                page,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Serve embeddable RSVP form HTML
router.get(
    '/form/:publishId',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { publishId } = req.params as { publishId: string };
            const website = await websiteService.findByPublishId(publishId);

            if (!website || !website.isActive) {
                res.status(404).send('<html><body><p>Form not available</p></body></html>');
                return;
            }

            const apiUrl = `${req.protocol}://${req.get('host')}`;

            const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RSVP - ${website.name}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background: transparent;
        }
        .rsvp-container {
            max-width: 400px;
            margin: 0 auto;
            padding: 24px;
        }
        .rsvp-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
            text-align: center;
        }
        .rsvp-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 24px;
            text-align: center;
        }
        .form-group {
            margin-bottom: 16px;
        }
        label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 6px;
            color: #444;
        }
        input[type="text"],
        input[type="number"],
        select,
        textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.2s;
        }
        input:focus,
        select:focus,
        textarea:focus {
            outline: none;
            border-color: #8b5cf6;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        textarea {
            min-height: 100px;
            resize: vertical;
        }
        .btn-submit {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-submit:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
        .btn-submit:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        .message {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            text-align: center;
        }
        .message.success {
            background: #d1fae5;
            color: #065f46;
        }
        .message.error {
            background: #fee2e2;
            color: #991b1b;
        }
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="rsvp-container">
        <h2 class="rsvp-title">RSVP</h2>
        <p class="rsvp-subtitle">${website.name}${website.eventDate ? ' • ' + new Date(website.eventDate).toLocaleDateString() : ''}</p>
        
        <div id="statusMessage" class="message hidden"></div>
        
        <form id="rsvpForm">
            <div class="form-group">
                <label for="name">Your Name *</label>
                <input type="text" id="name" name="name" required placeholder="Enter your name">
            </div>
            
            <div class="form-group">
                <label for="attendeeCount">Number of Guests</label>
                <input type="number" id="attendeeCount" name="attendeeCount" min="1" max="20" value="1">
            </div>
            
            <div class="form-group">
                <label for="status">Will you attend?</label>
                <select id="status" name="status">
                    <option value="attending">Yes, I'll be there!</option>
                    <option value="maybe">Maybe</option>
                    <option value="not_attending">Sorry, can't make it</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="wishMessage">Leave a Wish (Optional)</label>
                <textarea id="wishMessage" name="wishMessage" placeholder="Write your wishes for the couple..."></textarea>
            </div>
            
            <button type="submit" class="btn-submit" id="submitBtn">Submit RSVP</button>
        </form>
    </div>
    
    <script>
        const API_URL = '${apiUrl}';
        const PUBLISH_ID = '${publishId}';
        
        document.getElementById('rsvpForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('submitBtn');
            const statusEl = document.getElementById('statusMessage');
            
            btn.disabled = true;
            btn.textContent = 'Submitting...';
            statusEl.className = 'message hidden';
            
            try {
                const formData = {
                    publishId: PUBLISH_ID,
                    name: document.getElementById('name').value,
                    attendeeCount: parseInt(document.getElementById('attendeeCount').value) || 1,
                    status: document.getElementById('status').value,
                    message: document.getElementById('wishMessage').value || undefined,
                };
                
                const response = await fetch(API_URL + '/api/embed/rsvp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    statusEl.textContent = 'Thank you for your RSVP! 🎉';
                    statusEl.className = 'message success';
                    document.getElementById('rsvpForm').reset();
                } else {
                    throw new Error(data.error || 'Failed to submit');
                }
            } catch (error) {
                statusEl.textContent = error.message || 'Something went wrong. Please try again.';
                statusEl.className = 'message error';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Submit RSVP';
            }
        });
    </script>
</body>
</html>`;

            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        } catch (error) {
            next(error);
        }
    }
);

// Serve embeddable wishes wall HTML
router.get(
    '/wishes-wall/:publishId',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { publishId } = req.params as { publishId: string };
            const website = await websiteService.findByPublishId(publishId);

            if (!website || !website.isActive) {
                res.status(404).send('<html><body><p>Wishes not available</p></body></html>');
                return;
            }

            const apiUrl = `${req.protocol}://${req.get('host')}`;

            const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wishes - ${website.name}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background: transparent;
        }
        .wishes-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 24px;
        }
        .wishes-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 24px;
            text-align: center;
        }
        .wishes-grid {
            display: grid;
            gap: 16px;
        }
        .wish-card {
            background: linear-gradient(135deg, #fdf4ff 0%, #f5f3ff 100%);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .wish-message {
            font-size: 16px;
            color: #374151;
            margin-bottom: 12px;
            font-style: italic;
        }
        .wish-author {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
        }
        .wish-date {
            font-size: 12px;
            color: #9ca3af;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        .no-wishes {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        .load-more {
            display: block;
            margin: 24px auto 0;
            padding: 12px 24px;
            background: #f3f4f6;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            color: #374151;
        }
        .load-more:hover {
            background: #e5e7eb;
        }
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="wishes-container">
        <h2 class="wishes-title">💝 Wishes & Messages</h2>
        
        <div id="loading" class="loading">Loading wishes...</div>
        <div id="noWishes" class="no-wishes hidden">No wishes yet. Be the first to send one!</div>
        <div id="wishesGrid" class="wishes-grid"></div>
        <button id="loadMore" class="load-more hidden">Load More</button>
    </div>
    
    <script>
        const API_URL = '${apiUrl}';
        const PUBLISH_ID = '${publishId}';
        let currentPage = 1;
        let totalPages = 1;
        
        async function loadWishes(page = 1) {
            try {
                const response = await fetch(API_URL + '/api/embed/wishes/' + PUBLISH_ID + '?page=' + page + '&limit=10');
                const data = await response.json();
                
                document.getElementById('loading').classList.add('hidden');
                
                if (data.wishes.length === 0 && page === 1) {
                    document.getElementById('noWishes').classList.remove('hidden');
                    return;
                }
                
                const grid = document.getElementById('wishesGrid');
                
                data.wishes.forEach(wish => {
                    const card = document.createElement('div');
                    card.className = 'wish-card';
                    card.innerHTML = \`
                        <p class="wish-message">"\${escapeHtml(wish.message)}"</p>
                        <p class="wish-author">— \${escapeHtml(wish.guestName)}</p>
                        <p class="wish-date">\${new Date(wish.createdAt).toLocaleDateString()}</p>
                    \`;
                    grid.appendChild(card);
                });
                
                totalPages = data.pages;
                currentPage = data.page;
                
                const loadMoreBtn = document.getElementById('loadMore');
                if (currentPage < totalPages) {
                    loadMoreBtn.classList.remove('hidden');
                } else {
                    loadMoreBtn.classList.add('hidden');
                }
            } catch (error) {
                document.getElementById('loading').textContent = 'Failed to load wishes';
            }
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        document.getElementById('loadMore').addEventListener('click', () => {
            loadWishes(currentPage + 1);
        });
        
        // Initial load
        loadWishes();
    </script>
</body>
</html>`;

            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
