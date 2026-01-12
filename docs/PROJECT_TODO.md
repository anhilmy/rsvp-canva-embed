# RSVP and Wishes - Canva App Project TODO

## Project Overview

A Canva app that allows users to:
- Receive RSVP responses and wishes from guests
- Display all wishes on the published website
- Track RSVP status of registered guests

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
- [x] Configure `canva-app.json` for content_publisher intent
- [x] Set up API client for backend communication
- [x] Update src/index.tsx with content_publisher

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
- [x] `GET /api/rsvp/website/:id/status` - Get RSVP summary (submitted vs pending)

### 2.4 Wishes APIs
- [x] `POST /api/wishes` - Submit a wish (with rate limiting)
- [x] `GET /api/wishes/website/:id` - Get public wishes for website
- [x] `GET /api/wishes/website/:id/all` - Get all wishes (admin)
- [x] `PUT /api/wishes/:id/report` - Report a wish
- [x] `PUT /api/wishes/:id/hide` - Hide a wish (admin)

### 2.5 Security & Middleware
- [x] Implement rate limiting middleware
- [x] Implement basic API key authentication
- [x] Add request validation middleware
- [x] Add error handling middleware

---

## Phase 3: Canva App Frontend Development

### 3.1 App Structure
- [x] Set up Content Publisher intent (for publish web)
- [x] Set up Design Editor intent (for admin)
- [ ] Create AppContext for state management
- [ ] Set up routing structure

### 3.2 Admin/Host Views (Design Editor Intent)
- [x] Website registration page (Setup tab)
- [x] Guest management page (add/edit/remove guests)
- [x] Bulk guest import (CSV format)
- [x] RSVP dashboard (view all responses)
- [x] Wishes moderation page (hide/unhide/report)

### 3.3 Guest Views (Published Web)
- [x] Guest validation page (enter invite code)
- [x] RSVP submission form (Yes/No/Maybe)
- [x] Wishes submission form
- [x] All wishes display page
- [x] RSVP status overview page

### 3.4 UI Components
- [x] Guest validation component
- [x] RSVP form component
- [x] Wishes form component
- [x] Wishes display/card component
- [x] Status indicator component
- [x] Admin tabs (Setup, Guests, RSVP, Wishes)
- [x] Loading/error states

---

## Phase 4: Integration & Testing

### 4.1 API Integration
- [ ] Connect frontend to backend APIs
- [ ] Handle authentication flow
- [ ] Implement error handling
- [ ] Add loading states

### 4.2 Testing
- [ ] Write unit tests for API endpoints
- [ ] Write unit tests for frontend components
- [ ] Integration testing
- [ ] Manual testing with Canva preview

---

## Phase 5: Deployment & Launch

### 5.1 Backend Deployment
- [ ] Choose hosting provider (see DECISIONS.md)
- [ ] Deploy backend server
- [ ] Set up database in production
- [ ] Configure environment variables

### 5.2 Canva App Submission
- [ ] Run production build (`npm run build`)
- [ ] Test in Canva preview mode
- [ ] Submit to Canva for review
- [ ] Address any review feedback

### 5.3 Post-Launch
- [ ] Monitor for errors
- [ ] Gather user feedback
- [ ] Plan for improvements

---

## Current Progress

**Phase:** 4 - Integration & Testing  
**Status:** Ready for Testing  
**Last Updated:** 2026-01-12

### Completed:
- ✅ Backend server with Express.js + MongoDB
- ✅ All API endpoints implemented (websites, guests, RSVPs, wishes)
- ✅ Docker + nginx configuration
- ✅ Content Publisher intent (guest view)
- ✅ Design Editor intent (admin view)
- ✅ Guest validation, RSVP, and wishes components
- ✅ Admin dashboard with tabs (Setup, Guests, RSVPs, Wishes)
- ✅ Bulk guest import
- ✅ Wish moderation (hide/unhide/report)
- ✅ Backend README with deployment instructions

### Next Steps:
1. Install backend dependencies: `cd backend && npm install`
2. Start MongoDB: `docker run -d -p 27017:27017 mongo:7`
3. Configure `.env` from `.env.example`
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `npm start`
6. Test in Canva preview

---

## Notes

- Backend server required for data persistence
- Rate limiting: 1 RSVP per guest, 1 wish per guest per hour (configurable)
- Guest validation can be by name matching or unique invite code
