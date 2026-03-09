import mongoose, { Schema, Document } from 'mongoose';

export interface IOptionDeepSeek extends Document {
    userId: string;
    stock: string;
    action: 'CALL' | 'PUT';
    confidence: number;
    risk: string;
    support: number;
    resistance: number;
    pe: number;
    industryPe: number;
    averagePe5Yr: number;
    trend: string;
    newsSummary: { text: string; color: string };
    analysis: { text: string; color: string };
    forecast1Year: { text: string; color: string };
    tomorrowRange: string;
    emaAnalysis: { text: string; color: string };
    rsiAnalysis: { text: string; color: string };
    vixThetaAnalysis: { text: string; color: string };
    supportResistanceAnalysis: string;
    verdict: { text: string; color: string };
    createdAt: Date;
}

const optionDeepSeekSchema = new Schema(
    {
        userId: { type: String, required: true, index: true },
        stock: { type: String, required: true, index: true },
        action: { type: String, enum: ['CALL', 'PUT'], required: true },
        confidence: { type: Number, required: true },
        risk: { type: String, required: true },
        support: { type: Number, required: true },
        resistance: { type: Number, required: true },
        pe: { type: Number, required: true },
        industryPe: { type: Number, required: true },
        averagePe5Yr: { type: Number, required: true },
        trend: { type: String, required: true },
        newsSummary: { text: { type: String, required: true }, color: { type: String, required: true } },
        analysis: { text: { type: String, required: true }, color: { type: String, required: true } },
        forecast1Year: { text: { type: String, required: true }, color: { type: String, required: true } },
        tomorrowRange: { type: String, required: true },
        emaAnalysis: { text: { type: String, required: true }, color: { type: String, required: true } },
        rsiAnalysis: { text: { type: String, required: true }, color: { type: String, required: true } },
        vixThetaAnalysis: { text: { type: String, required: true }, color: { type: String, required: true } },
        supportResistanceAnalysis: { type: String, required: true },
        verdict: { text: { type: String, required: true }, color: { type: String, required: true } },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

optionDeepSeekSchema.index({ createdAt: -1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
optionDeepSeekSchema.index({ userId: 1, stock: 1, createdAt: -1 });

export const OptionDeepSeek = mongoose.model<IOptionDeepSeek>('OptionDeepSeek', optionDeepSeekSchema);
