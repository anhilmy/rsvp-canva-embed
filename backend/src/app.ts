import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import routes from './routes';
import embedRoutes from './routes/embed';
import { errorHandler, notFoundHandler, apiLimiter } from './middleware';

const app = express();

// Trust proxy - needed when behind ngrok or other reverse proxies
app.set('trust proxy', 1);

// Security middleware - allow embedding for embed routes
app.use((req, res, next) => {
    if (req.path.startsWith('/api/embed') || req.path.startsWith('/embed')) {
        // Remove X-Frame-Options for embed routes to allow iframe embedding
        res.removeHeader('X-Frame-Options');
    }
    next();
});

app.use(
    helmet({
        contentSecurityPolicy: false, // Allow embedding
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        frameguard: false, // Disable X-Frame-Options globally, we'll handle it per route
    })
);

// CORS for embed routes - allow all origins (for iframe embedding)
app.use('/api/embed', cors({ origin: true, credentials: false }));
app.use('/embed', cors({ origin: true, credentials: false }));

// CORS configuration for other routes
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin) return callback(null, true);

            // Check if origin matches any allowed pattern
            const isAllowed = config.corsOrigins.some((allowed) => {
                if (allowed.includes('*')) {
                    // Handle wildcard patterns like https://*.canva.site
                    const pattern = allowed.replace('*', '.*');
                    return new RegExp(`^${pattern}$`).test(origin);
                }
                return allowed === origin;
            });

            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// API routes
app.use('/api', routes);

// Embed routes (without /api prefix for direct iframe embedding)
app.use('/embed', embedRoutes);

// Plain form route - NO security headers at all for Canva embedding
app.use('/f', (req, res, next) => {
    // Remove ALL security headers
    res.removeHeader('X-Frame-Options');
    res.removeHeader('X-Content-Type-Options');
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-XSS-Protection');
    // Explicitly allow framing from anywhere
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    next();
}, embedRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'RSVP & Wishes API',
        version: '1.0.0',
        status: 'running',
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
