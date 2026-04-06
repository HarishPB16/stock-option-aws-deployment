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

const defaultCategoryObj = {
  english: "English",
  technical: "Technical",
  aiDevops: "AI / DevOps / AWS",
  psychology: "Psychology",
  health: "Health",
  utkarshVideo: "Utkarsh Video",
  stockMarket: "Stock Market"
};

const defaultSubCategoryObj = {
  english: ["communication", "interviewPrep"],
  technical: ["angular", "react", "project", "linuxCommands", "gitCommands"],
  aiDevops: ["genAI", "aiPrompts", "owasp", "aws", "ciCd", "monitoring"],
  psychology: ["behavior", "intelligence", "communicationSkills", "mentalHealth", "relationships", "selfDevelopment"],
  health: ["eyes", "backBone", "ears", "teeth", "tests", "sugar", "outsideFood"],
  utkarshVideo: ["learningVideos", "games", "activities", "environment", "audioVideo", "tongueTest"],
  stockMarket: ["buyTwoOptions"]
};

const defaultValueObj = {
  communication: ["Writing (grammar, spelling)", "Speaking (confidence)", "Listening (understand native speakers)", "Technical vocabulary"],
  interviewPrep: ["Scenario-based questions", "HR questions", "AI mock interview"],
  angular: ["Angular Elements", "ngOnChanges", "Ivy engine", "Routing & Guards", "Signals", "Standalone components"],
  react: ["useState", "useReducer", "Props", "Context API", "Lazy loading", "Routing"],
  project: ["MEAN stack", "Architecture design", "Debugging"],
  linuxCommands: ["ls, cd, pwd", "chmod", "ps, kill"],
  gitCommands: ["clone, pull, push", "branch, merge"],
  genAI: ["AI concepts", "Time complexity", "Use cases"],
  aiPrompts: ["Prompt engineering", "Reusable prompts"],
  owasp: ["OWASP Top 10", "Security practices"],
  aws: ["S3", "Lambda", "IAM", "Cloud basics"],
  ciCd: ["Pipeline setup", "SonarQube", "Deployment flow"],
  monitoring: ["Logs", "Alerts", "Performance tracking"],
  behavior: ["Human behavior", "Child parenting"],
  intelligence: ["Emotional intelligence", "Cognitive skills"],
  communicationSkills: ["Verbal communication", "Social interaction"],
  mentalHealth: ["Stress management", "Mental wellness"],
  relationships: ["Relationship understanding", "Leadership"],
  selfDevelopment: ["Self awareness", "Personality growth"],
  eyes: "Eye checkup",
  backBone: "Backbone test",
  ears: "Ear care",
  teeth: "Brush twice",
  tests: ["Calcium", "Vitamin B12", "Vitamin D", "Cholesterol", "Sugar"],
  sugar: "Reduce sugar",
  outsideFood: "Avoid outside food",
  learningVideos: ["Jadu stories", "Wall videos", "Sound videos"],
  games: ["Mobile games", "Learning games"],
  activities: ["Story explain", "Music & story"],
  environment: ["Box with soil", "Fish tank", "Home setup"],
  audioVideo: ["Sound learning", "Video collection"],
  tongueTest: ["Reaction test", "Tongue test"],
  buyTwoOptions: "Buy two options per month"
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    ensureDataDir();
    
    const category = readFileSafely(getFilePath('category.json'), defaultCategoryObj);
    const subCategory = readFileSafely(getFilePath('subCategory.json'), defaultSubCategoryObj);
    const value = readFileSafely(getFilePath('value.json'), defaultValueObj);

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
