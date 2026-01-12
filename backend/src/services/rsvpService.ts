import { RSVP, IRSVP, Guest, Website } from '../models';
import { CreateRSVPInput, UpdateRSVPInput } from '../validators';
import { createError } from '../middleware';
import { guestService } from './guestService';
import { Types } from 'mongoose';

export class RSVPService {
    async create(data: CreateRSVPInput): Promise<IRSVP> {
        // Validate guest
        const validation = await guestService.validateGuest(data.guestCode, data.publishId);
        if (!validation.valid || !validation.guest) {
            throw createError(validation.message || 'Invalid guest', 400);
        }

        const guest = validation.guest;

        // Check if RSVP already exists
        const existing = await RSVP.findOne({ guestId: guest._id });
        if (existing) {
            throw createError('RSVP already submitted for this guest', 409);
        }

        // Validate attendee count
        if (data.status === 'attending' && data.attendeeCount > guest.maxAttendees) {
            throw createError(`Maximum ${guest.maxAttendees} attendees allowed`, 400);
        }

        const website = await Website.findOne({ publishId: data.publishId });
        if (!website) {
            throw createError('Website not found', 404);
        }

        const rsvp = new RSVP({
            guestId: guest._id,
            websiteId: website._id,
            status: data.status,
            attendeeCount: data.status === 'attending' ? data.attendeeCount : 0,
            dietaryRestrictions: data.dietaryRestrictions,
            notes: data.notes,
        });

        await rsvp.save();
        return rsvp;
    }

    async findByGuestCode(code: string): Promise<IRSVP | null> {
        const guest = await Guest.findOne({ uniqueCode: code.toUpperCase() });
        if (!guest) return null;
        return RSVP.findOne({ guestId: guest._id });
    }

    async findByWebsite(websiteId: string, page: number = 1, limit: number = 20): Promise<{
        rsvps: Array<{ guest: { name: string; email?: string }; status: string; attendeeCount: number; submittedAt: Date }>;
        total: number;
        pages: number;
        stats: {
            attending: number;
            notAttending: number;
            maybe: number;
            pending: number;
            totalAttendees: number;
        };
    }> {
        const skip = (page - 1) * limit;
        const websiteObjectId = new Types.ObjectId(websiteId);

        const [rsvps, total, stats, totalGuests] = await Promise.all([
            RSVP.find({ websiteId: websiteObjectId })
                .populate('guestId', 'name email uniqueCode')
                .sort({ submittedAt: -1 })
                .skip(skip)
                .limit(limit),
            RSVP.countDocuments({ websiteId: websiteObjectId }),
            RSVP.aggregate([
                { $match: { websiteId: websiteObjectId } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        attendees: { $sum: '$attendeeCount' },
                    },
                },
            ]),
            Guest.countDocuments({ websiteId: websiteObjectId }),
        ]);

        const statsSummary = {
            attending: 0,
            notAttending: 0,
            maybe: 0,
            pending: totalGuests - total,
            totalAttendees: 0,
        };

        for (const stat of stats) {
            if (stat._id === 'attending') {
                statsSummary.attending = stat.count;
                statsSummary.totalAttendees = stat.attendees;
            } else if (stat._id === 'not_attending') {
                statsSummary.notAttending = stat.count;
            } else if (stat._id === 'maybe') {
                statsSummary.maybe = stat.count;
            }
        }

        const rsvpsWithGuest = rsvps.map((rsvp) => {
            const guest = rsvp.guestId as unknown as { name: string; email?: string };
            return {
                status: rsvp.status,
                attendeeCount: rsvp.attendeeCount,
                submittedAt: rsvp.submittedAt,
                guest: {
                    name: guest.name,
                    email: guest.email,
                },
            };
        });

        return {
            rsvps: rsvpsWithGuest,
            total,
            pages: Math.ceil(total / limit),
            stats: statsSummary,
        };
    }

    async update(guestCode: string, data: UpdateRSVPInput): Promise<IRSVP | null> {
        const guest = await Guest.findOne({ uniqueCode: guestCode.toUpperCase() });
        if (!guest) return null;

        // Validate attendee count if updating
        if (data.attendeeCount !== undefined && data.attendeeCount > guest.maxAttendees) {
            throw createError(`Maximum ${guest.maxAttendees} attendees allowed`, 400);
        }

        return RSVP.findOneAndUpdate(
            { guestId: guest._id },
            { ...data, updatedAt: new Date() },
            { new: true }
        );
    }

    async getGuestStatus(websiteId: string, page: number = 1, limit: number = 50): Promise<{
        guests: Array<{
            name: string;
            code: string;
            hasRSVP: boolean;
            status?: string;
            attendeeCount?: number;
        }>;
        total: number;
        pages: number;
    }> {
        const skip = (page - 1) * limit;
        const websiteObjectId = new Types.ObjectId(websiteId);

        const [guests, total] = await Promise.all([
            Guest.find({ websiteId: websiteObjectId })
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit),
            Guest.countDocuments({ websiteId: websiteObjectId }),
        ]);

        const guestIds = guests.map((g) => g._id);
        const rsvps = await RSVP.find({ guestId: { $in: guestIds } });
        const rsvpMap = new Map(rsvps.map((r) => [r.guestId.toString(), r]));

        const guestStatus = guests.map((guest) => {
            const rsvp = rsvpMap.get(guest._id.toString());
            return {
                name: guest.name,
                code: guest.uniqueCode,
                hasRSVP: !!rsvp,
                status: rsvp?.status,
                attendeeCount: rsvp?.attendeeCount,
            };
        });

        return {
            guests: guestStatus,
            total,
            pages: Math.ceil(total / limit),
        };
    }
}

export const rsvpService = new RSVPService();
