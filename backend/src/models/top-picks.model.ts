import mongoose, { Schema, Document } from 'mongoose';

export interface IOptionPick {
    ticker: string;
    strike: string;
    expiry: string;
    premium: string;
    reason: string;
}

export interface ITopPicks extends Document {
    dateKey: string;
    aiService: string;
    calls: IOptionPick[];
    puts: IOptionPick[];
    createdAt: Date;
}

const OptionPickSchema = new Schema({
    ticker: { type: String, required: true },
    strike: { type: String, required: true },
    expiry: { type: String, required: true },
    premium: { type: String, required: true },
    reason: { type: String, required: true }
}, { _id: false });

const TopPicksSchema = new Schema({
    dateKey: {
        type: String,
        required: true,
        index: true
    },
    aiService: {
        type: String,
        required: true,
        enum: ['gemini', 'chatgpt', 'claude', 'deepseek'],
        index: true
    },
    calls: [OptionPickSchema],
    puts: [OptionPickSchema]
}, {
    timestamps: true
});

// Compound index to ensure 1 unique response per AI per day
TopPicksSchema.index({ dateKey: 1, aiService: 1 }, { unique: true });

export const TopPicks = mongoose.model<ITopPicks>('TopPicks', TopPicksSchema);
