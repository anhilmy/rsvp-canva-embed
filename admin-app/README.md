# RSVP Admin Dashboard

Standalone admin web application for managing RSVP and Wishes events.

## Features

- 📊 **Dashboard**: Overview of RSVP stats and wishes
- 👥 **Guest Management**: Add, view, and manage guest list with auto-generated invite codes
- ✉️ **RSVP Tracking**: View all responses with status and messages
- 💝 **Wish Moderation**: View, hide, or delete guest wishes
- ⚙️ **Settings**: Access event credentials for sharing

## Tech Stack

- React 18 with TypeScript
- Vite for fast development
- TailwindCSS for styling
- React Query for data fetching
- React Router for navigation

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on port 3001

### Installation

```bash
cd admin-app
npm install
```

### Development

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Build

```bash
npm run build
```

## Usage

### First Time Setup

1. Open the admin app
2. Click "New Event" tab
3. Enter your event name
4. Save the generated Website ID and API Key

### Subsequent Login

1. Enter your Website ID and API Key
2. Click Login

### Managing Guests

1. Go to Guests page
2. Click "Add Guests"
3. Enter names (one per line)
4. Share the invite codes with your guests

### Sharing with Guests

Guests need:
1. The Website ID (Event Code)
2. Their unique Invite Code

They can then access the Canva RSVP form and submit their response.
