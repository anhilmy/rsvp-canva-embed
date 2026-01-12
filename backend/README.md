# RSVP & Wishes Backend

Node.js/Express backend server for the RSVP and Wishes Canva App.

## Prerequisites

- Node.js 20+
- MongoDB (local or cloud)
- Docker (optional, for containerized deployment)

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure `.env`:**
   ```env
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/rsvp-wishes
   API_KEY=your-secure-api-key-here
   CORS_ORIGIN=http://localhost:8080
   ```

4. **Start MongoDB** (if local):
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7

   # Or install locally and run
   mongod
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

   Server will run at `http://localhost:3001`

### Docker Deployment

1. **Build and run with Docker Compose** (from project root):
   ```bash
   docker-compose up -d
   ```

2. **Or build manually:**
   ```bash
   cd backend
   npm run build
   docker build -t rsvp-backend .
   docker run -p 3001:3001 --env-file .env rsvp-backend
   ```

## API Endpoints

### Public Endpoints (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/websites/:id/validate` | Validate website exists |
| POST | `/api/guests/validate` | Validate guest by invite code |
| POST | `/api/rsvp` | Submit RSVP (rate limited) |
| GET | `/api/rsvp/website/:id/status` | Get RSVP summary |
| POST | `/api/wishes` | Submit wish (rate limited) |
| GET | `/api/wishes/website/:id` | Get public wishes |
| PUT | `/api/wishes/:id/report` | Report a wish |

### Admin Endpoints (Requires API Key)

Include header: `x-api-key: your-api-key`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/websites` | Register new website |
| GET | `/api/websites/:id` | Get website details |
| POST | `/api/guests` | Add guest(s) |
| GET | `/api/guests/website/:id` | List all guests |
| PUT | `/api/guests/:id` | Update guest |
| DELETE | `/api/guests/:id` | Remove guest |
| GET | `/api/rsvp/website/:id` | Get all RSVPs |
| GET | `/api/wishes/website/:id/all` | Get all wishes (admin) |
| PUT | `/api/wishes/:id/hide` | Hide wish |
| PUT | `/api/wishes/:id/unhide` | Unhide wish |

## Request Examples

### Register a Website
```bash
curl -X POST http://localhost:3001/api/websites \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"canvaDesignId": "design123", "name": "John & Jane Wedding"}'
```

### Add Guests
```bash
curl -X POST http://localhost:3001/api/guests \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "websiteId": "website-id-here",
    "guests": [
      {"name": "John Doe", "email": "john@email.com"},
      {"name": "Jane Smith"}
    ]
  }'
```

### Validate Guest (Public)
```bash
curl -X POST http://localhost:3001/api/guests/validate \
  -H "Content-Type: application/json" \
  -d '{"websiteId": "website-id-here", "inviteCode": "ABC123"}'
```

### Submit RSVP (Public)
```bash
curl -X POST http://localhost:3001/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{"guestId": "guest-id-here", "status": "attending"}'
```

### Submit Wish (Public)
```bash
curl -X POST http://localhost:3001/api/wishes \
  -H "Content-Type: application/json" \
  -d '{"guestId": "guest-id-here", "message": "Congratulations!"}'
```

## Production Deployment (VPS)

### 1. Server Setup

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install nginx
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### 2. Deploy with Docker

```bash
# Clone repository
git clone <your-repo> /opt/rsvp-app
cd /opt/rsvp-app

# Create .env file
cp backend/.env.example backend/.env
# Edit .env with production values

# Build and run
docker-compose up -d --build
```

### 3. Configure Nginx

Copy `nginx.conf.example` to `/etc/nginx/sites-available/rsvp`:

```bash
sudo cp backend/nginx.conf.example /etc/nginx/sites-available/rsvp
sudo ln -s /etc/nginx/sites-available/rsvp /etc/nginx/sites-enabled/
# Edit the file to set your domain
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL with Let's Encrypt

```bash
sudo certbot --nginx -d your-domain.com
```

## Rate Limiting

- **General API:** 100 requests per 15 minutes
- **RSVP submission:** 5 attempts per minute
- **Wish submission:** 3 wishes per hour

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 3001 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/rsvp-wishes |
| `API_KEY` | Admin API key | (required) |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:8080 |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm test` | Run tests |

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
docker ps | grep mongo

# View logs
docker logs mongodb
```

### API Key Issues

- Ensure `x-api-key` header is set correctly
- Check that API_KEY in .env matches what you're sending

### CORS Issues

- Ensure CORS_ORIGIN matches your frontend URL
- Include protocol (http:// or https://)
