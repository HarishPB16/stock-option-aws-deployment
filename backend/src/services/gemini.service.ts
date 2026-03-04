import { GoogleGenAI } from '@google/genai';
import logger from '../utils/logger';

let ai: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI => {
    if (!ai) {
        try {
            ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key_for_build' });
        } catch (err) {
            logger.error('Failed to initialize Google Gen AI SDK', { error: err });
            throw new Error('Google Gen AI SDK initialization failed');
        }
    }
    return ai;
};

export interface IOptionInsight {
    action: 'CALL' | 'PUT';
    confidence: number;
    risk: string;
    support: number;
    resistance: number;
    pe: number;
    industryPe: number;
    averagePe5Yr: number;
    trend: string;
    newsSummary: { text: string; color: 'green' | 'yellow' | 'red' };
    analysis: { text: string; color: 'green' | 'yellow' | 'red' };
    forecast1Year: { text: string; color: 'green' | 'yellow' | 'red' };
    tomorrowRange: string;
    emaAnalysis: { text: string; color: 'green' | 'yellow' | 'red' };
    rsiAnalysis: { text: string; color: 'green' | 'yellow' | 'red' };
    vixThetaAnalysis: { text: string; color: 'green' | 'yellow' | 'red' };
    supportResistanceAnalysis: string;
    verdict: { text: string; color: 'green' | 'yellow' | 'red' };
}

export const generateOptionSuggestion = async (ticker: string): Promise<IOptionInsight> => {
    const t0 = Date.now();

    // Guard clause against missing initialization
    const aiClient = getAIClient();

    const prompt = `Analyze the stock ticker ${ticker} based on news from the past 5 days and provide an options trading suggestion for the next 15 to 20 days.
  CRITICAL INSTRUCTION: Your analysis must explicitly incorporate global macroeconomic events, geopolitical tensions (such as ongoing conflicts or wars), and government regulatory changes that impact this specific stock.
  For all "text" and "color" object fields, assign 'green' for positive/bullish, 'yellow' for neutral/mixed, and 'red' for negative/bearish/critical risk.
  You MUST return ONLY a valid JSON object matching the exact structure below, without any markdown formatting or extra text:
  {
    "action": "CALL" or "PUT",
    "confidence": number between 0 and 100,
    "risk": "High", "Medium", or "Low",
    "support": number,
    "resistance": number,
    "pe": number (current PE),
    "industryPe": number (Industry PE),
    "averagePe5Yr": number (Average PE for 5 years),
    "forecast1Year": { "text": "High/Medium/Low", "color": "green/yellow/red" },
    "tomorrowRange": "ex: $170 - $175" (Give tomorrow range of high and low),
    "emaAnalysis": { "text": "ex: Golden Cross phase", "color": "green/yellow/red" },
    "rsiAnalysis": { "text": "ex: Above 60 (Bullish)", "color": "green/yellow/red" },
    "vixThetaAnalysis": { "text": "ex: High VIX impacts premium...", "color": "green/yellow/red" },
    "supportResistanceAnalysis": "ex: Immediate resistance at $185..." (Identify major support/resistance based on Option Chain),
    "verdict": { "text": "ex: Buy Call...", "color": "green/yellow/red" },
    "trend": "Bullish", "Bearish", or "Neutral",
    "newsSummary": { "text": "A concise 1-2 sentence summary of 5-day news/geopolitics", "color": "green/yellow/red" },
    "analysis": { "text": "A concise 1-2 sentence technical forecast", "color": "green/yellow/red" }
  }`;

    try {
        const response = await aiClient.models.generateContent({
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
            industryPe: jData.industryPe || 0,
            averagePe5Yr: jData.averagePe5Yr || 0,
            forecast1Year: jData.forecast1Year || { text: 'Unknown', color: 'yellow' },
            tomorrowRange: jData.tomorrowRange || 'Unknown',
            emaAnalysis: jData.emaAnalysis || { text: 'Unknown', color: 'yellow' },
            rsiAnalysis: jData.rsiAnalysis || { text: 'Unknown', color: 'yellow' },
            vixThetaAnalysis: jData.vixThetaAnalysis || { text: 'Unknown', color: 'yellow' },
            supportResistanceAnalysis: jData.supportResistanceAnalysis || 'Unknown',
            verdict: jData.verdict || { text: 'Unknown', color: 'yellow' },
            trend: jData.trend || 'Unknown',
            newsSummary: jData.newsSummary || { text: 'No recent news available.', color: 'yellow' },
            analysis: jData.analysis || { text: 'No recent analysis available.', color: 'yellow' }
        };

    } catch (error: any) {
        const duration = Date.now() - t0;
        logger.error('Gemini AI Generation Failed', {
            ticker,
            durationMs: duration,
            error: error.message
        });

        if (error.message?.includes('429') || error.message?.includes('Quota exceeded') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('Gemini API Rate Limit Reached. Please wait ~1 minute before trying again.');
        }

        throw new Error('Failed to generate option analysis');
    }
};

export const generateSimpleAdvice = async (ticker: string): Promise<string> => {
    const t0 = Date.now();
    const aiClient = getAIClient();

    const prompt = `You are a professional Indian Stock Options Strategist AI.

I will provide a stock name listed on NSE.

Analyze the stock for the next 15–25 trading days considering:

• Recent Price Action
• Latest News related to the stock, its sector, and broader index
• Key Events (Earnings, Board Meeting, Dividend)
• Technical Support & Resistance
• Trend & Moving Average Bias
• Sector Momentum
• Macro Drivers (Crude, Rupee, Interest Rates)
• Geopolitical Factors (War, Sanctions, Politics)
• Government Policies / Tariffs
• Company-specific Risks (Fraud, Legal Issues, Management Changes)
• Volatility and Open Interest Sentiment

You must consider any recent breaking news impacting the stock, sector, or index before forming your view.

Now follow these instructions carefully:

Do NOT provide a detailed multi-point breakdown.

Provide ONLY:

The Bullish Case (Call Option) – key supporting points

The Bearish Case (Put Option) – key supporting points

Final Directional Bias – Choose ONE clearly: Call or Put

Suggested Strike Range for next monthly expiry:
• Conservative
• Moderate
• Aggressive

Risk Level – Low / Medium / High (with short reason)

Confidence Score – Out of 10

Formatting Rules:

• Output must be strictly clean HTML markup
• Do NOT use markdown blocks
• Use only these tags: <h3>, <p>, <strong>, <ul>, <li>
• Keep it visually structured and suitable for a web dashboard
• You MUST choose one final primary bias
• Do NOT remain neutral

STOCK NAME: ${ticker}   
    `;

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        logger.info('Gemini AI Simple Advice Success', {
            ticker,
            durationMs: Date.now() - t0
        });

        return response.text || "No advice generated.";
    } catch (error: any) {
        logger.error('Gemini AI Simple Advice Failed', {
            ticker,
            durationMs: Date.now() - t0,
            error: error.message
        });
        if (error.message?.includes('429') || error.message?.includes('Quota exceeded') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('Gemini API Rate Limit Reached. Please wait ~1 minute before trying again.');
        }

        throw new Error('Failed to generate simple advice');
    }
};
