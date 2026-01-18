import mongoose, { Document, Schema, Types } from 'mongoose';

export type InvitationStatus = 'created' | 'invitation_sent';

export interface IGuest extends Document {
    websiteId: Types.ObjectId;
    name: string;
    email?: string;
    phone?: string;
    uniqueCode: string;
    maxAttendees: number;
    isManual: boolean; // True if guest was created via public form (walk-in)
    greeting?: string; // Custom greeting for broadcast messages (max 16 chars)
    personalLink?: string; // Custom personal link for broadcast messages
    label?: string; // Custom label for categorization (e.g., Family, Friends, VIP)
    invitationStatus: InvitationStatus; // Track invitation progress
    invitationSentAt?: Date; // Timestamp when invitation was marked as sent
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
        isManual: {
            type: Boolean,
            default: false,
        },
        greeting: {
            type: String,
            maxlength: 16,
        },
        personalLink: {
            type: String,
        },
        label: {
            type: String,
            maxlength: 50,
        },
        invitationStatus: {
            type: String,
            enum: ['created', 'invitation_sent'],
            default: 'created',
        },
        invitationSentAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for faster lookups
guestSchema.index({ websiteId: 1, uniqueCode: 1 });

export const Guest = mongoose.model<IGuest>('Guest', guestSchema);
