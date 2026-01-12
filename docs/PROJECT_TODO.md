# RSVP and Wishes - Canva App Project TODO

## Project Overview

A Canva app that allows users to:
- Receive RSVP responses and wishes from guests
- Display all wishes on the published website
- Track RSVP status of registered guests

**Architecture:**
- **Canva App (Design Editor)**: Guest-facing RSVP form embedded in Canva websites
- **Admin Dashboard**: Separate standalone web app for event management
- **Backend API**: Express.js + MongoDB for data persistence

---

## Phase 1: Project Setup & Architecture

### 1.1 Backend Setup
- [x] Set up Node.js backend server (Express.js)
- [x] Configure database (MongoDB)
- [x] Set up environment variables for backend
- [x] Create API structure
- [x] Docker configuration for deployment

### 1.2 Database Schema Design
- [x] Create `websites` collection (registered published websites)
- [x] Create `guests` collection (pre-registered guests per website)
- [x] Create `rsvps` collection (RSVP responses)
- [x] Create `wishes` collection (guest wishes/messages)

### 1.3 Canva App Configuration
- [x] Configure `canva-app.json` for design_editor intent
- [x] Set up API client for backend communication
- [x] Update src/index.tsx with design_editor

---

## Phase 2: Backend API Development

### 2.1 Website Registration APIs
- [x] `POST /api/websites` - Register a new published website
- [x] `GET /api/websites/:id` - Get website details
- [x] `GET /api/websites/:id/validate` - Validate if website is registered

### 2.2 Guest Management APIs
- [x] `POST /api/guests` - Add guest(s) to website
- [x] `GET /api/guests/website/:id` - List all guests
- [x] `PUT /api/guests/:guestId` - Update guest
- [x] `DELETE /api/guests/:guestId` - Remove guest
- [x] `POST /api/guests/validate` - Validate guest eligibility (by invite code)

### 2.3 RSVP APIs
- [x] `POST /api/rsvp` - Submit RSVP (with rate limiting)
- [x] `GET /api/rsvp/website/:id` - Get all RSVPs for website
- [x] `GET /api/rsvp/website/:id/stats` - Get RSVP summary stats

### 2.4 Wishes APIs
- [x] `POST /api/wishes` - Submit a wish (with rate limiting)
- [x] `GET /api/wishes/website/:id/public` - Get public wishes for website
- [x] `GET /api/wishes/website/:id/all` - Get all wishes (admin)
- [x] `PUT /api/wishes/:id/report` - Report a wish
- [x] `PUT /api/wishes/:id/hide` - Hide a wish (admin)

### 2.5 Security & Middleware
- [x] Implement rate limiting middleware
- [x] Implement basic API key authentication
- [x] Add request validation middleware
- [x] Add error handling middleware

---

## Phase 3: Frontend Development

### 3.1 Canva App (Guest View - Design Editor Intent)
- [x] Event code entry page
- [x] Guest validation component (invite code)
- [x] RSVP submission form (Yes/No/Maybe)
- [x] Wishes submission form
- [x] Wishes display list
- [x] RSVP stats summary
- [x] Loading/error states

### 3.2 Admin Dashboard (Standalone Web App)
- [x] Set up Vite + React + TypeScript
- [x] Set up TailwindCSS for styling
- [x] Set up React Router for navigation
- [x] Set up React Query for data fetching
- [x] Login page (website ID + API key)
- [x] Registration page (create new event)
- [x] Dashboard with stats overview
- [x] Guests management page
- [x] RSVPs list page
- [x] Wishes moderation page
- [x] Settings page

## Phase 4: Integration & Testing

### 4.1 API Integration
- [x] Connect Canva app to backend APIs
- [x] Connect admin dashboard to backend APIs
- [x] Handle authentication flow
- [x] Implement error handling
- [x] Add loading states

### 4.2 Testing
- [ ] Write unit tests for API endpoints
- [ ] Write unit tests for frontend components
- [ ] Integration testing
- [ ] Manual testing with Canva preview

---

## Phase 5: Deployment & Launch

### 5.1 Backend Deployment
- [ ] Deploy backend server to VPS
- [ ] Set up MongoDB in production
- [ ] Configure Docker + nginx
- [ ] Set up SSL certificate

### 5.2 Admin Dashboard Deployment
- [ ] Build admin app (`cd admin-app && npm run build`)
- [ ] Deploy to VPS or static hosting
- [ ] Configure nginx for admin subdomain

### 5.3 Canva App Submission
- [ ] Run production build (`npm run build`)
- [ ] Test in Canva preview mode
- [ ] Submit to Canva for review
- [ ] Address any review feedback

### 5.4 Post-Launch
- [ ] Monitor for errors
- [ ] Gather user feedback
- [ ] Plan for improvements

---

## Current Progress

**Phase:** 4 - Integration & Testing  
**Status:** Ready for Testing  
**Last Updated:** 2026-01-12

### Architecture:
```
┌─────────────────────────────────────────────────────────────────┐
│                    Your VPS (Docker)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Backend   │  │  MongoDB    │  │    nginx (reverse       │ │
│  │  (port 3001)│  │  (port 27017)│  │    proxy + SSL)        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │                                      │
          │                                      │
   ┌──────▼───────┐                     ┌───────▼───────┐
   │ Canva App    │                     │ Admin Dashboard│
   │ (Guest RSVP) │                     │ (Management)   │
   │ Design Editor│                     │ Vite/React     │
   └──────────────┘                     └────────────────┘
```

### Completed:
- ✅ Backend server with Express.js + MongoDB
- ✅ All API endpoints (websites, guests, RSVPs, wishes)
- ✅ Docker + nginx configuration
- ✅ Canva App - Design Editor intent (guest-facing RSVP form)
- ✅ Admin Dashboard - Standalone web app (React + Vite + TailwindCSS)
- ✅ API clients for both frontends

### Next Steps:
1. **Backend Setup:**
   ```bash
   cd backend && npm install
   docker-compose up -d  # MongoDB + app
   ```

2. **Admin Dashboard Setup:**
   ```bash
   cd admin-app && npm install
   npm run dev  # Runs on http://localhost:3000
   ```

3. **Canva App Setup:**
   ```bash
   npm install
   npm start  # Runs on http://localhost:8080
   ```

4. **Testing Flow:**
   - Create event in admin dashboard → get Website ID + API Key
   - Add guests → get invite codes
   - Preview Canva app → enter Website ID
   - Enter invite code → submit RSVP → send wish
   - View responses in admin dashboard

---

## Notes

- Backend server required for data persistence
- Rate limiting: 1 RSVP per guest, 1 wish per guest per hour (configurable)
- Guest validation via unique 8-character invite code
- RSVP options: Attending / Not Attending / Maybe
