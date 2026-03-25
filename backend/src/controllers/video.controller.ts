import { Request, Response } from 'express';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import Video, { IVideo } from '../models/video.model';

// Helper to extract YouTube video ID from various URL formats
const extractVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
};

// Helper to download image
const downloadImage = (url: string, dest: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                // Handle redirects if needed (YouTube thumbnails usually don't redirect but good practice)
                return downloadImage(response.headers.location, dest).then(resolve).catch(reject);
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
};

export const addVideo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { url, title } = req.body;
        
        if (!url) {
            res.status(400).json({ success: false, message: 'YouTube URL is required' });
            return;
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
            return;
        }

        // Check if video already exists
        const existingVideo = await Video.findOne({ videoId });
        if (existingVideo) {
            res.status(400).json({ success: false, message: 'Video already exists', data: existingVideo });
            return;
        }

        // Create public/thumbnails directory if it doesn't exist
        const publicDir = path.join(__dirname, '../../public');
        const thumbnailsDir = path.join(publicDir, 'thumbnails');
        
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }
        if (!fs.existsSync(thumbnailsDir)) {
            fs.mkdirSync(thumbnailsDir);
        }

        const thumbnailUrlStr = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        const localThumbnailName = `${videoId}.jpg`;
        const localThumbnailPath = path.join(thumbnailsDir, localThumbnailName);

        // Download thumbnail
        await downloadImage(thumbnailUrlStr, localThumbnailPath);
        
        // Save to DB
        const video = new Video({
            url,
            videoId,
            thumbnailUrl: `/public/thumbnails/${localThumbnailName}`,
            title: title || ''
        });
        
        await video.save();

        res.status(201).json({ success: true, data: video });
    } catch (error: any) {
        console.error('Error adding video:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const getRandomVideos = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch up to 50 random videos
        const videos = await Video.aggregate([{ $sample: { size: 50 } }]);
        res.status(200).json({ success: true, data: videos, count: videos.length });
    } catch (error: any) {
        console.error('Error fetching random videos:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
