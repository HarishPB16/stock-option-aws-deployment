import { GoogleGenAI } from '@google/genai';
import logger from '../utils/logger';

// Initialize the generic AI SDK correctly
let ai: GoogleGenAI;
try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key_for_build' });
} catch (err) {
    logger.error('Failed to initialize Google Gen AI SDK', { error: err });
}

export interface IOptionInsight {
    action: 'CALL' | 'PUT';
    confidence: number;
    risk: string;
    support: number;
    resistance: number;
    pe: number;
    trend: string;
}

export const generateOptionSuggestion = async (ticker: string): Promise<IOptionInsight> => {
    const t0 = Date.now();

    // Guard clause against missing initialization
    if (!ai) {
        throw new Error('Google Gen AI is not configured.');
    }

    // HARDCODED SYSTEM PROMPT: User has NO control over this structure.
    // Their input (ticker) is heavily sanitized prior to entering this scope.
    const prompt = `Analyze the stock ticker ${ticker} and provide an options trading suggestion.
  You MUST return ONLY a valid JSON object matching the following structure without any markdown formatting or extra text:
  {
    "action": "CALL" or "PUT",
    "confidence": number between 0 and 100,
    "risk": "High", "Medium", or "Low",
    "support": number,
    "resistance": number,
    "pe": number,
    "trend": "Bullish", "Bearish", or "Neutral"
  }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const duration = Date.now() - t0;

        logger.info('Gemini AI Generation Success', {
            ticker,
            durationMs: duration
        });

        const textOutput = response.text || "{}";
        const jData = JSON.parse(textOutput);

        // Quick validation of the AI output format
        if (!jData.action || !jData.confidence) {
            throw new Error('AI returned malformed JSON structure');
        }

        return {
            action: jData.action,
            confidence: jData.confidence,
            risk: jData.risk || 'Unknown',
            support: jData.support || 0,
            resistance: jData.resistance || 0,
            pe: jData.pe || 0,
            trend: jData.trend || 'Unknown',
        };

    } catch (error: any) {
        const duration = Date.now() - t0;
        logger.error('Gemini AI Generation Failed', {
            ticker,
            durationMs: duration,
            error: error.message
        });
        throw new Error('Failed to generate option analysis');
    }
};
