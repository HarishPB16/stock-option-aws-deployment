import { Request, Response } from 'express';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

// Define the absolute path to the data folder
const DATA_DIR = path.join(__dirname, '../../data');
const getFilePath = (fileName: string) => path.join(DATA_DIR, fileName);

const ensureDataDir = () => {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
};

const readFileSafely = (filePath: string, defaultData: any) => {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err);
    }
    return defaultData;
};

export interface IVideoJSON {
    url: string;
    videoId: string;
    thumbnailUrl: string;
    title: string;
    categories: string[];
    createdAt: string;
}

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

        ensureDataDir();
        const youtubeDataPath = getFilePath('youtube.json');
        const videos: IVideoJSON[] = readFileSafely(youtubeDataPath, []);

        // Check if video already exists
        const existingVideo = videos.find(v => v.videoId === videoId);
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
        
        // Save to JSON
        const video: IVideoJSON = {
            url,
            videoId,
            thumbnailUrl: `/public/thumbnails/${localThumbnailName}`,
            title: title || '',
            categories: categories || [],
            createdAt: new Date().toISOString()
        };
        
        videos.push(video);
        fs.writeFileSync(youtubeDataPath, JSON.stringify(videos, null, 2), 'utf-8');

        res.status(201).json({ success: true, data: video });
    } catch (error: any) {
        console.error('Error adding video:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const getRandomVideos = async (req: Request, res: Response): Promise<void> => {
    try {
        const selectedCategory = req.query.category as string | undefined;

        ensureDataDir();
        const videos: IVideoJSON[] = readFileSafely(getFilePath('youtube.json'), []);

        let filteredVideos = videos;
        
        if (selectedCategory && selectedCategory !== 'All') {
            filteredVideos = videos.filter(v => v.categories && v.categories.includes(selectedCategory));
        }

        // Randomize the array
        for (let i = filteredVideos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filteredVideos[i], filteredVideos[j]] = [filteredVideos[j], filteredVideos[i]];
        }

        // Fetch up to 50
        const result = filteredVideos.slice(0, 50);

        res.status(200).json({ success: true, data: result, count: result.length });
    } catch (error: any) {
        console.error('Error fetching random videos:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
