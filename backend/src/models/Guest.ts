import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGuest extends Document {
  websiteId: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  uniqueCode: string;
  maxAttendees: number;
  createdAt: Date;
  updatedAt: Date;
}

const guestSchema = new Schema<IGuest>(
  {
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: 'Website',
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
    uniqueCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    maxAttendees: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster lookups
guestSchema.index({ websiteId: 1, uniqueCode: 1 });

export const Guest = mongoose.model<IGuest>('Guest', guestSchema);
