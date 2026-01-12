import mongoose, { Document, Schema, Types } from 'mongoose';

export type RSVPStatus = 'attending' | 'not_attending' | 'maybe';

export interface IRSVP extends Document {
    guestId: Types.ObjectId;
    websiteId: Types.ObjectId;
    status: RSVPStatus;
    attendeeCount: number;
    dietaryRestrictions?: string;
    notes?: string;
    submittedAt: Date;
    updatedAt: Date;
}

const rsvpSchema = new Schema<IRSVP>(
    {
        guestId: {
            type: Schema.Types.ObjectId,
            ref: 'Guest',
            required: true,
            unique: true, // One RSVP per guest
            index: true,
        },
        websiteId: {
            type: Schema.Types.ObjectId,
            ref: 'Website',
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['attending', 'not_attending', 'maybe'],
            required: true,
        },
        attendeeCount: {
            type: Number,
            default: 1,
            min: 0,
        },
        dietaryRestrictions: {
            type: String,
        },
        notes: {
            type: String,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export const RSVP = mongoose.model<IRSVP>('RSVP', rsvpSchema);
