import { Request, Response } from 'express';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { Video } from '../models/video.model';

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
                // Handle redirects if needed
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
        const { url, title, categories } = req.body;
        
        if (!url) {
            res.status(400).json({ success: false, message: 'YouTube URL is required' });
            return;
        }

        if (!title || !title.trim()) {
            res.status(400).json({ success: false, message: 'Video Title is required' });
            return;
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
            return;
        }

        // Check if video already exists in database
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
        
        // Save to Database
        const video = await Video.create({
            url,
            videoId,
            thumbnailUrl: `/public/thumbnails/${localThumbnailName}`,
            title: title || '',
            categories: categories || []
        });

        res.status(201).json({ success: true, data: video });
    } catch (error: any) {
        console.error('Error adding video:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const getRandomVideos = async (req: Request, res: Response): Promise<void> => {
    try {
        const selectedCategory = req.query.category as string | undefined;

        let matchQuery = {};
        if (selectedCategory && selectedCategory !== 'All') {
            matchQuery = { categories: selectedCategory };
        }

        // Fetch randomly with MongoDB aggregate ($sample is optimized for randomness and fast extraction)
        const result = await Video.aggregate([
            { $match: matchQuery },
            { $sample: { size: 50 } }
        ]);

        res.status(200).json({ success: true, data: result, count: result.length });
    } catch (error: any) {
        console.error('Error fetching random videos:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
