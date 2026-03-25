import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  url: string;
  videoId: string;
  thumbnailUrl: string;
  title?: string;
  createdAt: Date;
}

const VideoSchema: Schema = new Schema({
  url: { type: String, required: true },
  videoId: { type: String, required: true, unique: true },
  thumbnailUrl: { type: String, required: true },
  title: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IVideo>('Video', VideoSchema);
