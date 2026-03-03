import mongoose, { Schema, Document } from 'mongoose';

export interface IOption extends Document {
    userId: string;
    stock: string;
    action: 'CALL' | 'PUT';
    confidence: number;
    risk: string;
    support: number;
    resistance: number;
    pe: number;
    trend: string;
    createdAt: Date;
}

const optionSchema = new Schema(
    {
        userId: { type: String, required: true, index: true },
        stock: { type: String, required: true, index: true },
        action: { type: String, enum: ['CALL', 'PUT'], required: true },
        confidence: { type: Number, required: true },
        risk: { type: String, required: true },
        support: { type: Number, required: true },
        resistance: { type: Number, required: true },
        pe: { type: Number, required: true },
        trend: { type: String, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL Index for auto cleanup (30 days)
optionSchema.index({ createdAt: -1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Compound index for querying user recent insights
optionSchema.index({ userId: 1, stock: 1, createdAt: -1 });

export const Option = mongoose.model<IOption>('Option', optionSchema);
