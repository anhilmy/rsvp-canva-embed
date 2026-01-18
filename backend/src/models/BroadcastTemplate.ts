import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBroadcastTemplate extends Document {
    websiteId: Types.ObjectId;
    name: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
}

const broadcastTemplateSchema = new Schema<IBroadcastTemplate>(
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
            maxlength: 100,
        },
        body: {
            type: String,
            required: true,
            maxlength: 5000,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for faster lookups
broadcastTemplateSchema.index({ websiteId: 1, name: 1 });

export const BroadcastTemplate = mongoose.model<IBroadcastTemplate>('BroadcastTemplate', broadcastTemplateSchema);
