# RSVP & Wishes - Canva App

A Canva app for collecting RSVPs and wishes from guests through Canva's publish web feature.

## Features

- **Guest Validation**: Validates guests using unique codes distributed with invitations
- **RSVP Collection**: Collects attendance confirmations with attendee counts
- **Wishes Wall**: Displays congratulatory messages from guests
- **Rate Limiting**: Prevents spam and abuse
- **Admin Dashboard**: Manage websites, guests, RSVPs, and wishes

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Canva Published Website                 │
│                   (e.g., yourwedding.canva.site)            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Canva App (iframe)                   │  │
│  │  - Guest validation                                   │  │
│  │  - RSVP form                                          │  │
│  │  - Wishes submission                                  │  │
│  │  - Public wishes display                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       Backend API                            │
│  - Express.js                                                │
│  - MongoDB                                                   │
│  - Authentication                                            │
│  - Rate limiting                                             │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard                           │
│  - Website management                                        │
│  - Guest management (bulk import)                            │
│  - RSVP tracking                                             │
│  - Wishes moderation                                         │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
rvsp-and-wishes/
├── backend/           # Express.js API server
├── admin-app/         # Admin dashboard (Phase 4)
├── src/               # Canva app source
│   └── intents/
│       └── content_publisher/
├── nginx/             # Nginx configuration
├── docker-compose.yml # Development docker setup
└── docker-compose.prod.yml # Production docker setup
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Canva Developer Account

### 1. Start Backend

```bash
# Start MongoDB
docker-compose up -d mongodb

# Install and run backend
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:3001`

### 2. Start Canva App

```bash
# In project root
npm install
npm start
```

Canva app runs at `http://localhost:8080`

### 3. Preview in Canva

Use the Canva CLI to preview:
```bash
canva apps preview
```

## Development

See individual READMEs:
- [Backend README](./backend/README.md)
- [API Testing Guide](./backend/API_TESTING.md)

## Deployment

### VPS with Docker

1. Set up SSL certificates:
```bash
certbot certonly --standalone -d your-domain.com
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with production values
```

3. Deploy:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Documentation

- [TODO.md](./TODO.md) - Development progress
- [DECISIONS.md](./DECISIONS.md) - Pending design decisions
- [AGENTS.md](./AGENTS.md) - AI agent instructions

## License

See [LICENSE.md](./LICENSE.md)
