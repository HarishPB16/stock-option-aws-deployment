import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

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

export interface IGameJSON {
    id: string;
    name: string;
    url: string;
    description: string;
    createdAt: string;
}

export const addGame = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, url, description } = req.body;
        
        if (!name || !url) {
            res.status(400).json({ success: false, message: 'Name and URL are required' });
            return;
        }

        ensureDataDir();
        const gamesDataPath = getFilePath('games.json');
        const games: IGameJSON[] = readFileSafely(gamesDataPath, []);

        const game: IGameJSON = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            name,
            url,
            description: description || '',
            createdAt: new Date().toISOString()
        };
        
        games.push(game);
        fs.writeFileSync(gamesDataPath, JSON.stringify(games, null, 2), 'utf-8');

        res.status(201).json({ success: true, data: game });
    } catch (error: any) {
        console.error('Error adding game:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const getGames = async (req: Request, res: Response): Promise<void> => {
    try {
        ensureDataDir();
        const games: IGameJSON[] = readFileSafely(getFilePath('games.json'), []);

        res.status(200).json({ success: true, data: games, count: games.length });
    } catch (error: any) {
        console.error('Error fetching games:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
