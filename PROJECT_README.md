# RSVP & Wishes - Canva App

A Canva app for collecting RSVPs and wishes from guests through Canva's publish web feature.

## Features

- **RSVP Collection**: Collect attendance confirmations with guest counts
- **Wishes Wall**: Display congratulatory messages from guests
- **Embed Forms**: Embeddable RSVP form and wishes display for any website
- **Admin Dashboard**: Standalone web app to manage everything
- **Canva Integration**: Manage directly from Canva's design editor
- **Invited vs Walk-in Guests**: 
  - **Invited guests**: Pre-created by admin with custom max attendee limits
  - **Walk-in guests**: Self-registered via public form, capped at 2 attendees
- **Shareable Links**: Generate personalized RSVP links for invited guests

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Canva Editor                           │
│              (Design Editor Intent Panel)                   │
├─────────────────────────────────────────────────────────────┤
│  - Website Setup       - Guest Management                   │
│  - RSVP Tracking       - Wishes Moderation                  │
│  - Embed Code Generator                                     │
└─────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────┐
│                   Embeddable Forms                          │
│  - RSVP Form (iframe)                                       │
│  - Wishes Wall (iframe)                                     │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                            │
│  - Express.js + MongoDB                                     │
│  - Rate limiting & validation                               │
│  - Admin authentication                                     │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Admin Dashboard                           │
│  - Vite + React + TypeScript                               │
│  - Website management                                       │
│  - Guest management (bulk import)                           │
│  - RSVP tracking & statistics                               │
│  - Wishes moderation                                        │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
rvsp-and-wishes/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── routes/       # API routes (websites, guests, rsvp, wishes, embed)
│   │   ├── services/     # Business logic
│   │   ├── models/       # Mongoose models
│   │   ├── middleware/   # Auth, validation, rate limiting
│   │   └── validators/   # Zod schemas
│   └── tests/            # Jest tests
├── admin-app/            # Standalone admin dashboard
│   └── src/
│       ├── pages/        # Login, Dashboard
│       └── api.ts        # API client
├── src/                  # Canva app source
│   ├── intents/
│   │   └── design_editor/
│   ├── components/       # UI components
│   ├── context/          # State management
│   └── api/              # Backend API client
├── nginx/                # Nginx configuration
└── docker-compose.yml    # Development setup
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Canva Developer Account

### 1. Start MongoDB

```bash
docker-compose up -d mongodb
```

### 2. Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:3001`

### 3. Start Canva App

```bash
npm install
npm start
```

Canva app runs at `http://localhost:8080`

### 4. Start Admin Dashboard

```bash
cd admin-app
npm install
npm run dev
```

Admin dashboard runs at `http://localhost:5173`

### 5. Preview in Canva

```bash
canva apps preview
```

## Configuration

### Backend Environment (backend/.env)

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/rsvp-wishes
ADMIN_TOKEN=admin123
CORS_ORIGINS=http://localhost:8080,https://*.canva-apps.com,https://*.canva.site
```

### Canva App Environment (.env)

```env
CANVA_FRONTEND_PORT=8080
CANVA_BACKEND_HOST=http://localhost:3001
CANVA_APP_ID=your-app-id
```

### Admin App Environment (admin-app/.env)

```env
VITE_API_URL=http://localhost:3001/api
```

## Embed Forms

After creating a website, embed these forms on any page:

### RSVP Form
```html
<iframe 
  src="https://your-backend.com/api/embed/form/{publishId}" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border: none; max-width: 450px;">
</iframe>
```

### Personalized RSVP Links for Invited Guests

Generate shareable links for invited guests from the admin dashboard. The link format:
```
https://your-backend.com/api/embed/form/{publishId}?code={guestCode}&name={guestName}
```

When guests use this link:
- Their name is pre-filled and locked
- Max attendees is set to their specific allowance
- The guest code is sent with the RSVP (hidden field)

Walk-in guests (no code) are automatically capped at 2 attendees and marked as "Walk-in" in the dashboard.

### Wishes Wall
```html
<iframe 
  src="https://your-backend.com/api/embed/wishes-wall/{publishId}" 
  width="100%" 
  height="500" 
  frameborder="0"
  style="border: none; max-width: 650px;">
</iframe>
```

## API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/embed/rsvp` | Submit RSVP (supports guest code) |
| POST | `/api/embed/wish` | Submit wish (open form) |
| GET | `/api/embed/guest/:publishId/:code` | Get guest info by code |
| GET | `/api/embed/wishes/:publishId` | Get public wishes |
| GET | `/api/embed/form/:publishId` | Embeddable RSVP form |
| GET | `/api/embed/wishes-wall/:publishId` | Embeddable wishes wall |
| GET | `/api/wishes/public/:publishId` | Get approved wishes |

### Admin Endpoints (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/websites` | List all websites |
| POST | `/api/websites` | Create website |
| PUT | `/api/websites/:id` | Update website |
| DELETE | `/api/websites/:id` | Delete website |
| GET | `/api/guests/website/:id` | List guests |
| POST | `/api/guests/:websiteId` | Add guest |
| POST | `/api/guests/:websiteId/bulk` | Bulk add guests |
| DELETE | `/api/guests/:id` | Delete guest |
| GET | `/api/rsvp/status/:websiteId` | Get RSVP status |
| GET | `/api/wishes/website/:id` | List all wishes |
| POST | `/api/wishes/:id/toggle-approval` | Toggle wish approval |
| DELETE | `/api/wishes/:id` | Delete wish |

## Running Tests

```bash
cd backend
npm test
```

## Development

See individual READMEs:
- [Backend README](./backend/README.md)
- [API Testing Guide](./backend/API_TESTING.md)

## Deployment

### Production with Docker

1. Set up SSL certificates
2. Configure production environment variables
3. Deploy with Docker Compose:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## License

See [LICENSE.md](./LICENSE.md)
