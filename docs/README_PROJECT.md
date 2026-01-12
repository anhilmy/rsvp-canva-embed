# RSVP and Wishes - Canva App

## Overview

A Canva App that enables event hosts to collect RSVP responses and wishes from guests through a published Canva website.

### Features

- **Guest Registration**: Pre-register guests who can RSVP
- **RSVP Collection**: Guests submit their attendance response
- **Wishes/Messages**: Guests can leave wishes and messages
- **Public Wishes Display**: Show all wishes on the published website
- **RSVP Tracking**: View who has responded and who hasn't

## Project Documentation

| Document | Description |
|----------|-------------|
| [PROJECT_TODO.md](docs/PROJECT_TODO.md) | Main task checklist and project progress |
| [DECISIONS.md](docs/DECISIONS.md) | Pending architectural decisions |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture overview |
| [IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md) | Step-by-step implementation guide |
| [AGENTS.md](AGENTS.md) | AI agent development guide |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
rvsp-and-wishes/
├── src/                    # Canva App Frontend
│   ├── index.tsx          # Entry point
│   ├── intents/           # Intent implementations
│   │   ├── data_connector/    # Admin/host interface
│   │   └── content_publisher/ # Published web (guest view)
│   ├── components/        # Shared UI components
│   ├── api/               # API client
│   └── pages/             # Page components
│
├── backend/               # Backend Server (to be created)
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── models/        # Database models
│   └── migrations/        # Database migrations
│
├── docs/                  # Project documentation
└── styles/                # CSS styles
```

## Development Status

**Current Phase:** Planning  
**Next Steps:** Review [DECISIONS.md](docs/DECISIONS.md) and make architectural choices

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start development server (localhost:8080) |
| `npm run build` | Production build |
| `npm test` | Run Jest tests |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format code with Prettier |

## Requirements

- Node.js (see `.nvmrc` for version)
- Canva Developer Account
- App created in Canva Developer Portal

## License

SEE LICENSE IN LICENSE.md
