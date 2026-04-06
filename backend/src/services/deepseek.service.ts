import OpenAI from 'openai';
import logger from '../utils/logger';
import { getOptionSuggestionPrompt, getSimpleAdvicePrompt, getMarketBriefingPrompt } from '../utils/prompts';
import { IOptionInsight } from './gemini.service';

let deepseek: OpenAI | null = null;

const getDeepSeekClient = (): OpenAI => {
    if (!deepseek) {
        try {
            deepseek = new OpenAI({
                baseURL: 'https://integrate.api.nvidia.com/v1',
                apiKey: process.env.DEEPSEEK_API_KEY || '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'
            });
        } catch (err) {
            logger.error('Failed to initialize DeepSeek SDK', { error: err });
            throw new Error('DeepSeek SDK initialization failed');
        }
    }
    return deepseek;
};

function getFormattedDate() {
    return new Date()
        .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        .replace(',', '')
        .replace(/\s/g, '-');
}

export const generateOptionSuggestionDeepSeek = async (ticker: string): Promise<IOptionInsight> => {
    const t0 = Date.now();
    const client = getDeepSeekClient();
    const prompt = getOptionSuggestionPrompt(ticker, getFormattedDate());

    try {
        const response = await client.chat.completions.create({
            model: "deepseek-ai/deepseek-r1-distill-qwen-14b",
            temperature: 0.6,
            top_p: 0.7,
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }]
        });

        const duration = Date.now() - t0;

        logger.info('DeepSeek AI Generation Success', {
            ticker,
            durationMs: duration
        });

        let textOutput = response.choices[0].message.content || "{}";
        
        // Remove reasoning blocks
        textOutput = textOutput.replace(/<think>[\s\S]*?<\/think>/gi, '');
        
        // Secure JSON extraction
        textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = textOutput.indexOf('{');
        const lastBrace = textOutput.lastIndexOf('}');
        let jsonStr = textOutput;
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = textOutput.substring(firstBrace, lastBrace + 1);
        }

        const jData = JSON.parse(jsonStr);

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
        logger.error('DeepSeek AI Generation Failed', {
            ticker,
            durationMs: duration,
            error: error.message
        });

        return {
            action: 'CALL',
            confidence: 0,
            risk: 'API Error',
            support: 0,
            resistance: 0,
            pe: 0,
            industryPe: 0,
            averagePe5Yr: 0,
            forecast1Year: { text: "DeepSeek API Error", color: 'red' },
            tomorrowRange: 'Data Unavailable',
            emaAnalysis: { text: 'DeepSeek API Error', color: 'red' },
            rsiAnalysis: { text: 'DeepSeek API Error', color: 'red' },
            vixThetaAnalysis: { text: 'DeepSeek API Error', color: 'red' },
            supportResistanceAnalysis: 'Data Unavailable',
            verdict: { text: 'DeepSeek API Error', color: 'red' },
            trend: 'Unknown',
            newsSummary: { text: "Error fetching", color: 'red' },
            analysis: { text: 'DeepSeek API Error', color: 'red' }
        };
    }
};

export const generateSimpleAdviceDeepSeek = async (ticker: string): Promise<string> => {
    const t0 = Date.now();
    const client = getDeepSeekClient();
    const prompt = getSimpleAdvicePrompt(ticker, getFormattedDate());

    try {
        const response = await client.chat.completions.create({
            model: "deepseek-ai/deepseek-r1-distill-qwen-14b",
            temperature: 0.6,
            top_p: 0.7,
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }]
        });

        logger.info('DeepSeek AI Simple Advice Success', {
            ticker,
            durationMs: Date.now() - t0
        });

        let textOutput = response.choices[0].message.content || "No advice generated by DeepSeek.";
        textOutput = textOutput.replace(/<think>[\s\S]*?<\/think>/gi, '');
        return textOutput.trim();
    } catch (error: any) {
        logger.error('DeepSeek AI Simple Advice Failed', {
            ticker,
            durationMs: Date.now() - t0,
            error: error.message
        });

        return "### AI Analysis Unavailable\n\nDeepSeek API Error.";
    }
};

export const generateMarketBriefingDeepSeek = async (): Promise<string> => {
    const t0 = Date.now();
    const client = getDeepSeekClient();
    const prompt = getMarketBriefingPrompt(getFormattedDate());

    try {
        const response = await client.chat.completions.create({
            model: "deepseek-ai/deepseek-r1-distill-qwen-14b",
            temperature: 0.6,
            top_p: 0.7,
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }]
        });

        logger.info('DeepSeek AI Market Briefing Success', {
            durationMs: Date.now() - t0
        });

        let textOutput = response.choices[0].message.content || "<div>No briefing generated by DeepSeek.</div>";
        textOutput = textOutput.replace(/<think>[\s\S]*?<\/think>/gi, '');
        textOutput = textOutput.replace(/```html\n?/g, '').replace(/```\n?/g, '');
        return textOutput.trim();
    } catch (error: any) {
        logger.error('DeepSeek AI Market Briefing Failed', {
            durationMs: Date.now() - t0,
            error: error.message
        });

        return `<div class="bg-red-900/20 border border-red-500/30 p-4 rounded-lg my-4 text-center">
            <h3 class="text-red-400 font-bold mb-2">Service Unavailable</h3>
            <p class="text-gray-300">DeepSeek API Error.</p>
        </div>`;
    }
};

export const generateTopPicksDeepSeek = async (): Promise<any> => {
    const t0 = Date.now();
    const client = getDeepSeekClient();
    const { getTopPicksPrompt } = require('../utils/prompts');
    const prompt = getTopPicksPrompt(getFormattedDate());

    try {
        const response = await client.chat.completions.create({
            model: "deepseek-ai/deepseek-r1-distill-qwen-14b",
            temperature: 0.6,
            top_p: 0.7,
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }]
        });

        logger.info('DeepSeek AI Top Picks Success', { durationMs: Date.now() - t0 });
        let textOutput = response.choices[0].message.content || "{}";
        
        // Remove reasoning blocks
        textOutput = textOutput.replace(/<think>[\s\S]*?<\/think>/gi, '');
        
        // Secure JSON extraction
        textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = textOutput.indexOf('{');
        const lastBrace = textOutput.lastIndexOf('}');
        let jsonStr = textOutput;
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = textOutput.substring(firstBrace, lastBrace + 1);
        }
        
        return JSON.parse(jsonStr);
    } catch (error: any) {
        logger.error('DeepSeek AI Top Picks Failed', { durationMs: Date.now() - t0, error: error.message });
        throw new Error('DeepSeek Top Picks Failed: ' + error.message);
    }
};
