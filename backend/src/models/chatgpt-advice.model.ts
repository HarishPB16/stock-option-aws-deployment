import mongoose, { Schema, Document } from 'mongoose';

export interface IAdviceChatGPT extends Document {
    stock: string;
    advice: string;
    dateKey: string;
    createdAt: Date;
}

const adviceChatGPTSchema = new Schema(
    {
        stock: { type: String, required: true, index: true },
        advice: { type: String, required: true },
        dateKey: { type: String, required: true, index: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL Index for auto cleanup (30 days) to match options
adviceChatGPTSchema.index({ createdAt: -1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Compound unique index for caching per day
adviceChatGPTSchema.index({ stock: 1, dateKey: 1 }, { unique: true });

export const AdviceChatGPT = mongoose.model<IAdviceChatGPT>('AdviceChatGPT', adviceChatGPTSchema);
