import mongoose, { Document, Schema, Types } from "mongoose";

export type RSVPStatus = "attending" | "not_attending" | "maybe";

export interface IRSVP extends Document {
  guestId: Types.ObjectId;
  websiteId: Types.ObjectId;
  status: RSVPStatus;
  createdAt: Date;
  updatedAt: Date;
}

const rsvpSchema = new Schema<IRSVP>(
  {
    guestId: {
      type: Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
      unique: true, // One RSVP per guest
    },
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: "Website",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["attending", "not_attending", "maybe"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookup by website
rsvpSchema.index({ websiteId: 1, status: 1 });

export const RSVP = mongoose.model<IRSVP>("RSVP", rsvpSchema);
