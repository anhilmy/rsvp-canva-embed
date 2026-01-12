import { Website, IWebsite } from '../models';
import { CreateWebsiteInput, UpdateWebsiteInput } from '../validators';
import { createError } from '../middleware';

export class WebsiteService {
  async create(data: CreateWebsiteInput): Promise<IWebsite> {
    const existing = await Website.findOne({ publishId: data.publishId });
    if (existing) {
      throw createError('Website with this publish ID already exists', 409);
    }

    const website = new Website({
      ...data,
      eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
    });
    await website.save();
    return website;
  }

  async findByPublishId(publishId: string): Promise<IWebsite | null> {
    return Website.findOne({ publishId });
  }

  async findById(id: string): Promise<IWebsite | null> {
    return Website.findById(id);
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{
    websites: IWebsite[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    const [websites, total] = await Promise.all([
      Website.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Website.countDocuments(),
    ]);

    return {
      websites,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: UpdateWebsiteInput): Promise<IWebsite | null> {
    const updateData: Record<string, unknown> = { ...data };
    if (data.eventDate) {
      updateData.eventDate = new Date(data.eventDate);
    }

    return Website.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await Website.findByIdAndDelete(id);
    return !!result;
  }

  async validateWebsite(publishId: string): Promise<{ valid: boolean; website?: IWebsite }> {
    const website = await this.findByPublishId(publishId);
    if (!website) {
      return { valid: false };
    }
    if (!website.isActive) {
      return { valid: false };
    }
    return { valid: true, website };
  }
}

export const websiteService = new WebsiteService();
