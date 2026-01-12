import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWish extends Document {
  guestId: Types.ObjectId;
  websiteId: Types.ObjectId;
  guestName: string;
  message: string;
  isApproved: boolean;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const wishSchema = new Schema<IWish>(
  {
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
      index: true,
    },
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: 'Website',
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
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve by default
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching visible wishes
wishSchema.index({ websiteId: 1, isApproved: 1, isHidden: 1, createdAt: -1 });

export const Wish = mongoose.model<IWish>('Wish', wishSchema);
