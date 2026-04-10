import { Request, Response } from 'express';
import { CategoryData } from '../models/category.model';
import { encryptPayload } from '../utils/encryption.util';

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

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await CategoryData.findOne({ singletonId: 'global_config' });

    // Encrypt the sensitive dictionary mappings
    const rawData = {
      categoryObj: config?.categoryObj || defaultCategoryObj,
      subCategoryObj: config?.subCategoryObj || defaultSubCategoryObj,
      valueObj: config?.valueObj || defaultValueObj
    };

    res.status(200).json({
      success: true,
      encryptedData: encryptPayload(rawData)
    });
  } catch (error: any) {
    console.error('Error fetching categories from MongoDB:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const saveCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryObj, subCategoryObj, valueObj } = req.body;
    
    // Utilize atomic upsert to overwrite the global singleton mapping document
    await CategoryData.findOneAndUpdate(
        { singletonId: 'global_config' },
        { 
            $set: {
                categoryObj: categoryObj || {},
                subCategoryObj: subCategoryObj || {},
                valueObj: valueObj || {}
            }
        },
        { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: 'Data saved to MongoDB successfully.' });
  } catch (error: any) {
    console.error('Failed to save categories to MongoDB:', error);
    res.status(500).json({ success: false, message: 'Failed to save data', error: error.message });
  }
};
