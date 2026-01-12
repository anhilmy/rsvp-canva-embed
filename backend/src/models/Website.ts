import mongoose, { Document, Schema } from 'mongoose';

export interface IWebsite extends Document {
  publishId: string;
  name: string;
  description?: string;
  eventDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const websiteSchema = new Schema<IWebsite>(
  {
    publishId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    eventDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Website = mongoose.model<IWebsite>('Website', websiteSchema);
