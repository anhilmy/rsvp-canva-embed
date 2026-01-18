import { customAlphabet } from 'nanoid';
import { Guest, IGuest, Website } from '../models';
import { CreateGuestInput, UpdateGuestInput } from '../validators';
import { createError } from '../middleware';
import { Types } from 'mongoose';

// Generate short, readable codes (6 characters, alphanumeric uppercase)
const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

// Default max attendees for manual (walk-in) guests
const MANUAL_GUEST_MAX_ATTENDEES = 2;

export class GuestService {
    async create(websiteId: string, data: CreateGuestInput, isManual: boolean = false): Promise<IGuest> {
        const website = await Website.findById(websiteId);
        if (!website) {
            throw createError('Website not found', 404);
        }

        let uniqueCode: string;
        let attempts = 0;
        const maxAttempts = 10;

        // Generate unique code with retry
        do {
            uniqueCode = generateCode();
            const existing = await Guest.findOne({ uniqueCode });
            if (!existing) break;
            attempts++;
        } while (attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            throw createError('Failed to generate unique code', 500);
        }

        const guest = new Guest({
            websiteId: new Types.ObjectId(websiteId),
            ...data,
            email: data.email || undefined,
            uniqueCode,
            isManual,
            // For manual guests, cap maxAttendees at MANUAL_GUEST_MAX_ATTENDEES
            maxAttendees: isManual ? Math.min(data.maxAttendees || MANUAL_GUEST_MAX_ATTENDEES, MANUAL_GUEST_MAX_ATTENDEES) : (data.maxAttendees || 1),
        });
        await guest.save();
        return guest;
    }

    async createBulk(websiteId: string, guests: CreateGuestInput[]): Promise<IGuest[]> {
        const website = await Website.findById(websiteId);
        if (!website) {
            throw createError('Website not found', 404);
        }

        const createdGuests: IGuest[] = [];
        const usedCodes = new Set<string>();

        for (const guestData of guests) {
            let uniqueCode: string;
            let attempts = 0;
            const maxAttempts = 10;

            do {
                uniqueCode = generateCode();
                const existing = await Guest.findOne({ uniqueCode });
                if (!existing && !usedCodes.has(uniqueCode)) break;
                attempts++;
            } while (attempts < maxAttempts);

            if (attempts >= maxAttempts) {
                throw createError('Failed to generate unique codes for all guests', 500);
            }

            usedCodes.add(uniqueCode);

            const guest = new Guest({
                websiteId: new Types.ObjectId(websiteId),
                ...guestData,
                email: guestData.email || undefined,
                uniqueCode,
            });
            await guest.save();
            createdGuests.push(guest);
        }

        return createdGuests;
    }

    async findByCode(code: string): Promise<IGuest | null> {
        return Guest.findOne({ uniqueCode: code.toUpperCase() });
    }

    async findById(id: string): Promise<IGuest | null> {
        return Guest.findById(id);
    }

    async findByWebsite(websiteId: string, page: number = 1, limit: number = 20): Promise<{
        guests: IGuest[];
        total: number;
        pages: number;
    }> {
        const skip = (page - 1) * limit;
        const [guests, total] = await Promise.all([
            Guest.find({ websiteId: new Types.ObjectId(websiteId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Guest.countDocuments({ websiteId: new Types.ObjectId(websiteId) }),
        ]);

        return {
            guests,
            total,
            pages: Math.ceil(total / limit),
        };
    }

    async update(id: string, data: UpdateGuestInput): Promise<IGuest | null> {
        return Guest.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await Guest.findByIdAndDelete(id);
        return !!result;
    }

    async validateGuest(code: string, publishId: string): Promise<{
        valid: boolean;
        guest?: IGuest;
        message?: string;
    }> {
        const guest = await this.findByCode(code);
        if (!guest) {
            return { valid: false, message: 'Invalid guest code' };
        }

        const website = await Website.findById(guest.websiteId);
        if (!website || website.publishId !== publishId) {
            return { valid: false, message: 'Guest not found for this website' };
        }

        if (!website.isActive) {
            return { valid: false, message: 'This website is no longer active' };
        }

        return { valid: true, guest };
    }

    async generateShareableLink(guestId: string, baseUrl: string): Promise<string> {
        const guest = await Guest.findById(guestId).populate('websiteId');
        if (!guest) {
            throw createError('Guest not found', 404);
        }

        const website = guest.websiteId as unknown as { publishId: string };
        return `${baseUrl}?code=${guest.uniqueCode}&publishId=${website.publishId}`;
    }
}

export const guestService = new GuestService();
