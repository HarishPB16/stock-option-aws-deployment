import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketBriefingChatGPT extends Document {
    dateKey: string;
    htmlContent: string;
    createdAt: Date;
}

const marketBriefingChatGPTSchema = new Schema(
    {
        dateKey: { type: String, required: true, unique: true, index: true },
        htmlContent: { type: String, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL Index for auto cleanup (30 days)
marketBriefingChatGPTSchema.index({ createdAt: -1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const MarketBriefingChatGPT = mongoose.model<IMarketBriefingChatGPT>('MarketBriefingChatGPT', marketBriefingChatGPTSchema);
