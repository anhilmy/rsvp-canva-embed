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
- [x] Clean up `src/api/` directory
- [x] Clean up `src/components/` directory  
- [x] Clean up `src/context/` directory
- [x] Clean up `src/intents/data_connector/` directory
- [x] Clean up `src/pages/` directory
- [x] Clean up `src/routes/` directory
- [x] Clean up `src/utils/` directory
- [x] Update `src/index.tsx` for new intent structure
- [x] Update `canva-app.json` manifest
- [x] Clean up `styles/components.css` (kept as placeholder)
- [x] Remove unused dependencies from `package.json` (will update in Phase 3)

---

## Phase 2: Backend Development (Express.js + MongoDB)
> **Status**: ✅ Completed - Ready for Testing

### 2.1 Backend Setup
- [x] Initialize backend project structure
- [x] Setup Express.js server
- [x] Setup MongoDB connection with Mongoose
- [x] Setup environment configuration
- [x] Setup Docker for MongoDB (development)
- [x] Setup Docker Compose for local development

### 2.2 Database Models
- [x] Create `Website` model (registered published websites)
- [x] Create `Guest` model (invited guests with unique codes)
- [x] Create `RSVP` model (RSVP responses)
- [x] Create `Wish` model (wishes from guests)

### 2.3 API Endpoints
- [x] `POST /api/websites` - Register a new website (admin)
- [x] `GET /api/websites/validate/:publishId` - Validate website registration
- [x] `POST /api/guests/validate` - Validate guest by unique code
- [x] `POST /api/rsvp` - Submit RSVP response
- [x] `POST /api/wishes` - Submit a wish
- [x] `GET /api/wishes/public/:publishId` - Get all wishes for a website
- [x] `GET /api/rsvp/status/:websiteId` - Get RSVP status for all guests (admin)

### 2.4 Middleware
- [x] Rate limiting middleware
- [x] Error handling middleware
- [x] Request validation middleware
- [x] CORS configuration for Canva

### 2.5 Unit Tests
- [x] Setup Jest for backend testing
- [x] Setup MongoDB Memory Server for tests
- [x] Write tests for Website endpoints
- [x] Write tests for Guest endpoints
- [x] Write tests for RSVP endpoints
- [x] Write tests for Wish endpoints
- [x] Write tests for validation logic

### 2.6 Docker Configuration
- [x] Create `Dockerfile` for backend
- [x] Create `docker-compose.yml` for full stack
- [x] Setup nginx configuration
- [x] Environment variable management

> **⏸️ STOP POINT: Test backend thoroughly before proceeding**

---

## Phase 3: Canva App UI (RSVP Form + Wishes List)
> **Status**: 🔴 Not Started

### 3.1 Intent Setup
- [ ] Create `content_publisher` intent structure
- [ ] Setup AppUiProvider and AppI18nProvider
- [ ] Configure HMR for development

### 3.2 Guest Validation Flow
- [ ] Create guest validation page
- [ ] Handle URL parameters (unique code, guest name)
- [ ] Display validation errors
- [ ] Store validated guest in context

### 3.3 RSVP Form Component
- [ ] Create RSVP form with attendance selection
- [ ] Add number of attendees field
- [ ] Add dietary restrictions field (optional)
- [ ] Add wishes/message textarea
- [ ] Form validation
- [ ] Submit handler with loading state
- [ ] Success/error feedback

### 3.4 Wishes List Component
- [ ] Fetch wishes from backend
- [ ] Display wishes in a scrollable list
- [ ] Show guest name and message
- [ ] Handle empty state
- [ ] Handle loading state
- [ ] Auto-refresh or pagination

### 3.5 API Integration
- [ ] Create API client for backend communication
- [ ] Handle authentication/validation
- [ ] Error handling and retry logic

### 3.6 Styling
- [ ] Use App UI Kit components
- [ ] Responsive design
- [ ] Loading states
- [ ] Error states

> **⏸️ STOP POINT: Test Canva app integration before proceeding**

---

## Phase 4: Admin Dashboard
> **Status**: 🔴 Not Started

### 4.1 Admin App Setup
- [ ] Initialize admin-app with Vite/React
- [ ] Setup routing
- [ ] Setup authentication (basic)

### 4.2 Website Management
- [ ] List all registered websites
- [ ] Register new website (with Canva publish ID)
- [ ] Edit website details
- [ ] Delete website

### 4.3 Guest Management
- [ ] Add guests (bulk import CSV)
- [ ] Generate unique codes
- [ ] Edit guest details
- [ ] Delete guests
- [ ] Generate shareable links

### 4.4 RSVP Tracking
- [ ] View all RSVPs for a website
- [ ] Filter by status (confirmed/declined/pending)
- [ ] Export RSVP data
- [ ] Statistics dashboard

### 4.5 Wishes Management
- [ ] View all wishes
- [ ] Moderate wishes (approve/hide)
- [ ] Export wishes

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
| Phase 3: Canva UI | 🔴 Not Started | 0% |
| Phase 4: Admin | 🔴 Not Started | 0% |
| Phase 5: Deploy | 🔴 Not Started | 0% |

---

## Notes
- Backend URL will need to be configured in environment variables
- Canva publish ID is obtained when user publishes their design as a website
- Unique guest codes should be short but collision-resistant (e.g., nanoid)
- Rate limiting: 1 RSVP per guest (enforced by unique code)

---

## How to Test Phase 2 (Backend)

### 1. Start MongoDB
```bash
docker-compose up -d mongodb
```

### 2. Run Backend Tests
```bash
cd backend
npm install
npm test
```

### 3. Start Backend Server
```bash
cd backend
npm run dev
```

### 4. Test API Manually
See [backend/API_TESTING.md](./backend/API_TESTING.md) for curl commands.

### Quick Test Sequence:
```bash
# Create a website
curl -X POST http://localhost:3001/api/websites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin123" \
  -d '{"publishId": "test-wedding", "name": "Test Wedding"}'

# Create a guest (use the _id from above)
curl -X POST http://localhost:3001/api/guests/<website_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin123" \
  -d '{"name": "Test Guest", "maxAttendees": 2}'

# Validate guest (use the uniqueCode from above)
curl -X POST http://localhost:3001/api/guests/validate \
  -H "Content-Type: application/json" \
  -d '{"code": "<guest_code>", "publishId": "test-wedding"}'

# Submit RSVP
curl -X POST http://localhost:3001/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{"guestCode": "<guest_code>", "publishId": "test-wedding", "status": "attending", "attendeeCount": 2}'

# Submit wish
curl -X POST http://localhost:3001/api/wishes \
  -H "Content-Type: application/json" \
  -d '{"guestCode": "<guest_code>", "publishId": "test-wedding", "message": "Congratulations!"}'

# Get public wishes
curl http://localhost:3001/api/wishes/public/test-wedding
```

### When Ready to Continue:
After testing the backend, let me know and we'll proceed to **Phase 3: Canva UI**.
