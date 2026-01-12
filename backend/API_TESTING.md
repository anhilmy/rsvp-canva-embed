# RSVP & Wishes Backend - API Testing Guide

This guide shows how to test the backend API manually.

## Prerequisites
1. Start MongoDB: `docker-compose up -d mongodb`
2. Start Backend: `cd backend && npm run dev`

## Test Endpoints

### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

### 2. Create Website (Admin)
```bash
curl -X POST http://localhost:3001/api/websites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin123" \
  -d '{"publishId": "test-wedding-123", "name": "John & Jane Wedding"}'
```

### 3. List Websites (Admin)
```bash
curl http://localhost:3001/api/websites \
  -H "Authorization: Bearer admin123"
```

### 4. Validate Website (Public)
```bash
curl http://localhost:3001/api/websites/validate/test-wedding-123
```

### 5. Create Guest (Admin)
```bash
# First get the website ID from step 2 or 3
WEBSITE_ID="<website_id_here>"
curl -X POST http://localhost:3001/api/guests/$WEBSITE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin123" \
  -d '{"name": "Guest Name", "email": "guest@example.com", "maxAttendees": 2}'
```

### 6. Create Guests in Bulk (Admin)
```bash
WEBSITE_ID="<website_id_here>"
curl -X POST http://localhost:3001/api/guests/$WEBSITE_ID/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin123" \
  -d '{"guests": [{"name": "Guest 1", "maxAttendees": 2}, {"name": "Guest 2", "maxAttendees": 1}]}'
```

### 7. Validate Guest (Public)
```bash
curl -X POST http://localhost:3001/api/guests/validate \
  -H "Content-Type: application/json" \
  -d '{"code": "ABC123", "publishId": "test-wedding-123"}'
```

### 8. Submit RSVP (Public)
```bash
curl -X POST http://localhost:3001/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{"guestCode": "ABC123", "publishId": "test-wedding-123", "status": "attending", "attendeeCount": 2}'
```

### 9. Check RSVP Status (Public)
```bash
curl http://localhost:3001/api/rsvp/check/ABC123
```

### 10. Submit Wish (Public)
```bash
curl -X POST http://localhost:3001/api/wishes \
  -H "Content-Type: application/json" \
  -d '{"guestCode": "ABC123", "publishId": "test-wedding-123", "message": "Congratulations on your wedding!"}'
```

### 11. Get Public Wishes (Public)
```bash
curl http://localhost:3001/api/wishes/public/test-wedding-123
```

### 12. Get RSVP Stats (Admin)
```bash
WEBSITE_ID="<website_id_here>"
curl http://localhost:3001/api/rsvp/website/$WEBSITE_ID \
  -H "Authorization: Bearer admin123"
```

### 13. Get Guest Status (Admin)
```bash
WEBSITE_ID="<website_id_here>"
curl http://localhost:3001/api/rsvp/status/$WEBSITE_ID \
  -H "Authorization: Bearer admin123"
```

## Error Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid admin auth)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
