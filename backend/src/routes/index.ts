import { Router } from 'express';
import websiteRoutes from './websites';
import guestRoutes from './guests';
import rsvpRoutes from './rsvp';
import wishRoutes from './wishes';
import embedRoutes from './embed';

const router = Router();

router.use('/websites', websiteRoutes);
router.use('/guests', guestRoutes);
router.use('/rsvp', rsvpRoutes);
router.use('/wishes', wishRoutes);
router.use('/embed', embedRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
