import { Wish, IWish, Website, Guest } from '../models';
import { CreateWishInput, UpdateWishInput } from '../validators';
import { createError } from '../middleware';
import { guestService } from './guestService';
import { Types } from 'mongoose';

const MAX_WISHES_PER_GUEST = 3;

export class WishService {
    async create(data: CreateWishInput): Promise<IWish> {
        // Validate guest
        const validation = await guestService.validateGuest(data.guestCode, data.publishId);
        if (!validation.valid || !validation.guest) {
            throw createError(validation.message || 'Invalid guest', 400);
        }

        const guest = validation.guest;

        // Check wish count for this guest (rate limiting per guest)
        const existingCount = await Wish.countDocuments({ guestId: guest._id });
        if (existingCount >= MAX_WISHES_PER_GUEST) {
            throw createError(`Maximum ${MAX_WISHES_PER_GUEST} wishes per guest allowed`, 429);
        }

        const website = await Website.findOne({ publishId: data.publishId });
        if (!website) {
            throw createError('Website not found', 404);
        }

        const wish = new Wish({
            guestId: guest._id,
            websiteId: website._id,
            guestName: guest.name,
            message: data.message,
        });

        await wish.save();
        return wish;
    }

    async findByWebsite(
        publishId: string,
        page: number = 1,
        limit: number = 20,
        includeHidden: boolean = false
    ): Promise<{
        wishes: IWish[];
        total: number;
        pages: number;
    }> {
        const website = await Website.findOne({ publishId });
        if (!website) {
            throw createError('Website not found', 404);
        }

        const skip = (page - 1) * limit;
        const query: Record<string, unknown> = {
            websiteId: website._id,
            isApproved: true,
        };

        if (!includeHidden) {
            query.isHidden = false;
        }

        const [wishes, total] = await Promise.all([
            Wish.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Wish.countDocuments(query),
        ]);

        return {
            wishes,
            total,
            pages: Math.ceil(total / limit),
        };
    }

    async findAllByWebsite(
        websiteId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{
        wishes: IWish[];
        total: number;
        pages: number;
    }> {
        const skip = (page - 1) * limit;
        const websiteObjectId = new Types.ObjectId(websiteId);

        const [wishes, total] = await Promise.all([
            Wish.find({ websiteId: websiteObjectId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Wish.countDocuments({ websiteId: websiteObjectId }),
        ]);

        return {
            wishes,
            total,
            pages: Math.ceil(total / limit),
        };
    }

    async findByGuest(guestCode: string): Promise<IWish[]> {
        const guest = await Guest.findOne({ uniqueCode: guestCode.toUpperCase() });
        if (!guest) return [];
        return Wish.find({ guestId: guest._id }).sort({ createdAt: -1 });
    }

    async update(id: string, data: UpdateWishInput): Promise<IWish | null> {
        return Wish.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await Wish.findByIdAndDelete(id);
        return !!result;
    }

    async toggleVisibility(id: string): Promise<IWish | null> {
        const wish = await Wish.findById(id);
        if (!wish) return null;

        wish.isHidden = !wish.isHidden;
        await wish.save();
        return wish;
    }

    async toggleApproval(id: string): Promise<IWish | null> {
        const wish = await Wish.findById(id);
        if (!wish) return null;

        wish.isApproved = !wish.isApproved;
        await wish.save();
        return wish;
    }
}

export const wishService = new WishService();
