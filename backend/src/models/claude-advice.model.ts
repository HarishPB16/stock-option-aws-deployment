import mongoose, { Schema, Document } from 'mongoose';

export interface IAdviceClaude extends Document {
    stock: string;
    advice: string;
    dateKey: string;
    createdAt: Date;
}

const adviceClaudeSchema = new Schema(
    {
        stock: { type: String, required: true, index: true },
        advice: { type: String, required: true },
        dateKey: { type: String, required: true, index: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

adviceClaudeSchema.index({ createdAt: -1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
adviceClaudeSchema.index({ stock: 1, dateKey: 1 }, { unique: true });

export const AdviceClaude = mongoose.model<IAdviceClaude>('AdviceClaude', adviceClaudeSchema);
