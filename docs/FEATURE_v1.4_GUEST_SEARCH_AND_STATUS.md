# Feature Specification: Guest Search & Status/Type Update

**Version:** 1.4  
**Date:** January 19, 2026  
**Status:** Implemented

---

## Overview

This feature adds fast guest search by name and allows admins to update guest invitation status and guest type directly from the dashboard. These enhancements improve navigation for large guest lists and make list maintenance faster.

---

## Features Summary

| # | Feature | Description |
|---|---------|-------------|
| 1 | Guest Search | Search guests by name (partial match) |
| 2 | Update Status & Type | Edit invitation status and guest type from admin UI |

---

## 1. Guest Search by Name

### 1.1 Overview
Allow admins to filter guests by name using a search input. The search should match partial names (case-insensitive) and update the guest list in real time or on submit.

### 1.2 API Updates

**Endpoint:**
```
GET /api/guests/website/:websiteId?search=John
```

**Query Parameters:**
- `search` (string, optional): Case-insensitive substring match on `name`.

**Response:**
```typescript
{
    guests: Guest[],
    total: number,
    pages: number,
    labels: string[]
}
```

### 1.3 Service Implementation
```typescript
// guestService.ts
async findByWebsite(
  websiteId: string,
  page = 1,
  limit = 20,
  label?: string,
  search?: string
) {
  const query: any = { websiteId: new Types.ObjectId(websiteId) };
  if (label) query.label = label;
  if (search) query.name = { $regex: search, $options: 'i' };

  // ... existing pagination and labels
}
```

### 1.4 Frontend UI
Add a search input in the Guests header:

```
┌─────────────────────────────────────────────────────────────┐
│ Guests (150)                                                │
│ [Search by name...]  [Filter: All ▼]  [Select Template ▼]  │
└─────────────────────────────────────────────────────────────┘
```

Behavior:
- Debounce input (e.g., 300–500ms) before fetching.
- Clearing search returns full guest list.

---

## 2. Update Guest Status and Type

### 2.1 Overview
Allow admins to update:
- **Invitation Status**: `created` → `invitation_sent`
- **Guest Type**: `invited` ↔ `walk-in`

### 2.2 Data Model Updates
Already present for status:
- `invitationStatus: 'created' | 'invitation_sent'`
- `invitationSentAt?: Date`

Add an editable field for type:
- `isManual` (boolean) toggled by admin

### 2.3 API Updates

**Update Guest (existing):**
```
PUT /api/guests/:id
```

**Body:**
```typescript
{
  invitationStatus?: 'created' | 'invitation_sent',
  invitationSentAt?: string | null,
  isManual?: boolean
}
```

**Rules:**
- If `invitationStatus` is set to `invitation_sent`, set `invitationSentAt = new Date()`.
- If `invitationStatus` is set to `created`, clear `invitationSentAt`.
- `isManual = true` means **Walk-in**, `false` means **Invited**.

### 2.4 Service Implementation
```typescript
// guestService.ts
async update(id: string, data: UpdateGuestInput): Promise<IGuest | null> {
  if (data.invitationStatus === 'invitation_sent') {
    data.invitationSentAt = new Date();
  }
  if (data.invitationStatus === 'created') {
    data.invitationSentAt = undefined;
  }
  return Guest.findByIdAndUpdate(id, data, { new: true });
}
```

### 2.5 Frontend UI
Options:
- Add two inline dropdowns in guest row (Status, Type)
- Or add to Edit Guest modal

**Suggested in-table controls:**

| Column | UI |
|--------|----|
| Status | Dropdown: Created / Sent |
| Type | Dropdown: Invited / Walk-in |

### 2.6 UX Notes
- Show a spinner when updating.
- Show success toast on update.
- Prevent switching to Walk-in if guest already has RSVPs (optional, if needed).

---

## 3. Validation Updates

### 3.1 Guest Update Schema
```typescript
export const updateGuestSchema = z.object({
  // existing fields...
  invitationStatus: z.enum(['created', 'invitation_sent']).optional(),
  invitationSentAt: z.string().optional(),
  isManual: z.boolean().optional(),
});
```

---

## 4. Implementation Checklist

### Backend
- [x] Add `search` support in `findByWebsite`
- [x] Update guest route to accept `search` query param
- [x] Update updateGuest schema for status and type
- [x] Update guest service update logic for status timestamps

### Frontend
- [x] Add search input in Guests tab
- [x] Add debounce and pass `search` query to API
- [x] Add status/type fields to edit modal
- [x] Update API types and update payload

### Testing
- [ ] Search returns partial matches
- [ ] Status updates set/clear timestamps properly
- [ ] Type toggle updates `isManual`

---

## 5. Migration Notes

No data migration required. Existing guests:
- Keep current `invitationStatus` and `invitationSentAt`
- `isManual` already exists and is preserved
