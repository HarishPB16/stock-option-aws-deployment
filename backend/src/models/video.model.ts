import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
    url: string;
    videoId: string;
    thumbnailUrl: string;
    title: string;
    categories: string[];
    createdAt: Date;
    updatedAt: Date;
}

const VideoSchema = new Schema(
    {
        url: { type: String, required: true },
        videoId: { type: String, required: true, unique: true, index: true },
        thumbnailUrl: { type: String, required: true },
        title: { type: String, required: true },
        categories: { type: [String], default: [] },
    },
    { timestamps: true }
);

// Index for efficiently filtering by category
VideoSchema.index({ categories: 1 });

export const Video = mongoose.model<IVideo>('Video', VideoSchema);
