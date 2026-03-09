import mongoose, { Schema, Document } from 'mongoose';

export interface IAdviceDeepSeek extends Document {
    stock: string;
    advice: string;
    dateKey: string;
    createdAt: Date;
}

const adviceDeepSeekSchema = new Schema(
    {
        stock: { type: String, required: true, index: true },
        advice: { type: String, required: true },
        dateKey: { type: String, required: true, index: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

adviceDeepSeekSchema.index({ createdAt: -1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
adviceDeepSeekSchema.index({ stock: 1, dateKey: 1 }, { unique: true });

export const AdviceDeepSeek = mongoose.model<IAdviceDeepSeek>('AdviceDeepSeek', adviceDeepSeekSchema);
