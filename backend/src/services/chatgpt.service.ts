import OpenAI from 'openai';
import logger from '../utils/logger';
import { getOptionSuggestionPrompt, getSimpleAdvicePrompt, getMarketBriefingPrompt } from '../utils/prompts';
import { IOptionInsight } from './gemini.service'; // Re-use the interface

let openai: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
    if (!openai) {
        try {
            openai = new OpenAI({ 
                baseURL: "https://integrate.api.nvidia.com/v1",
                apiKey: "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"
            });
        } catch (err) {
            logger.error('Failed to initialize OpenAI SDK', { error: err });
            throw new Error('OpenAI SDK initialization failed');
        }
    }
    return openai;
};

function getFormattedDate() {
    return new Date()
        .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        .replace(',', '')
        .replace(/\s/g, '-');
}

export const generateOptionSuggestionChatGPT = async (ticker: string): Promise<IOptionInsight> => {
    const t0 = Date.now();
    const client = getOpenAIClient();
    const prompt = getOptionSuggestionPrompt(ticker, getFormattedDate());

    try {
        const response = await client.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: prompt }],
            temperature: 1,
            top_p: 1,
            max_tokens: 4096
        });

        const duration = Date.now() - t0;

        logger.info('ChatGPT AI Generation Success', {
            ticker,
            durationMs: duration
        });

        let textOutput = response.choices[0].message.content || "{}";
        
        // Secure JSON extraction
        textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
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
        logger.error('ChatGPT AI Generation Failed', {
            ticker,
            durationMs: duration,
            error: error.message
        });

        const errorMessage = error.message || '';
        if (errorMessage.includes('429') || errorMessage.includes('insufficient_quota')) {
            logger.warn('ChatGPT quota exceeded, returning fallback data');
            return {
                action: 'CALL',
                confidence: 0,
                risk: 'API Quota Exceeded. Please check your OpenAI billing balance.',
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
                newsSummary: { text: 'OpenAI Quota Exceeded. Please add credits to your account.', color: 'red' },
                analysis: { text: 'API Rate Limit Reached', color: 'red' }
            };
        }

        throw new Error(`Failed to generate option analysis via ChatGPT: ${error.message}`);
    }
};

export const generateSimpleAdviceChatGPT = async (ticker: string): Promise<string> => {
    const t0 = Date.now();
    const client = getOpenAIClient();
    const prompt = getSimpleAdvicePrompt(ticker, getFormattedDate());

    try {
        const response = await client.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: prompt }],
            temperature: 1,
            top_p: 1,
            max_tokens: 4096
        });

        logger.info('ChatGPT AI Simple Advice Success', {
            ticker,
            durationMs: Date.now() - t0
        });

        return response.choices[0].message.content || "No advice generated by ChatGPT.";
    } catch (error: any) {
        logger.error('ChatGPT AI Simple Advice Failed', {
            ticker,
            durationMs: Date.now() - t0,
            error: error.message
        });

        const errorMessage = error.message || '';
        if (errorMessage.includes('429') || errorMessage.includes('insufficient_quota')) {
            logger.warn('ChatGPT quota exceeded, returning fallback advice');
            return "### AI Analysis Unavailable\n\nOpenAI ChatGPT has reached its API rate limit or has insufficient account balance. Please check your billing dashboard at platform.openai.com.";
        }

        throw new Error(`Failed to generate simple advice via ChatGPT: ${error.message}`);
    }
};

export const generateMarketBriefingChatGPT = async (): Promise<string> => {
    const t0 = Date.now();
    const client = getOpenAIClient();
    const prompt = getMarketBriefingPrompt(getFormattedDate());

    try {
        const response = await client.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: prompt }],
            temperature: 1,
            top_p: 1,
            max_tokens: 4096
        });

        logger.info('ChatGPT AI Market Briefing Success', {
            durationMs: Date.now() - t0
        });

        let textOutput = response.choices[0].message.content || "<div>No briefing generated by ChatGPT.</div>";
        textOutput = textOutput.replace(/```html\n?/g, '').replace(/```\n?/g, '');
        return textOutput;
    } catch (error: any) {
        logger.error('ChatGPT AI Market Briefing Failed', {
            durationMs: Date.now() - t0,
            error: error.message
        });

        const errorMessage = error.message || '';
        if (errorMessage.includes('429') || errorMessage.includes('insufficient_quota')) {
            logger.warn('ChatGPT quota exceeded, returning fallback briefing');
            return `<div class="bg-red-900/20 border border-red-500/30 p-4 rounded-lg my-4 text-center">
                <h3 class="text-red-400 font-bold mb-2">Service Unavailable</h3>
                <p class="text-gray-300">The ChatGPT AI model is currently out of quota. Please check your OpenAI billing balance to generate daily briefings.</p>
            </div>`;
        }

        throw new Error(`Failed to generate market briefing via ChatGPT: ${error.message}`);
    }
};

export const generateTopPicksChatGPT = async (): Promise<any> => {
    const t0 = Date.now();
    const client = getOpenAIClient();
    const { getTopPicksPrompt } = require('../utils/prompts');
    const prompt = getTopPicksPrompt(getFormattedDate());

    try {
        const response = await client.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: prompt }],
            temperature: 1,
            top_p: 1,
            max_tokens: 4096
        });

        logger.info('ChatGPT AI Top Picks Success', { durationMs: Date.now() - t0 });
        let textOutput = response.choices[0].message.content || "{}";
        
        // Secure JSON extraction
        textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = textOutput.indexOf('{');
        const lastBrace = textOutput.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            textOutput = textOutput.substring(firstBrace, lastBrace + 1);
        }

        return JSON.parse(textOutput);
    } catch (error: any) {
        logger.error('ChatGPT AI Top Picks Failed', { durationMs: Date.now() - t0, error: error.message });
        throw new Error('ChatGPT Top Picks Failed: ' + error.message);
    }
};

export const generateTradeSetupChatGPT = async (indexName: string): Promise<string> => {
    const t0 = Date.now();
    const client = getOpenAIClient();
    const { getTradeSetupPrompt } = require('../utils/prompts');
    let prompt = getTradeSetupPrompt(indexName, getFormattedDate());

    prompt += `\n\nCRITICAL: Provide your response ONLY as valid, clean HTML. 
Do not use markdown blocks like \`\`\`html. 
Use semantic HTML tags (e.g., <h3>, <p>, <ul>, <li>, <strong>, <br>). Add some inline styles (like colors for bullish/bearish, spacing, padding) so it looks like a premium, professional dashboard component. Do NOT output raw text. Do NOT wrap the entire thing in <html> or <body>, just output the fragment that can be placed inside an Angular component's innerHTML.

Structure it exactly like this visually:
<h3>Market Sentiment</h3>
<p>(Bullish / Bearish / Neutral)</p>
<h3>Key Levels</h3>
...
<h3>TRADE SETUP</h3>
...
<h3>RISK RULES</h3>
...
<h3>Confidence Score:</h3>`;

    try {
        const response = await client.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: prompt }],
            temperature: 1,
            top_p: 1,
            max_tokens: 4096
        });

        logger.info('ChatGPT AI Trade Setup Success', { durationMs: Date.now() - t0, indexName });
        let textOutput = response.choices[0].message.content || "<div>No trade setup generated by ChatGPT.</div>";
        textOutput = textOutput.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
        return textOutput;
    } catch (error: any) {
        logger.error('ChatGPT AI Trade Setup Failed', { durationMs: Date.now() - t0, error: error.message, indexName });

        const errorMessage = error.message || '';
        if (errorMessage.includes('429') || errorMessage.includes('insufficient_quota')) {
            return `<div class="error-msg">ChatGPT Quota Exceeded. Please try again later.</div>`;
        }

        throw new Error(\`Failed to generate trade setup via ChatGPT: \${error.message}\`);
    }
};

