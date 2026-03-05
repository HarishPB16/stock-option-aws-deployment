import { GoogleGenAI } from '@google/genai';
import logger from '../utils/logger';
import { getOptionSuggestionPrompt, getSimpleAdvicePrompt, getMarketBriefingPrompt } from '../utils/prompts';

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

function getFormattedDate() {
    return new Date()
        .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        .replace(',', '')
        .replace(/\s/g, '-');
}

export const generateOptionSuggestion = async (ticker: string): Promise<IOptionInsight> => {
    const t0 = Date.now();
    const aiClient = getAIClient();
    const prompt = getOptionSuggestionPrompt(ticker, getFormattedDate());

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
    const prompt = getSimpleAdvicePrompt(ticker, getFormattedDate());

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

export const generateMarketBriefing = async (): Promise<string> => {
    const t0 = Date.now();
    const aiClient = getAIClient();
    const prompt = getMarketBriefingPrompt(getFormattedDate());

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        logger.info('Gemini AI Market Briefing Success', {
            durationMs: Date.now() - t0
        });

        let textOutput = response.text || "<div>No briefing generated.</div>";
        textOutput = textOutput.replace(/```html\n?/g, '').replace(/```\n?/g, '');
        return textOutput;
    } catch (error: any) {
        logger.error('Gemini AI Market Briefing Failed', {
            durationMs: Date.now() - t0,
            error: error.message
        });

        if (error.message?.includes('429') || error.message?.includes('Quota exceeded') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('Gemini API Rate Limit Reached. Please wait ~1 minute before trying again.');
        }

        throw new Error('Failed to generate market briefing');
    }
};
