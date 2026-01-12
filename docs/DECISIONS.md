# RSVP and Wishes - Pending Decisions

This document contains architectural and design decisions that need your input before proceeding.

---

## Decision 1: Database Choice

**Question:** Which database should we use for the backend?

### Option A: PostgreSQL (Recommended)
**Pros:**
- Relational data fits RSVP/guest relationships well
- Strong data integrity with foreign keys
- Great for structured queries (who responded, who didn't)
- Free tier available on many providers (Supabase, Railway, Neon)

**Cons:**
- Slightly more setup complexity
- Schema migrations needed for changes

### Option B: MongoDB
**Pros:**
- Flexible schema
- Easy to get started
- Good free tier (MongoDB Atlas)

**Cons:**
- Less ideal for relational data
- Manual referential integrity

### Option C: SQLite (Simplest)
**Pros:**
- No separate database server needed
- File-based, easy backup
- Zero configuration

**Cons:**
- Not suitable for high traffic
- No concurrent writes

**Your Choice:** [ ] PostgreSQL / [X] MongoDB / [ ] SQLite

---

## Decision 2: Guest Validation Method

**Question:** How should guests prove their eligibility to RSVP?

### Option A: Name Matching
- Guest enters their name
- System matches against pre-registered guest list
- Simple but could have name spelling issues

### Option B: Unique Invite Code
- Each guest gets a unique code (e.g., "ABC123")
- More secure, no spelling issues
- Requires distributing codes to guests

### Option C: Name + Phone/Email
- Guest enters name and contact info
- Must match pre-registered data
- More verification but more friction

**Your Choice:** [ ] Name Matching / [X] Invite Code / [ ] Name + Contact
Preferences: Guest will be distributed link with unique codes and their name, their name will be just display purposes and for make the invitation to be more personal 

---

## Decision 3: Backend Hosting

**Question:** Where should the backend be hosted?

### Option A: Vercel (Serverless)
**Pros:**
- Easy deployment from Git
- Free tier generous
- Good for Node.js

**Cons:**
- Serverless limitations (cold starts)
- Database connection pooling needed

### Option B: Railway
**Pros:**
- Easy deployment
- Database included
- Always-on servers

**Cons:**
- Free tier limited ($5 credit/month)

### Option C: Self-hosted (VPS)
**Pros:**
- Full control
- Cheapest long-term
- No vendor lock-in

**Cons:**
- More setup/maintenance
- Security responsibility

### Option D: Supabase (Backend-as-a-Service)
**Pros:**
- Database + API auto-generated
- Authentication included
- Very generous free tier

**Cons:**
- Vendor lock-in
- Less flexibility for custom logic

**Your Choice:** [ ] Vercel / [ ] Railway / [X] VPS / [ ] Supabase
The backend host will be on VPS self deployed, prefereably using nginx and dockerization

---

## Decision 4: Wishes Display Privacy

**Question:** Should wishes be publicly visible or require approval?

### Option A: All Public
- All submitted wishes shown immediately
- Simple implementation
- Risk of inappropriate content

### Option B: Moderation Required
- Host must approve wishes before display
- More work for host
- Safer content

### Option C: Public with Report Option
- Wishes shown immediately
- Host can hide/remove inappropriate ones
- Balance of simplicity and safety

**Your Choice:** [ ] All Public / [ ] Moderation Required / [X] Public with Report

---

## Decision 5: RSVP Response Options

**Question:** What response options should be available?

### Option A: Simple (Yes/No)
- Attending: Yes / No
- Simple and clear

### Option B: Standard (Yes/No/Maybe)
- Attending: Yes / No / Maybe
- More flexibility for uncertain guests

### Option C: Detailed
- Attending: Yes / No / Maybe
- Number of guests attending
- Dietary requirements
- Plus one info

**Your Choice:** [ ] Simple / [X] Standard / [ ] Detailed

---

## Decision 6: Multi-language Support

**Question:** Should the app support multiple languages?

### Option A: English Only (for now)
- Faster development
- Add languages later

### Option B: English + Indonesian
- Common use case for Indonesian events
- More initial work

### Option C: Full i18n from Start
- Use react-intl throughout
- Any language can be added
- Most future-proof but most work

**Your Choice:** [X] English Only / [ ] English + Indonesian / [ ] Full i18n

---

## Decision Summary

All decisions have been made and implementation is in progress.

| Decision | Your Choice |
|----------|-------------|
| Database | **MongoDB** |
| Guest Validation | **Invite Code** (with name for display) |
| Backend Hosting | **VPS** (nginx + Docker) |
| Wishes Privacy | **Public with Report** |
| RSVP Options | **Standard** (Yes/No/Maybe) |
| Multi-language | **English Only** |

---

**Last Updated:** 2026-01-12
**Status:** ✅ All decisions finalized
