import mongoose, { Document, Schema, Types } from "mongoose";
import { nanoid } from "nanoid";

export interface IGuest extends Document {
  websiteId: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  inviteCode: string;
  createdAt: Date;
}

const guestSchema = new Schema<IGuest>(
  {
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: "Website",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(8).toUpperCase(),
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for quick lookup
guestSchema.index({ websiteId: 1, inviteCode: 1 });

export const Guest = mongoose.model<IGuest>("Guest", guestSchema);
