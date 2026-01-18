# Feature Specification: Broadcast Template System

**Version:** 1.2  
**Date:** January 18, 2026  
**Status:** Planning

---

## Overview

This feature introduces a broadcast template system that allows users to create reusable message templates with dynamic variables. The templates can be used to generate personalized messages for guests, which can then be copied or exported for distribution via WhatsApp, SMS, or other messaging platforms.

---

## Features Summary

| # | Feature | Description |
|---|---------|-------------|
| 1 | Broadcast Template CRUD | Create, read, update, delete message templates with variables |
| 2 | Guest Model Extension | Add `greeting` and `personalLink` fields to Guest |
| 3 | Bulk Import Enhancement | Support new fields in bulk import |
| 4 | Guest List Enhancement | Show phone, add copy broadcast button |
| 5 | Template Selector | Select active template in guest list header |
| 6 | Export to Excel | Export selected guests with personalized broadcast text |

---

## 1. Broadcast Template System

### 1.1 Template Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `[to]` | Guest name | `guest.name` |
| `[greeting]` | Honorific title (e.g., Bapak, Ibu, Kakak) | `guest.greeting` |
| `[link]` | Personalized RSVP link | `guest.personalLink` or auto-generated |

### 1.2 Data Model

```typescript
// backend/src/models/BroadcastTemplate.ts

interface IBroadcastTemplate extends Document {
    websiteId: Types.ObjectId;
    name: string;           // Template name (e.g., "Wedding Invitation", "Reminder")
    body: string;           // Template body with variables
    isActive: boolean;      // Soft delete / active status
    createdAt: Date;
    updatedAt: Date;
}
```

**Example Template:**
```
Name: "Wedding Invitation"
Body:
---
Kepada Yth. [greeting] [to],

Dengan segala kerendahan hati, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan kami.

Silakan konfirmasi kehadiran Anda melalui link berikut:
[link]

Terima kasih atas perhatiannya.

Hormat kami,
Rosyi & Hilmy
---
```

### 1.3 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/broadcast-templates/:websiteId` | List all templates for website |
| `GET` | `/api/broadcast-templates/:websiteId/:id` | Get single template |
| `POST` | `/api/broadcast-templates/:websiteId` | Create new template |
| `PUT` | `/api/broadcast-templates/:id` | Update template |
| `DELETE` | `/api/broadcast-templates/:id` | Delete template (soft delete) |

### 1.4 Validation Schema

```typescript
const broadcastTemplateSchema = z.object({
    name: z.string().min(1).max(100),
    body: z.string().min(1).max(5000),
});
```

---

## 2. Guest Model Extension

### 2.1 New Fields

Add to `backend/src/models/Guest.ts`:

```typescript
interface IGuest extends Document {
    // ... existing fields
    greeting?: string;      // Honorific title (Bapak, Ibu, Kakak, etc.)
    personalLink?: string;  // Custom RSVP link (overrides auto-generated)
}
```

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `greeting` | string | Honorific title | `""` |
| `personalLink` | string | Custom link override | `null` (use auto-generated) |

### 2.2 Link Generation Logic

```typescript
function getGuestLink(guest: IGuest, baseUrl: string, publishId: string): string {
    if (guest.personalLink) {
        return guest.personalLink;
    }
    // Auto-generate: {baseUrl}/f/simple/{publishId}?code={uniqueCode}
    return `${baseUrl}/f/simple/${publishId}?code=${guest.uniqueCode}`;
}
```

### 2.3 Update Guest API

**Single Guest Create/Update:**
```typescript
// POST /api/guests/:websiteId
// PUT /api/guests/:id
{
    name: string,
    email?: string,
    phone?: string,
    maxAttendees?: number,
    greeting?: string,       // NEW
    personalLink?: string    // NEW
}
```

---

## 3. Bulk Import Enhancement

### 3.1 New Bulk Format

**Current format:** `name, email`  
**New format:** `name, email, phone, greeting, maxAttendees, personalLink`

All fields after `name` are optional. Order matters.

### 3.2 Examples

```
# Minimal (name only)
John Doe

# With email
John Doe, john@example.com

# With email and phone
John Doe, john@example.com, +628123456789

# With greeting
John Doe, john@example.com, +628123456789, Bapak

# With max attendees
John Doe, john@example.com, +628123456789, Bapak, 3

# With custom link
John Doe, john@example.com, +628123456789, Bapak, 3, https://custom-link.com/john
```

### 3.3 Bulk Import Parsing

```typescript
function parseBulkLine(line: string): GuestInput {
    const parts = line.split(',').map(p => p.trim());
    return {
        name: parts[0],
        email: parts[1] || undefined,
        phone: parts[2] || undefined,
        greeting: parts[3] || undefined,
        maxAttendees: parts[4] ? parseInt(parts[4]) : 1,
        personalLink: parts[5] || undefined,
    };
}
```

### 3.4 Bulk Import API Update

```typescript
// POST /api/guests/:websiteId/bulk
{
    guests: [
        {
            name: string,
            email?: string,
            phone?: string,
            greeting?: string,
            maxAttendees?: number,
            personalLink?: string
        }
    ]
}
```

---

## 4. Admin Dashboard - Guest List Enhancement

### 4.1 Updated Guest Table Columns

| Column | Content | Width |
|--------|---------|-------|
| ☐ | Checkbox for selection | 40px |
| Name | `guest.name` | auto |
| Phone | `guest.phone` or `-` | 120px |
| Greeting | `guest.greeting` or `-` | 100px |
| Type | Badge (Invited/Walk-in) | 80px |
| Code | `guest.uniqueCode` | 80px |
| Max | `guest.maxAttendees` | 60px |
| Actions | Share, Copy Broadcast, Delete | 150px |

### 4.2 New Actions

| Button | Icon | Action |
|--------|------|--------|
| Share | 📤 | Copy RSVP link to clipboard |
| Copy Broadcast | 📋 | Copy filled broadcast template |
| Delete | 🗑️ | Delete guest |

### 4.3 Template Selector (Header)

Add template dropdown at top of guest list:

```
┌─────────────────────────────────────────────────────────┐
│ Guests                                                   │
│ ┌───────────────────────────────┐  ┌─────────────────┐  │
│ │ 📄 Select Template: [▼ Dropdown] │  │ + Add Guest   │  │
│ └───────────────────────────────┘  └─────────────────┘  │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐│
│ │ ☐ │ Name    │ Phone │ Greeting │ Type │ Code │ ... ││
│ ├───┼─────────┼───────┼──────────┼──────┼──────┼─────┤│
│ │ ☐ │ John    │ +62.. │ Bapak    │ ✓    │ ABC12│ ... ││
│ │ ☑ │ Jane    │ +62.. │ Ibu      │ ✓    │ DEF34│ ... ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ ┌────────────────────────┐                               │
│ │ 📥 Export Selected (1) │                               │
│ └────────────────────────┘                               │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Copy Broadcast Functionality

### 5.1 Template Processing

```typescript
function fillTemplate(template: string, guest: IGuest, baseUrl: string, publishId: string): string {
    const link = getGuestLink(guest, baseUrl, publishId);
    
    return template
        .replace(/\[to\]/g, guest.name)
        .replace(/\[greeting\]/g, guest.greeting || '')
        .replace(/\[link\]/g, link);
}
```

### 5.2 Copy Broadcast Flow

1. User selects template from dropdown (required)
2. User clicks "Copy Broadcast" button on guest row
3. System fills template with guest data
4. Filled text is copied to clipboard
5. Toast notification: "Broadcast message copied!"

### 5.3 No Template Selected State

If no template is selected:
- "Copy Broadcast" button is disabled
- Tooltip: "Please select a template first"

---

## 6. Export to Excel

### 6.1 Export Button

- Location: Below guest table
- Label: "📥 Export Selected (N)" where N = selected count
- Disabled when no guests selected

### 6.2 Export API

```typescript
// POST /api/guests/:websiteId/export
{
    guestIds: string[],
    templateId?: string  // Optional: include filled broadcast column
}

// Response: Excel file download
```

### 6.3 Excel Columns

| Column | Source |
|--------|--------|
| Name | `guest.name` |
| Email | `guest.email` |
| Phone | `guest.phone` |
| Greeting | `guest.greeting` |
| Code | `guest.uniqueCode` |
| Max Attendees | `guest.maxAttendees` |
| Type | "Invited" / "Walk-in" |
| RSVP Link | Auto-generated or custom |
| Broadcast Message | Filled template (if templateId provided) |

### 6.4 Excel Generation

Use `exceljs` package:

```typescript
import ExcelJS from 'exceljs';

async function generateGuestExport(
    guests: IGuest[],
    template?: IBroadcastTemplate,
    baseUrl: string,
    publishId: string
): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Guests');
    
    // Add headers
    sheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Greeting', key: 'greeting', width: 12 },
        { header: 'Code', key: 'code', width: 10 },
        { header: 'Max Attendees', key: 'maxAttendees', width: 12 },
        { header: 'Type', key: 'type', width: 10 },
        { header: 'RSVP Link', key: 'link', width: 50 },
        { header: 'Broadcast Message', key: 'broadcast', width: 80 },
    ];
    
    // Add rows
    for (const guest of guests) {
        sheet.addRow({
            name: guest.name,
            email: guest.email || '',
            phone: guest.phone || '',
            greeting: guest.greeting || '',
            code: guest.uniqueCode,
            maxAttendees: guest.maxAttendees,
            type: guest.isManual ? 'Walk-in' : 'Invited',
            link: getGuestLink(guest, baseUrl, publishId),
            broadcast: template ? fillTemplate(template.body, guest, baseUrl, publishId) : '',
        });
    }
    
    return workbook.xlsx.writeBuffer();
}
```

---

## 7. UI Components (Admin Dashboard)

### 7.1 Broadcast Template Management Tab

Add new tab "Broadcast" in admin dashboard:

```
┌────────────────────────────────────────────────────────┐
│ [Websites] [Guests] [RSVPs] [Wishes] [Broadcast]       │
└────────────────────────────────────────────────────────┘
```

**Broadcast Tab Content:**
- List of templates (cards or table)
- Create new template button
- Edit/Delete actions per template
- Preview with sample data

### 7.2 Template Editor Modal

```
┌─────────────────────────────────────────────────────┐
│ Create Broadcast Template                      [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Template Name *                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ Wedding Invitation                              ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Message Body *                                      │
│ ┌─────────────────────────────────────────────────┐│
│ │ Kepada Yth. [greeting] [to],                   ││
│ │                                                 ││
│ │ Kami mengundang Anda untuk hadir...            ││
│ │                                                 ││
│ │ Link RSVP: [link]                              ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Available Variables:                                │
│ [to] - Guest name                                   │
│ [greeting] - Honorific (Bapak/Ibu/etc)             │
│ [link] - RSVP link                                  │
│                                                     │
│ Preview:                                            │
│ ┌─────────────────────────────────────────────────┐│
│ │ Kepada Yth. Bapak John Doe,                    ││
│ │                                                 ││
│ │ Kami mengundang Anda untuk hadir...            ││
│ │                                                 ││
│ │ Link RSVP: https://domain.com/f/simple/xxx...  ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│              [Cancel]  [Save Template]              │
└─────────────────────────────────────────────────────┘
```

---

## 8. Implementation Checklist

### Backend

- [x] Create `BroadcastTemplate` model
- [x] Create `broadcastTemplateService.ts`
- [x] Create `broadcastTemplates.ts` routes
- [x] Update `Guest` model (add `greeting`, `personalLink`)
- [x] Update `guestService.ts` for new fields
- [x] Update guest validation schema
- [x] Update bulk import parsing (backend already supports new fields via schema)
- [x] Create export endpoint with Excel generation
- [x] Install `exceljs` package
- [x] Add tests for new endpoints

### Frontend (Admin App)

- [x] Update `Guest` interface in `api.ts`
- [x] Add `BroadcastTemplate` interface
- [x] Add broadcast API functions
- [x] Update guest table columns (add phone, greeting)
- [x] Add checkbox selection to guest rows
- [x] Add template selector dropdown
- [x] Add "Copy Broadcast" button
- [x] Add "Export Selected" button
- [x] Create Broadcast tab
- [x] Create template editor modal
- [x] Update bulk import modal with new format
- [x] Update single guest form with new fields

### Testing

- [x] Test broadcast template CRUD
- [x] Test guest creation with new fields
- [x] Test bulk import with all field variations
- [x] Test template variable replacement
- [x] Test Excel export generation
- [x] Test clipboard copy functionality

---

## 9. Migration Notes

### Database Migration

No breaking changes. New fields are optional:
- `greeting`: defaults to `""` (empty string)
- `personalLink`: defaults to `null`

Existing guests will work without modification.

### API Backward Compatibility

- All new fields are optional in requests
- Existing API calls will continue to work
- New fields only appear in responses if present

---

## 10. Dependencies

### New Backend Packages

```bash
cd backend
npm install exceljs
npm install -D @types/exceljs
```

### No New Frontend Packages Required

- File download via blob URL
- Clipboard API (native browser)

---

## 11. File Changes Summary

### Backend Files to Create

| File | Description |
|------|-------------|
| `src/models/BroadcastTemplate.ts` | Mongoose model |
| `src/services/broadcastTemplateService.ts` | Service layer |
| `src/routes/broadcastTemplates.ts` | API routes |

### Backend Files to Modify

| File | Changes |
|------|---------|
| `src/models/Guest.ts` | Add `greeting`, `personalLink` fields |
| `src/models/index.ts` | Export new model |
| `src/services/guestService.ts` | Handle new fields, add export function |
| `src/services/index.ts` | Export new service |
| `src/routes/index.ts` | Register new routes |
| `src/routes/guests.ts` | Add export endpoint |
| `src/validators/schemas.ts` | Update guest schema, add broadcast schema |

### Frontend Files to Modify

| File | Changes |
|------|---------|
| `src/api.ts` | Add interfaces and API functions |
| `src/pages/Dashboard.tsx` | Add Broadcast tab, update Guest tab |

---

## Appendix: Sample Data

### Sample Broadcast Templates

**Template 1: Formal Invitation**
```
Kepada Yth. [greeting] [to],

Dengan segala kerendahan hati, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri resepsi pernikahan kami.

Mohon konfirmasi kehadiran melalui link berikut:
[link]

Terima kasih atas doa dan restunya.

Hormat kami,
Rosyi & Hilmy
```

**Template 2: Reminder**
```
Halo [greeting] [to]! 👋

Ini reminder untuk pernikahan kami yang akan dilaksanakan besok.

Jangan lupa konfirmasi kehadiran ya:
[link]

Ditunggu kehadirannya! 🙏
```

**Template 3: Thank You**
```
[greeting] [to],

Terima kasih atas kehadiran dan doa restunya di acara pernikahan kami.

Semoga silaturahmi kita tetap terjaga.

Salam hangat,
Rosyi & Hilmy
```

### Sample Bulk Import Data

```csv
Ahmad Fauzi, ahmad@email.com, +6281234567890, Bapak, 3
Siti Nurhaliza, siti@email.com, +6281234567891, Ibu, 2
Budi Santoso, , +6281234567892, Bapak, 4
Dewi Lestari, dewi@email.com, , Kakak, 2
Eko Prasetyo, , , Mas, 1
```
