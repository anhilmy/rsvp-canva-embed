# RSVP and Wishes - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CANVA PLATFORM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────────────────┐  │
│  │  Design Editor   │         │     Published Website        │  │
│  │  (Admin View)    │         │     (Guest View)             │  │
│  │                  │         │                              │  │
│  │  - Register Web  │         │  - Validate Guest            │  │
│  │  - Add Guests    │         │  - Submit RSVP               │  │
│  │  - View RSVPs    │         │  - Submit Wishes             │  │
│  │  - Moderate      │         │  - View All Wishes           │  │
│  │    Wishes        │         │  - View RSVP Status          │  │
│  │                  │         │                              │  │
│  └────────┬─────────┘         └──────────────┬───────────────┘  │
│           │                                  │                   │
└───────────┼──────────────────────────────────┼───────────────────┘
            │                                  │
            │         HTTPS API Calls          │
            │                                  │
            ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND SERVER                             │
│                       (Node.js/Express)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Rate Limit  │  │ API Key     │  │ Request Validation      │  │
│  │ Middleware  │  │ Auth        │  │ Middleware              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     API ROUTES                            │   │
│  │  /api/websites    - Website registration & validation     │   │
│  │  /api/guests      - Guest management                      │   │
│  │  /api/rsvp        - RSVP submissions & retrieval          │   │
│  │  /api/wishes      - Wishes submissions & retrieval        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                 │
│                    (PostgreSQL/MongoDB)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  websites  │  │   guests   │  │   rsvps    │  │   wishes   │ │
│  ├────────────┤  ├────────────┤  ├────────────┤  ├────────────┤ │
│  │ id         │  │ id         │  │ id         │  │ id         │ │
│  │ canva_id   │  │ website_id │  │ guest_id   │  │ guest_id   │ │
│  │ name       │  │ name       │  │ attending  │  │ message    │ │
│  │ created_at │  │ email      │  │ guests_cnt │  │ is_public  │ │
│  │ api_key    │  │ invite_code│  │ created_at │  │ created_at │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
│                                                                  │
│  Relationships:                                                  │
│  - websites 1:N guests                                           │
│  - guests 1:1 rsvps                                              │
│  - guests 1:N wishes                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Flow 1: Website Registration (Admin)
```
1. Admin creates design in Canva
2. Admin opens RSVP app in design editor
3. Admin registers website with unique identifier
4. Backend creates website record with API key
5. Admin adds guest list (names, emails, invite codes)
6. Admin publishes design to web
```

### Flow 2: Guest RSVP Submission
```
1. Guest receives published website link
2. Guest opens link, sees validation form
3. Guest enters name/invite code
4. Backend validates guest eligibility
5. If valid, guest sees RSVP form
6. Guest submits RSVP (rate limited)
7. Backend records RSVP response
```

### Flow 3: Wish Submission
```
1. Validated guest sees wish form
2. Guest writes and submits wish
3. Backend validates (rate limit check)
4. Wish saved to database
5. Wish appears in public wishes list
```

### Flow 4: View Wishes & RSVP Status
```
1. Guest navigates to wishes page
2. Frontend fetches public wishes from API
3. Wishes displayed in card format
4. Guest can also view RSVP status summary
```

## Security Considerations

### Basic Security (Current Scope)
- API key authentication for admin endpoints
- Rate limiting on submission endpoints
- Input validation and sanitization
- HTTPS only
- CORS restricted to Canva domains

### Future Enhancements (Not in MVP)
- JWT-based authentication
- Guest session tokens
- CAPTCHA on submissions
- Content moderation AI
- IP-based blocking

## File Structure

```
rvsp-and-wishes/
├── src/                          # Canva App Frontend
│   ├── index.tsx                 # Entry point
│   ├── intents/
│   │   ├── design_editor/        # Admin interface
│   │   │   ├── index.tsx
│   │   │   └── app.tsx
│   │   └── content_publisher/    # Published web interface
│   │       ├── index.tsx
│   │       └── app.tsx
│   ├── components/               # Shared UI components
│   ├── api/                      # API client functions
│   ├── pages/                    # Page components
│   └── context/                  # React context
│
├── backend/                      # Backend Server (NEW)
│   ├── src/
│   │   ├── index.ts              # Server entry
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Express middleware
│   │   ├── models/               # Database models
│   │   ├── services/             # Business logic
│   │   └── utils/                # Utilities
│   ├── migrations/               # Database migrations
│   └── package.json
│
├── docs/                         # Documentation
│   ├── PROJECT_TODO.md
│   ├── DECISIONS.md
│   └── ARCHITECTURE.md
│
└── package.json
```

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/websites` | API Key | Register website |
| GET | `/api/websites/:id` | API Key | Get website details |
| GET | `/api/websites/:id/validate` | None | Validate website exists |
| POST | `/api/websites/:id/guests` | API Key | Add guests |
| GET | `/api/websites/:id/guests` | API Key | List guests |
| POST | `/api/guests/validate` | None | Validate guest eligibility |
| POST | `/api/rsvp` | None | Submit RSVP |
| GET | `/api/websites/:id/rsvp` | API Key | Get all RSVPs |
| GET | `/api/websites/:id/rsvp/status` | None | Get RSVP summary |
| POST | `/api/wishes` | None | Submit wish |
| GET | `/api/websites/:id/wishes` | None | Get public wishes |

## Technology Stack

### Frontend (Canva App)
- React 18
- TypeScript
- @canva/app-ui-kit
- @canva/platform SDK
- react-intl (i18n)

### Backend
- Node.js
- Express.js
- TypeScript
- Database ORM (Prisma/TypeORM)
- express-rate-limit

### Database
- PostgreSQL (recommended) / MongoDB / SQLite

---

**Last Updated:** 2026-01-12
