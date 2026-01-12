import mongoose, { Document, Schema } from "mongoose";
import { nanoid } from "nanoid";

export interface IWebsite extends Document {
  canvaDesignId: string;
  name: string;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const websiteSchema = new Schema<IWebsite>(
  {
    canvaDesignId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    apiKey: {
      type: String,
      required: true,
      default: () => nanoid(32),
    },
  },
  {
    timestamps: true,
  }
);

export const Website = mongoose.model<IWebsite>("Website", websiteSchema);
