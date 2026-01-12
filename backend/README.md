# RSVP & Wishes Backend

Express.js backend API for the RSVP and Wishes Canva App.

## Quick Start

### Prerequisites
- Node.js 18+
- Docker (for MongoDB)

### Development

1. Start MongoDB:
```bash
cd .. && docker-compose up -d mongodb
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

Server runs at `http://localhost:3001`

### Testing

```bash
npm test           # Run all tests with coverage
npm run test:watch # Watch mode
```

### Building

```bash
npm run build      # Compile TypeScript
npm start          # Run production build
```

## API Endpoints

### Public Endpoints (for Canva App)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/websites/validate/:publishId` | Validate website registration |
| POST | `/api/guests/validate` | Validate guest code |
| POST | `/api/rsvp` | Submit RSVP |
| GET | `/api/rsvp/check/:code` | Check if guest has RSVP |
| PUT | `/api/rsvp/:code` | Update RSVP |
| POST | `/api/wishes` | Submit a wish |
| GET | `/api/wishes/public/:publishId` | Get public wishes |
| GET | `/api/wishes/my/:code` | Get guest's own wishes |

### Admin Endpoints (require Bearer auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/websites` | Create website |
| GET | `/api/websites` | List websites |
| PUT | `/api/websites/:id` | Update website |
| DELETE | `/api/websites/:id` | Delete website |
| POST | `/api/guests/:websiteId` | Create guest |
| POST | `/api/guests/:websiteId/bulk` | Create guests in bulk |
| GET | `/api/guests/website/:websiteId` | List guests |
| GET | `/api/rsvp/website/:websiteId` | Get RSVPs with stats |
| GET | `/api/rsvp/status/:websiteId` | Get guest RSVP status |
| GET | `/api/wishes/website/:websiteId` | Get all wishes |
| POST | `/api/wishes/:id/toggle-visibility` | Toggle wish visibility |
| POST | `/api/wishes/:id/toggle-approval` | Toggle wish approval |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/rsvp_wishes |
| CORS_ORIGINS | Allowed origins (comma-separated) | - |
| ADMIN_PASSWORD | Admin API password | admin123 |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 60000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration
│   ├── database/       # Database connection
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── tests/          # Unit tests
│   ├── validators/     # Zod schemas
│   ├── app.ts          # Express app
│   └── index.ts        # Entry point
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Docker

Build and run:
```bash
npm run build
docker build -t rsvp-backend .
docker run -p 3001:3001 -e MONGODB_URI=mongodb://host:27017/rsvp_wishes rsvp-backend
```

Or use docker-compose from project root:
```bash
docker-compose up
```
