import { Request, Response } from 'express';
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

export const getCategories = async (req: Request, res: Response) => {
  try {
    ensureDataDir();
    
    const category = readFileSafely(getFilePath('category.json'), null);
    const subCategory = readFileSafely(getFilePath('subCategory.json'), null);
    const value = readFileSafely(getFilePath('value.json'), null);

    res.status(200).json({
      success: true,
      data: {
        categoryObj: category,
        subCategoryObj: subCategory,
        valueObj: value
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const saveCategories = async (req: Request, res: Response) => {
  try {
    const { categoryObj, subCategoryObj, valueObj } = req.body;
    
    ensureDataDir();

    if (categoryObj) {
      fs.writeFileSync(getFilePath('category.json'), JSON.stringify(categoryObj, null, 2), 'utf-8');
    }
    
    if (subCategoryObj) {
      fs.writeFileSync(getFilePath('subCategory.json'), JSON.stringify(subCategoryObj, null, 2), 'utf-8');
    }
    
    if (valueObj) {
      fs.writeFileSync(getFilePath('value.json'), JSON.stringify(valueObj, null, 2), 'utf-8');
    }

    res.status(200).json({ success: true, message: 'Data saved successfully.' });

  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to save data', error: error.message });
  }
};
