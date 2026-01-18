# Feature Specification: Guest Management Enhancement

**Version:** 1.3  
**Date:** January 18, 2026  
**Status:** Implemented

---

## Overview

This feature enhances guest management capabilities with bulk operations, labeling/filtering, invitation status tracking, and inline editing. These improvements streamline the workflow for managing large guest lists and tracking invitation progress.

---

## Features Summary

| # | Feature | Description |
|---|---------|-------------|
| 1 | Bulk Delete | Delete multiple guests, RSVPs, or wishes at once |
| 2 | Guest Labels | Add customizable labels to guests with filter support |
| 3 | Invitation Status | Track invitation progress (Created → Invitation Sent) |
| 4 | Edit Guest | Edit all guest fields except unique code |

---

## 1. Bulk Delete Operations

### 1.1 Overview

Allow users to delete multiple selected items (guests, RSVPs, wishes) in a single operation.

### 1.2 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `DELETE` | `/api/guests/:websiteId/bulk` | Bulk delete guests |
| `DELETE` | `/api/rsvp/:websiteId/bulk` | Bulk delete RSVPs |
| `DELETE` | `/api/wishes/:websiteId/bulk` | Bulk delete wishes |

### 1.3 Request Body

```typescript
// DELETE /api/guests/:websiteId/bulk
{
    ids: string[]  // Array of guest IDs to delete
}
```

### 1.4 Response

```typescript
{
    success: true,
    deleted: number  // Count of deleted items
}
```

### 1.5 Validation Schema

```typescript
const bulkDeleteSchema = z.object({
    ids: z.array(z.string()).min(1, 'At least one ID required').max(500),
});
```

### 1.6 Service Implementation

```typescript
// guestService.ts
async bulkDelete(websiteId: string, ids: string[]): Promise<number> {
    const result = await Guest.deleteMany({
        _id: { $in: ids },
        websiteId: new Types.ObjectId(websiteId),
    });
    return result.deletedCount;
}

// rsvpService.ts
async bulkDelete(websiteId: string, ids: string[]): Promise<number> {
    const result = await RSVP.deleteMany({
        _id: { $in: ids },
        websiteId: new Types.ObjectId(websiteId),
    });
    return result.deletedCount;
}

// wishService.ts
async bulkDelete(websiteId: string, ids: string[]): Promise<number> {
    const result = await Wish.deleteMany({
        _id: { $in: ids },
        websiteId: new Types.ObjectId(websiteId),
    });
    return result.deletedCount;
}
```

### 1.7 Frontend UI

Add "Delete Selected" button when items are selected:

```
┌─────────────────────────────────────────────────────────────┐
│ Guests (150)                                                │
│ ┌───────────────────┐  ┌────────────────┐  ┌─────────────┐ │
│ │ Select Template ▼ │  │ 🗑️ Delete (5)  │  │ + Add Guest │ │
│ └───────────────────┘  └────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

- Button appears when at least 1 item is selected
- Shows count of selected items
- Confirmation dialog before deletion
- Toast notification after successful deletion

---

## 2. Guest Labels

### 2.1 Overview

Allow users to categorize guests with custom labels (e.g., "Family", "Friends", "Work", "VIP") and filter the guest list by label.

### 2.2 Data Model Update

Add `label` field to Guest model:

```typescript
// backend/src/models/Guest.ts
interface IGuest extends Document {
    // ... existing fields
    label?: string;  // Custom label for categorization
}

const guestSchema = new Schema<IGuest>({
    // ... existing fields
    label: {
        type: String,
        maxlength: 50,
    },
});
```

### 2.3 API Updates

**Get Guests with Label Filter:**
```typescript
// GET /api/guests/website/:websiteId?label=Family
{
    guests: Guest[],
    total: number,
    pages: number,
    labels: string[]  // All unique labels for this website
}
```

**Get All Labels:**
```typescript
// GET /api/guests/:websiteId/labels
{
    labels: string[]  // Distinct labels used in this website
}
```

### 2.4 Service Implementation

```typescript
// guestService.ts
async findByWebsite(
    websiteId: string, 
    page: number = 1, 
    limit: number = 20,
    label?: string
): Promise<{
    guests: IGuest[];
    total: number;
    pages: number;
    labels: string[];
}> {
    const query: any = { websiteId: new Types.ObjectId(websiteId) };
    if (label) {
        query.label = label;
    }

    const skip = (page - 1) * limit;
    const [guests, total, labels] = await Promise.all([
        Guest.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Guest.countDocuments(query),
        Guest.distinct('label', { websiteId: new Types.ObjectId(websiteId) }),
    ]);

    return {
        guests,
        total,
        pages: Math.ceil(total / limit),
        labels: labels.filter(Boolean),  // Remove null/undefined
    };
}

async getLabels(websiteId: string): Promise<string[]> {
    const labels = await Guest.distinct('label', { 
        websiteId: new Types.ObjectId(websiteId) 
    });
    return labels.filter(Boolean);
}
```

### 2.5 Validation Schema Update

```typescript
// validators/schemas.ts
export const createGuestSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().max(20).optional(),
    greeting: z.string().max(16).optional(),
    maxAttendees: z.number().int().min(1).max(20).default(1),
    personalLink: z.string().optional(),
    label: z.string().max(50).optional(),  // NEW
});
```

### 2.6 Frontend UI

**Filter Dropdown:**
```
┌─────────────────────────────────────────────────────────────┐
│ Guests (150)                                                │
│ ┌─────────────────┐  ┌───────────────────┐  ┌─────────────┐│
│ │ Filter: All ▼   │  │ Select Template ▼ │  │ + Add Guest ││
│ └─────────────────┘  └───────────────────┘  └─────────────┘│
│                                                             │
│ Filter options:                                             │
│ ┌─────────────────┐                                        │
│ │ All             │                                        │
│ │ Family          │                                        │
│ │ Friends         │                                        │
│ │ Work            │                                        │
│ │ VIP             │                                        │
│ └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

**Guest Table Column:**
| Column | Content |
|--------|---------|
| ☐ | Checkbox |
| Name | `guest.name` |
| Phone | `guest.phone` |
| Label | Badge with `guest.label` |
| Greeting | `guest.greeting` |
| Status | Invitation status |
| Type | Invited/Walk-in |
| Code | `guest.uniqueCode` |
| Max | `guest.maxAttendees` |
| Actions | Edit, Share, Copy, Delete |

### 2.7 Bulk Import Update

**New format:** `name, email, phone, greeting, maxAttendees, personalLink, label`

```
John Doe, john@example.com, +628123456789, Bapak, 3, , Family
Jane Smith, jane@example.com, +628123456790, Ibu, 2, , Friends
Bob Wilson, , +628123456791, Bapak, 1, , Work
```

---

## 3. Invitation Status Tracking

### 3.1 Overview

Track whether a guest invitation has been sent. Status changes from "Created" to "Invitation Sent" when the broadcast message is copied.

### 3.2 Data Model Update

```typescript
// backend/src/models/Guest.ts
export type InvitationStatus = 'created' | 'invitation_sent';

interface IGuest extends Document {
    // ... existing fields
    invitationStatus: InvitationStatus;
    invitationSentAt?: Date;
}

const guestSchema = new Schema<IGuest>({
    // ... existing fields
    invitationStatus: {
        type: String,
        enum: ['created', 'invitation_sent'],
        default: 'created',
    },
    invitationSentAt: {
        type: Date,
    },
});
```

### 3.3 API Endpoint

```typescript
// PUT /api/guests/:id/mark-invitation-sent
// Response: Updated guest object
```

### 3.4 Service Implementation

```typescript
// guestService.ts
async markInvitationSent(id: string): Promise<IGuest | null> {
    return Guest.findByIdAndUpdate(
        id,
        { 
            invitationStatus: 'invitation_sent',
            invitationSentAt: new Date(),
        },
        { new: true }
    );
}
```

### 3.5 Frontend Integration

When "Copy Broadcast" button is clicked:
1. Copy the broadcast message to clipboard
2. Call API to mark invitation as sent
3. Update local state to reflect the change
4. Show toast notification

```typescript
const handleCopyBroadcast = async (guest: Guest) => {
    // ... copy to clipboard logic
    
    // Mark as invitation sent
    try {
        await guestApi.markInvitationSent(guest._id);
        // Update local guest state
        setGuests(prev => prev.map(g => 
            g._id === guest._id 
                ? { ...g, invitationStatus: 'invitation_sent', invitationSentAt: new Date().toISOString() }
                : g
        ));
    } catch (err) {
        console.error('Failed to update invitation status');
    }
};
```

### 3.6 Status Display

| Status | Badge Color | Text |
|--------|-------------|------|
| `created` | Gray | Created |
| `invitation_sent` | Green | Sent |

**Optional:** Show timestamp on hover for "Sent" status.

---

## 4. Edit Guest

### 4.1 Overview

Allow editing all guest fields except the unique code, which is auto-generated and immutable.

### 4.2 Editable Fields

| Field | Editable | Notes |
|-------|----------|-------|
| Name | ✅ | Required |
| Email | ✅ | Optional |
| Phone | ✅ | Optional |
| Greeting | ✅ | Max 16 chars |
| Max Attendees | ✅ | 1-20 |
| Personal Link | ✅ | Optional |
| Label | ✅ | Max 50 chars |
| Code | ❌ | Auto-generated, immutable |
| Type | ❌ | Based on creation method |

### 4.3 API (Already Exists)

```typescript
// PUT /api/guests/:id
{
    name?: string,
    email?: string,
    phone?: string,
    greeting?: string,
    maxAttendees?: number,
    personalLink?: string,
    label?: string
}
```

### 4.4 Frontend - Edit Modal

```
┌─────────────────────────────────────────────────────┐
│ Edit Guest                                     [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Code: ABC123 (cannot be changed)                    │
│                                                     │
│ Name *                                              │
│ ┌─────────────────────────────────────────────────┐│
│ │ John Doe                                        ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Email                                               │
│ ┌─────────────────────────────────────────────────┐│
│ │ john@example.com                                ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Phone                                               │
│ ┌─────────────────────────────────────────────────┐│
│ │ +628123456789                                   ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Greeting (max 16 chars)                             │
│ ┌─────────────────────────────────────────────────┐│
│ │ Bapak                                           ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Label                                               │
│ ┌─────────────────────────────────────────────────┐│
│ │ Family                                          ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Max Attendees                                       │
│ ┌─────────────────────────────────────────────────┐│
│ │ 3                                               ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Personal Link (optional)                            │
│ ┌─────────────────────────────────────────────────┐│
│ │ https://custom-link.com                         ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│              [Cancel]  [Save Changes]               │
└─────────────────────────────────────────────────────┘
```

### 4.5 Guest Table Actions Update

| Button | Icon | Action |
|--------|------|--------|
| Edit | ✏️ | Open edit modal |
| Share | 📤 | Copy RSVP link |
| Copy Broadcast | 📋 | Copy message + mark sent |
| Delete | 🗑️ | Delete guest |

---

## 5. Implementation Checklist

### Backend

- [x] Add `label` field to Guest model
- [x] Add `invitationStatus` field to Guest model
- [x] Add `invitationSentAt` field to Guest model
- [x] Update guest validation schema with new fields
- [x] Create bulk delete endpoint for guests
- [x] Create bulk delete endpoint for RSVPs
- [x] Create bulk delete endpoint for wishes
- [x] Create `/guests/:id/mark-invitation-sent` endpoint
- [x] Create `/guests/:websiteId/labels` endpoint
- [x] Update `findByWebsite` to support label filter
- [x] Update bulk import parsing for label field
- [ ] Add tests for new endpoints

### Frontend (Admin App)

- [x] Update `Guest` interface with new fields
- [x] Add bulk delete API functions
- [x] Add `markInvitationSent` API function
- [x] Add `getLabels` API function
- [x] Update `getByWebsite` to accept label filter
- [x] Add "Delete Selected" button for guests
- [ ] Add "Delete Selected" button for RSVPs (not implemented - RSVP tab uses different data structure)
- [x] Add "Delete Selected" button for wishes
- [x] Add label filter dropdown in guest list
- [x] Add label column to guest table
- [x] Add invitation status column to guest table
- [x] Create Edit Guest modal
- [x] Add Edit button to guest row actions
- [x] Update "Copy Broadcast" to mark invitation sent
- [x] Update bulk import modal for label field
- [x] Update single guest form for label field

### Testing

- [x] Test bulk delete for guests
- [x] Test bulk delete for RSVPs
- [x] Test bulk delete for wishes
- [x] Test label filtering
- [x] Test invitation status update
- [x] Test guest edit functionality

---

## 6. Migration Notes

### Database Migration

No breaking changes. New fields have defaults:
- `label`: Optional, defaults to `undefined`
- `invitationStatus`: Defaults to `'created'`
- `invitationSentAt`: Optional, defaults to `undefined`

Existing guests will have:
- `invitationStatus: 'created'` (via default)
- `label: undefined`

### API Backward Compatibility

- All new fields are optional in requests
- Existing API calls will continue to work
- New endpoints are additive

---

## 7. File Changes Summary

### Backend Files to Modify

| File | Changes |
|------|---------|
| `src/models/Guest.ts` | Add `label`, `invitationStatus`, `invitationSentAt` fields |
| `src/services/guestService.ts` | Add `bulkDelete`, `markInvitationSent`, `getLabels`, update `findByWebsite` |
| `src/services/rsvpService.ts` | Add `bulkDelete` |
| `src/services/wishService.ts` | Add `bulkDelete` |
| `src/routes/guests.ts` | Add bulk delete, mark invitation sent, get labels endpoints |
| `src/routes/rsvp.ts` | Add bulk delete endpoint |
| `src/routes/wishes.ts` | Add bulk delete endpoint |
| `src/validators/schemas.ts` | Add `label` to guest schemas, add `bulkDeleteSchema` |

### Frontend Files to Modify

| File | Changes |
|------|---------|
| `src/api.ts` | Add new interfaces and API functions |
| `src/pages/Dashboard.tsx` | Add Edit modal, bulk delete UI, label filter, status column |

---

## Appendix: Sample Data

### Sample Labels

Common label suggestions:
- Family
- Friends
- Work / Colleagues
- VIP
- Neighbors
- School
- Church / Community

### Sample Bulk Import with Labels

```csv
Ahmad Fauzi, ahmad@email.com, +6281234567890, Bapak, 3, , Family
Siti Nurhaliza, siti@email.com, +6281234567891, Ibu, 2, , Family
Budi Santoso, , +6281234567892, Bapak, 4, , Work
Dewi Lestari, dewi@email.com, , Kakak, 2, , Friends
Eko Prasetyo, , , Mas, 1, , VIP
```

### Invitation Status Flow

```
┌──────────────┐     Copy Broadcast      ┌─────────────────┐
│   Created    │ ───────────────────────▶│ Invitation Sent │
│  (Default)   │                         │  (+ timestamp)  │
└──────────────┘                         └─────────────────┘
```
