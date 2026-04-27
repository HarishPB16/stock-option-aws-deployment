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
                tools: [
                    {
                        googleSearch: {}
                    }
                ]
            }
        });

        const duration = Date.now() - t0;

        logger.info('Gemini AI Generation Success', {
            ticker,
            durationMs: duration
        });

        let textOutput = response.text || "{}";

        // --- FIX: Remove markdown code blocks ---
        textOutput = textOutput
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        // --- FIX: Extract JSON object safely ---
        const firstBrace = textOutput.indexOf('{');
        const lastBrace = textOutput.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            textOutput = textOutput.substring(firstBrace, lastBrace + 1);
        }

        const jData = JSON.parse(textOutput);

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

        const errorMessage = error.message || '';
        if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            logger.warn('Gemini quota exceeded, returning fallback data');
            return {
                action: 'CALL',
                confidence: 0,
                risk: 'API Quota Exceeded. Please check your billing or wait for the free tier to reset.',
                support: 0,
                resistance: 0,
                pe: 0,
                industryPe: 0,
                averagePe5Yr: 0,
                forecast1Year: { text: 'API Rate Limit Reached', color: 'red' },
                tomorrowRange: 'Data Unavailable',
                emaAnalysis: { text: 'API Rate Limit Reached', color: 'red' },
                rsiAnalysis: { text: 'API Rate Limit Reached', color: 'red' },
                vixThetaAnalysis: { text: 'API Rate Limit Reached', color: 'red' },
                supportResistanceAnalysis: 'Data Unavailable',
                verdict: { text: 'API Rate Limit Reached', color: 'red' },
                trend: 'Unknown',
                newsSummary: { text: 'Gemini Quota Exceeded. Wait ~1 minute or upgrade billing.', color: 'red' },
                analysis: { text: 'API Rate Limit Reached', color: 'red' }
            };
        }

        throw new Error('Failed to generate option analysis: ' + error.message);
    }
};

export const generateSimpleAdvice = async (ticker: string): Promise<string> => {
    const t0 = Date.now();
    const aiClient = getAIClient();
    const prompt = getSimpleAdvicePrompt(ticker, getFormattedDate());

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            // --- ADDED TOOLS SECTION ---
            config: {
                tools: [
                    {
                        googleSearch: {} // Enables real-time Google Search grounding
                    }
                ]
            }
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
        const errorMessage = error.message || '';
        if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            logger.warn('Gemini quota exceeded, returning fallback advice');
            return "### AI Analysis Unavailable\n\nGoogle Gemini has reached its API rate limit or quota max. Please wait a few moments or upgrade your linked Google Cloud billing account to process more requests.";
        }

        throw new Error('Failed to generate simple advice: ' + error.message);
    }
};

export const generateMarketBriefing = async (): Promise<string> => {
    const t0 = Date.now();
    const aiClient = getAIClient();
    const prompt = getMarketBriefingPrompt(getFormattedDate());

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            // --- ADDED TOOLS SECTION ---
            config: {
                tools: [
                    {
                        googleSearch: {} // Enables real-time Google Search grounding
                    }
                ]
            }
        });

        logger.info('Gemini AI Market Briefing Success', {
            durationMs: Date.now() - t0
        });

        // Use response.text() as a function or property depending on your SDK version
        let textOutput = response.text || "<div>No briefing generated.</div>";

        // Clean up markdown artifacts
        textOutput = textOutput.replace(/```html\n?/g, '').replace(/```\n?/g, '');
        return textOutput;
    } catch (error: any) {
        logger.error('Gemini AI Market Briefing Failed', {
            durationMs: Date.now() - t0,
            error: error.message
        });

        const errorMessage = error.message || '';
        if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            logger.warn('Gemini quota exceeded, returning fallback briefing');
            return `<div class="bg-red-900/20 border border-red-500/30 p-4 rounded-lg my-4 text-center">
                <h3 class="text-red-400 font-bold mb-2">Service Unavailable</h3>
                <p class="text-gray-300">The Gemini AI model is currently out of quota. The daily market briefing could not be generated.</p>
            </div>`;
        }

        throw new Error('Failed to generate market briefing: ' + error.message);
    }
};

export const generateTopPicks = async (): Promise<any> => {
    const t0 = Date.now();
    const aiClient = getAIClient();
    // Assuming getTopPicksPrompt is imported. If not, we will fix imports later, but let's assume it's imported dynamically or we add it to the import block.
    // Wait, import is at the top of the file! I must also update the import statement!
    const { getTopPicksPrompt } = require('../utils/prompts');
    const prompt = getTopPicksPrompt(getFormattedDate());

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });

        logger.info('Gemini AI Top Picks Success', { durationMs: Date.now() - t0 });
        let textOutput = response.text || "{}";
        textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = textOutput.indexOf('{');
        const lastBrace = textOutput.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            textOutput = textOutput.substring(firstBrace, lastBrace + 1);
        }
        return JSON.parse(textOutput);
    } catch (error: any) {
        logger.error('Gemini AI Top Picks Failed', { durationMs: Date.now() - t0, error: error.message });
        throw new Error('Gemini Top Picks Failed: ' + error.message);
    }
};

export const generateTradeSetup = async (indexName: string): Promise<string> => {
    const t0 = Date.now();
    const aiClient = getAIClient();
    const { getTradeSetupPrompt } = require('../utils/prompts');
    const prompt = getTradeSetupPrompt(indexName, getFormattedDate());

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });

        logger.info('Gemini AI Trade Setup Success', { durationMs: Date.now() - t0, indexName });
        let textOutput = response.text || "<div>No trade setup generated.</div>";
        textOutput = textOutput.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
        return textOutput;
    } catch (error: any) {
        logger.error('Gemini AI Trade Setup Failed', { durationMs: Date.now() - t0, error: error.message, indexName });
        const errorMessage = error.message || '';
        if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            return `<div class="error-msg">Gemini AI Quota Exceeded. Please try again later.</div>`;
        }
        throw new Error('Gemini Trade Setup Failed: ' + error.message);
    }
};
