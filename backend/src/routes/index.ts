import { Router } from 'express';
import websiteRoutes from './websites';
import guestRoutes from './guests';
import rsvpRoutes from './rsvp';
import wishRoutes from './wishes';
import embedRoutes from './embed';
import broadcastTemplateRoutes from './broadcastTemplates';

const router = Router();

router.use('/websites', websiteRoutes);
router.use('/guests', guestRoutes);
router.use('/rsvp', rsvpRoutes);
router.use('/wishes', wishRoutes);
router.use('/embed', embedRoutes);
router.use('/broadcast-templates', broadcastTemplateRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
