# RSVP and Wishes App - Pending Decisions

This document contains design decisions that need your input before proceeding.

---

## 1. Guest Code Format
**Question**: What format should the unique guest codes use?

**Options**:
- **A) Short alphanumeric** (e.g., `ABC123`) - 6 characters, easy to type
- **B) UUID-style** (e.g., `a1b2c3d4-e5f6`) - More unique, harder to guess
- **C) Custom format** (e.g., `WEDDING2024-001`) - Readable but longer

**Recommendation**: Option A - Short codes are easier for guests to use

**Your Choice**: Option A

---

## 2. Wish Moderation
**Question**: Should wishes be moderated before being displayed publicly?

**Options**:
- **A) No moderation** - All wishes appear immediately
- **B) Auto-approve with admin override** - Show all, admin can hide inappropriate
- **C) Manual approval required** - Admin must approve before display

**Recommendation**: Option B - Balances user experience with control

**Your Choice**: Option B

---

## 3. RSVP Attendance Options
**Question**: What attendance options should be available?

**Options**:
- **A) Simple** - "Will Attend" / "Cannot Attend"
- **B) Detailed** - "Will Attend" / "Cannot Attend" / "Maybe"
- **C) With plus-ones** - Include number of additional guests

**Recommendation**: Option C - Most flexible for events

**Your Choice**: Option C

---

## 4. Guest Information Required
**Question**: What information should be collected from guests?

**Required fields proposed**:
- [X] Full Name (pre-filled from invite)
- [X] Attendance status
- [X] Number of attendees (if attending)

**Optional fields proposed**:
- [ ] Email address
- [ ] Phone number
- [ ] Dietary restrictions
- [X] Message/Wish

**Your additions/removals**: _________________

---

## 5. URL Structure for Guest Links
**Question**: How should guest links be structured?

**Options**:
- **A) Query params**: `https://yoursite.canva.site/?code=ABC123&name=John`
- **B) Path params**: `https://yoursite.canva.site/rsvp/ABC123`
- **C) Hash params**: `https://yoursite.canva.site/#code=ABC123`

**Note**: Canva publish web may have limitations on URL handling

**Recommendation**: Option A - Most compatible with web standards

**Your Choice**: Option A

---

## 6. Rate Limiting Configuration
**Question**: What rate limits should be applied?

**Proposed limits**:
- RSVP submission: 1 per guest (enforced by unique code)
- Wish submission: 3 per guest per day
- API requests: 100 per IP per minute

**Your adjustments**: 100 Per IP per minute

---

## 7. Data Retention
**Question**: How long should data be retained?

**Options**:
- **A) Indefinitely** - Keep all data forever
- **B) 1 year** - Auto-delete after event
- **C) Manual** - Admin manually deletes

**Recommendation**: Option C - Give admin control

**Your Choice**: Option C

---

## 8. Admin Authentication
**Question**: What authentication method for admin dashboard?

**Options**:
- **A) Simple password** - Single shared password
- **B) Username/password** - Individual accounts
- **C) OAuth** - Google/GitHub login

**Recommendation**: Option A for MVP (you mentioned basic security is fine)

**Your Choice**: Option A

---

## 9. Wish Display Format
**Question**: How should wishes be displayed on the public page?

**Options**:
- **A) Simple list** - Name and message only
- **B) Cards** - Styled cards with timestamps
- **C) Wall/Grid** - Pinterest-style layout

**Recommendation**: Option B - Clean and modern

**Your Choice**: Option B

---

## 10. Backend Database Choice
**Question**: Confirm MongoDB as the database?

**Options**:
- **A) MongoDB** - Document-based, flexible schema
- **B) PostgreSQL** - Relational, structured data
- **C) SQLite** - Simple, file-based

**Current assumption**: MongoDB (as specified in requirements)

**Confirmed**: [X] Yes / [ ] Change to: _________________

---

## Quick Reference - Default Assumptions

If you don't respond to any decision, I will proceed with:

| Decision | Default |
|----------|---------|
| Guest Code Format | Short alphanumeric (6 chars) |
| Wish Moderation | Auto-approve with admin override |
| RSVP Options | With plus-ones |
| URL Structure | Query params |
| Rate Limiting | As proposed |
| Data Retention | Manual admin control |
| Admin Auth | Simple password |
| Wish Display | Cards |
| Database | MongoDB |

---

## How to Use This Document

1. Review each decision above
2. Fill in "Your Choice" for any you want to change
3. Let me know which decisions you've made
4. I'll proceed with defaults for anything not specified
