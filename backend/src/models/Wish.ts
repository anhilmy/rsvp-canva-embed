import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWish extends Document {
  guestId: Types.ObjectId;
  websiteId: Types.ObjectId;
  guestName: string; // Denormalized for display
  message: string;
  isPublic: boolean;
  isReported: boolean;
  isHidden: boolean;
  createdAt: Date;
}

const wishSchema = new Schema<IWish>(
  {
    guestId: {
      type: Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
    },
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: "Website",
      required: true,
      index: true,
    },
    guestName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for fetching public wishes
wishSchema.index({ websiteId: 1, isPublic: 1, isHidden: 1, createdAt: -1 });

export const Wish = mongoose.model<IWish>("Wish", wishSchema);
