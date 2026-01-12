# RSVP and Wishes - Step-by-Step Implementation Guide

This guide provides detailed steps to build the RSVP and Wishes Canva app.

---

## Prerequisites Checklist

- [x] Node.js installed (check `.nvmrc` for version)
- [x] Canva Developer Account
- [x] App created in Canva Developer Portal
- [ ] Backend hosting decided (see DECISIONS.md)
- [ ] Database chosen (see DECISIONS.md)

---

## Step 1: Update Canva App Configuration

**Current State:** App uses `data_connector` intent  
**Required:** Add `content_publisher` intent for published web functionality

### 1.1 Update `canva-app.json`

```json
{
  "$schema": "https://www.canva.dev/schemas/app/v1/manifest-schema.json",
  "manifest_schema_version": 1,
  "runtime": {
    "permissions": [
      {
        "name": "canva:design:content:read",
        "type": "mandatory"
      },
      {
        "name": "canva:design:content:write",
        "type": "mandatory"
      }
    ]
  },
  "intent": {
    "data_connector": {
      "enrolled": true
    },
    "content_publisher": {
      "enrolled": true
    }
  }
}
```

### 1.2 Files to Create/Modify

- [ ] `src/intents/content_publisher/index.tsx` - New intent entry
- [ ] `src/intents/content_publisher/app.tsx` - Published web UI
- [ ] `src/index.tsx` - Add content_publisher preparation
- [ ] Update `canva-app.json` with new permissions

---

## Step 2: Set Up Backend Server

### 2.1 Create Backend Directory Structure

```bash
mkdir -p backend/src/{routes,middleware,models,services,utils}
mkdir -p backend/migrations
```

### 2.2 Initialize Backend Package

```bash
cd backend
npm init -y
npm install express cors helmet express-rate-limit dotenv
npm install -D typescript @types/node @types/express ts-node nodemon
```

### 2.3 Create Backend Files

Files to create:
- [ ] `backend/package.json` - Dependencies
- [ ] `backend/tsconfig.json` - TypeScript config
- [ ] `backend/src/index.ts` - Server entry point
- [ ] `backend/src/routes/websites.ts` - Website routes
- [ ] `backend/src/routes/guests.ts` - Guest routes
- [ ] `backend/src/routes/rsvp.ts` - RSVP routes
- [ ] `backend/src/routes/wishes.ts` - Wishes routes
- [ ] `backend/src/middleware/rateLimit.ts` - Rate limiting
- [ ] `backend/src/middleware/auth.ts` - API key auth
- [ ] `backend/src/middleware/validation.ts` - Request validation
- [ ] `backend/.env.example` - Environment template

---

## Step 3: Database Setup

### 3.1 PostgreSQL Schema (if chosen)

```sql
-- websites table
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canva_design_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- guests table
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  invite_code VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- rsvps table
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID UNIQUE REFERENCES guests(id) ON DELETE CASCADE,
  attending BOOLEAN NOT NULL,
  guest_count INTEGER DEFAULT 1,
  dietary_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- wishes table
CREATE TABLE wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- rate_limits table (for tracking)
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  last_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(identifier, action_type)
);
```

### 3.2 Create Migration Files

- [ ] `backend/migrations/001_create_websites.sql`
- [ ] `backend/migrations/002_create_guests.sql`
- [ ] `backend/migrations/003_create_rsvps.sql`
- [ ] `backend/migrations/004_create_wishes.sql`

---

## Step 4: Implement Backend APIs

### 4.1 Website Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/websites` | POST | API Key | Register new website |
| `/api/websites/:id` | GET | API Key | Get website details |
| `/api/websites/:id/validate` | GET | Public | Check if website exists |

### 4.2 Guest Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/websites/:id/guests` | POST | API Key | Add guest(s) |
| `/api/websites/:id/guests` | GET | API Key | List all guests |
| `/api/websites/:id/guests/:guestId` | PUT | API Key | Update guest |
| `/api/websites/:id/guests/:guestId` | DELETE | API Key | Remove guest |
| `/api/guests/validate` | POST | Public | Validate guest eligibility |

### 4.3 RSVP Endpoints

| Endpoint | Method | Auth | Rate Limit | Description |
|----------|--------|------|------------|-------------|
| `/api/rsvp` | POST | Public | 1/guest | Submit RSVP |
| `/api/websites/:id/rsvp` | GET | API Key | - | Get all RSVPs |
| `/api/websites/:id/rsvp/status` | GET | Public | - | Get RSVP summary |

### 4.4 Wishes Endpoints

| Endpoint | Method | Auth | Rate Limit | Description |
|----------|--------|------|------------|-------------|
| `/api/wishes` | POST | Public | 1/hr/guest | Submit wish |
| `/api/websites/:id/wishes` | GET | Public | - | Get public wishes |

---

## Step 5: Build Canva App Frontend

### 5.1 Content Publisher Intent (Guest View)

Create these pages:
- [ ] Guest validation page (enter name/invite code)
- [ ] RSVP submission form
- [ ] Wishes submission form
- [ ] All wishes display page
- [ ] RSVP status overview

### 5.2 Design Editor Enhancement (Admin View)

Enhance existing data connector:
- [ ] Website registration on first load
- [ ] Guest management interface
- [ ] Import guests from CSV/spreadsheet
- [ ] RSVP dashboard view
- [ ] Export RSVPs to spreadsheet

### 5.3 Shared Components

- [ ] `GuestList` - Display guest list with RSVP status
- [ ] `RSVPForm` - RSVP submission form
- [ ] `WishForm` - Wish submission form
- [ ] `WishCard` - Display individual wish
- [ ] `WishesList` - Display all wishes
- [ ] `StatusBadge` - RSVP status indicator
- [ ] `LoadingState` - Loading skeleton
- [ ] `ErrorState` - Error display

---

## Step 6: API Integration

### 6.1 Create API Client

Files:
- [ ] `src/api/client.ts` - Base HTTP client
- [ ] `src/api/websites.ts` - Website API calls
- [ ] `src/api/guests.ts` - Guest API calls
- [ ] `src/api/rsvp.ts` - RSVP API calls
- [ ] `src/api/wishes.ts` - Wishes API calls

### 6.2 Environment Configuration

Add to `.env`:
```
BACKEND_URL=http://localhost:3001
API_KEY=your-api-key
```

---

## Step 7: Testing

### 7.1 Backend Tests

- [ ] Unit tests for each API endpoint
- [ ] Integration tests for database operations
- [ ] Rate limiting tests

### 7.2 Frontend Tests

- [ ] Component unit tests
- [ ] Form validation tests
- [ ] API integration tests (mocked)

### 7.3 End-to-End Testing

- [ ] Test in Canva preview mode
- [ ] Test published website flow
- [ ] Test guest validation flow
- [ ] Test RSVP submission
- [ ] Test wishes submission

---

## Step 8: Deployment

### 8.1 Backend Deployment

1. [ ] Choose hosting provider
2. [ ] Set up production database
3. [ ] Configure environment variables
4. [ ] Deploy backend server
5. [ ] Set up domain/SSL
6. [ ] Test production endpoints

### 8.2 Canva App Deployment

1. [ ] Update API URLs to production
2. [ ] Run `npm run build`
3. [ ] Test in Canva preview
4. [ ] Submit to Canva for review
5. [ ] Address review feedback
6. [ ] Publish app

---

## Quick Reference Commands

```bash
# Development
npm start                    # Start Canva app dev server
cd backend && npm run dev    # Start backend dev server

# Testing
npm test                     # Run frontend tests
cd backend && npm test       # Run backend tests

# Building
npm run build                # Build Canva app for production

# Linting
npm run lint:fix             # Fix lint issues
npm run lint:types           # TypeScript check
```

---

## Next Steps

1. **Review [DECISIONS.md](./DECISIONS.md)** and make your choices
2. Once decisions are made, proceed with Step 1
3. Follow steps sequentially, checking off items as completed
4. Update this guide with any project-specific notes

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-12
