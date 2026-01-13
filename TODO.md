# RSVP and Wishes Canva App - Development TODO

## Project Overview
A Canva app for collecting RSVPs and wishes from guests through Canva's publish web feature.

### Goals
1. Deploy with Canva publish web
2. Receive RSVP and wishes from guests
3. Display all wishes from current published website
4. Validate published web registration
5. Validate guest eligibility via unique codes
6. Rate-limited submission
7. Track RSVP status (submitted vs pending)

---

## Phase 1: Cleanup - Remove Template Code
> **Status**: ✅ Completed

- [x] Remove existing data connector template files
- [x] Clean up directories and update structure
- [x] Update `src/index.tsx` for new intent structure
- [x] Update `canva-app.json` manifest

---

## Phase 2: Backend Development (Express.js + MongoDB)
> **Status**: ✅ Completed

### 2.1 Backend Setup
- [x] Initialize backend project structure
- [x] Setup Express.js server
- [x] Setup MongoDB connection with Mongoose
- [x] Setup environment configuration
- [x] Setup Docker for MongoDB (development)

### 2.2 Database Models
- [x] Create `Website` model (registered published websites)
- [x] Create `Guest` model (invited guests with unique codes)
- [x] Create `RSVP` model (RSVP responses)
- [x] Create `Wish` model (wishes from guests)

### 2.3 API Endpoints
- [x] Website CRUD endpoints (admin)
- [x] Guest management endpoints (admin)
- [x] RSVP submission and status endpoints
- [x] Wish submission and management endpoints
- [x] Embed endpoints for public forms

### 2.4 Middleware
- [x] Rate limiting middleware
- [x] Error handling middleware
- [x] Request validation middleware (Zod)
- [x] CORS configuration for Canva

### 2.5 Unit Tests
- [x] Setup Jest for backend testing
- [x] 37 tests passing for all endpoints

---

## Phase 3: Canva App UI (Design Editor Intent)
> **Status**: ✅ Completed

### 3.1 Intent Setup
- [x] Create `design_editor` intent structure
- [x] Setup AppUiProvider and AppI18nProvider
- [x] Configure HMR for development

### 3.2 Admin Components in Canva App
- [x] Website Setup component (create/edit/delete websites)
- [x] Guest Management component (add/import/delete guests)
- [x] RSVP Status component (view stats and guest status)
- [x] Wishes Management component (moderate wishes)
- [x] Embed Code Generator (copy iframe codes)

### 3.3 API Integration
- [x] Create API client for backend communication
- [x] Context provider for state management
- [x] Error handling

### 3.4 Embed Forms
- [x] Public RSVP form (embeddable iframe)
- [x] Public Wishes Wall (embeddable iframe)
- [x] Open submission without guest codes

---

## Phase 4: Admin Dashboard (Standalone Web App)
> **Status**: ✅ Completed

### 4.1 Admin App Setup
- [x] Initialize Vite + React + TypeScript project
- [x] Setup simple authentication (token-based)

### 4.2 Dashboard Features
- [x] Website management (list, create, edit, delete)
- [x] Guest management (single add, bulk import, delete)
- [x] RSVP tracking with statistics
- [x] Wishes moderation (approve/unapprove, delete)

---

## Phase 5: Deployment
> **Status**: 🔴 Not Started

- [ ] Setup VPS with Docker
- [ ] Configure nginx reverse proxy
- [ ] Setup SSL certificates
- [ ] Deploy MongoDB
- [ ] Deploy backend
- [ ] Deploy admin dashboard
- [ ] Submit Canva app for review
- [ ] Configure production environment variables

---

## Current Progress

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Cleanup | ✅ Completed | 100% |
| Phase 2: Backend | ✅ Completed | 100% |
| Phase 3: Canva UI | ✅ Completed | 100% |
| Phase 4: Admin | ✅ Completed | 100% |
| Phase 5: Deploy | 🔴 Not Started | 0% |

---

## Quick Start

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

---

## Environment Variables

### Backend (.env)
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/rsvp-wishes
ADMIN_TOKEN=admin123
CORS_ORIGINS=http://localhost:8080,https://*.canva-apps.com
```

### Frontend (.env)
```
CANVA_BACKEND_HOST=http://localhost:3001
CANVA_APP_ID=your-app-id
```

### Admin App (.env)
```
VITE_API_URL=http://localhost:3001/api
```

---

## Embed Codes

After creating a website in the Canva app, you can embed forms on any website:

### RSVP Form
```html
<iframe src="http://localhost:3001/api/embed/form/{publishId}" 
        width="100%" height="600" frameborder="0"></iframe>
```

### Wishes Wall
```html
<iframe src="http://localhost:3001/api/embed/wishes-wall/{publishId}" 
        width="100%" height="500" frameborder="0"></iframe>
```
