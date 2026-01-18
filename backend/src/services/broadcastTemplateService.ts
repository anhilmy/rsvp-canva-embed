import { BroadcastTemplate, IBroadcastTemplate, Website } from '../models';
import { createError } from '../middleware';
import { Types } from 'mongoose';

export interface CreateBroadcastTemplateInput {
    name: string;
    body: string;
}

export interface UpdateBroadcastTemplateInput {
    name?: string;
    body?: string;
}

export class BroadcastTemplateService {
    async create(websiteId: string, data: CreateBroadcastTemplateInput): Promise<IBroadcastTemplate> {
        const website = await Website.findById(websiteId);
        if (!website) {
            throw createError('Website not found', 404);
        }

        const template = new BroadcastTemplate({
            websiteId: new Types.ObjectId(websiteId),
            name: data.name,
            body: data.body,
        });
        await template.save();
        return template;
    }

    async findById(id: string): Promise<IBroadcastTemplate | null> {
        return BroadcastTemplate.findById(id);
    }

    async findByWebsite(websiteId: string, page: number = 1, limit: number = 20): Promise<{
        templates: IBroadcastTemplate[];
        total: number;
        pages: number;
    }> {
        const skip = (page - 1) * limit;
        const [templates, total] = await Promise.all([
            BroadcastTemplate.find({ websiteId: new Types.ObjectId(websiteId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            BroadcastTemplate.countDocuments({ websiteId: new Types.ObjectId(websiteId) }),
        ]);

        return {
            templates,
            total,
            pages: Math.ceil(total / limit),
        };
    }

    async findAllByWebsite(websiteId: string): Promise<IBroadcastTemplate[]> {
        return BroadcastTemplate.find({ websiteId: new Types.ObjectId(websiteId) })
            .sort({ createdAt: -1 });
    }

    async update(id: string, data: UpdateBroadcastTemplateInput): Promise<IBroadcastTemplate | null> {
        const template = await BroadcastTemplate.findById(id);
        if (!template) {
            throw createError('Template not found', 404);
        }

        return BroadcastTemplate.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const template = await BroadcastTemplate.findById(id);
        if (!template) {
            throw createError('Template not found', 404);
        }

        await BroadcastTemplate.findByIdAndDelete(id);
        return true;
    }

    // Helper function to fill template with guest data
    fillTemplate(
        templateBody: string,
        guest: { name: string; greeting?: string; personalLink?: string; uniqueCode: string },
        baseUrl: string,
        publishId: string
    ): string {
        const link = guest.personalLink || `${baseUrl}/f/simple/${publishId}?code=${guest.uniqueCode}`;

        return templateBody
            .replace(/\[to\]/g, guest.name)
            .replace(/\[greeting\]/g, guest.greeting || '')
            .replace(/\[link\]/g, link);
    }
}

export const broadcastTemplateService = new BroadcastTemplateService();
