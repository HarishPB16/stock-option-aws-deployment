import Anthropic from '@anthropic-ai/sdk';
import logger from '../utils/logger';
import { getOptionSuggestionPrompt, getSimpleAdvicePrompt, getMarketBriefingPrompt } from '../utils/prompts';
import { IOptionInsight } from './gemini.service';

let anthropic: Anthropic | null = null;

const getAnthropicClient = (): Anthropic => {
    if (!anthropic) {
        try {
            anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key_for_build' });
        } catch (err) {
            logger.error('Failed to initialize Anthropic SDK', { error: err });
            throw new Error('Anthropic SDK initialization failed');
        }
    }
    return anthropic;
};

function getFormattedDate() {
    return new Date()
        .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        .replace(',', '')
        .replace(/\s/g, '-');
}

export const generateOptionSuggestionClaude = async (ticker: string): Promise<IOptionInsight> => {
    const t0 = Date.now();
    const client = getAnthropicClient();
    const prompt = getOptionSuggestionPrompt(ticker, getFormattedDate());

    try {
        const response = await client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }]
        });

        const duration = Date.now() - t0;

        logger.info('Claude AI Generation Success', {
            ticker,
            durationMs: duration
        });

        // Parse JSON from text block response
        let textOutput = "";
        for (const block of response.content) {
            if (block.type === 'text') {
                textOutput += block.text;
            }
        }

        // Find JSON object if it's wrapped in block or has preceeding text
        const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) textOutput = jsonMatch[0];

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
        logger.error('Claude AI Generation Failed', {
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
            forecast1Year: { text: "Claude API Error", color: 'red' },
            tomorrowRange: 'Data Unavailable',
            emaAnalysis: { text: 'Claude API Error', color: 'red' },
            rsiAnalysis: { text: 'Claude API Error', color: 'red' },
            vixThetaAnalysis: { text: 'Claude API Error', color: 'red' },
            supportResistanceAnalysis: 'Data Unavailable',
            verdict: { text: 'Claude API Error', color: 'red' },
            trend: 'Unknown',
            newsSummary: { text: "Error fetching from Claude", color: 'red' },
            analysis: { text: 'Claude API Error', color: 'red' }
        };
    }
};

export const generateSimpleAdviceClaude = async (ticker: string): Promise<string> => {
    const t0 = Date.now();
    const client = getAnthropicClient();
    const prompt = getSimpleAdvicePrompt(ticker, getFormattedDate());

    try {
        const response = await client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }]
        });

        logger.info('Claude AI Simple Advice Success', {
            ticker,
            durationMs: Date.now() - t0
        });

        let textOutput = "";
        for (const block of response.content) {
            if (block.type === 'text') {
                textOutput += block.text;
            }
        }
        return textOutput || "No advice generated by Claude.";
    } catch (error: any) {
        logger.error('Claude AI Simple Advice Failed', {
            ticker,
            durationMs: Date.now() - t0,
            error: error.message
        });

        return "### AI Analysis Unavailable\n\nClaude API Error.";
    }
};

export const generateMarketBriefingClaude = async (): Promise<string> => {
    const t0 = Date.now();
    const client = getAnthropicClient();
    const prompt = getMarketBriefingPrompt(getFormattedDate());

    try {
        const response = await client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }]
        });

        logger.info('Claude AI Market Briefing Success', {
            durationMs: Date.now() - t0
        });

        let textOutput = "";
        for (const block of response.content) {
            if (block.type === 'text') {
                textOutput += block.text;
            }
        }
        textOutput = textOutput.replace(/```html\n?/g, '').replace(/```\n?/g, '');
        return textOutput || "<div>No briefing generated by Claude.</div>";
    } catch (error: any) {
        logger.error('Claude AI Market Briefing Failed', {
            durationMs: Date.now() - t0,
            error: error.message
        });

        return `<div class="bg-red-900/20 border border-red-500/30 p-4 rounded-lg my-4 text-center">
            <h3 class="text-red-400 font-bold mb-2">Service Unavailable</h3>
            <p class="text-gray-300">Claude API Error.</p>
        </div>`;
    }
};

export const generateTopPicksClaude = async (): Promise<any> => {
    const t0 = Date.now();
    const client = getAnthropicClient();
    const { getTopPicksPrompt } = require('../utils/prompts');
    const prompt = getTopPicksPrompt(getFormattedDate()) + "\n\nCRITICAL: Respond ONLY with the raw JSON object. Do NOT wrap it in markdown block. Start immediately with { and end with }.";

    try {
        const response = await client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }]
        });

        logger.info('Claude AI Top Picks Success', { durationMs: Date.now() - t0 });
        let textOutput = "";
        for (const block of response.content) {
            if (block.type === 'text') {
                textOutput += block.text;
            }
        }
        
        const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) textOutput = jsonMatch[0];
        
        return JSON.parse(textOutput);
    } catch (error: any) {
        logger.error('Claude AI Top Picks Failed', { durationMs: Date.now() - t0, error: error.message });
        throw new Error('Claude Top Picks Failed: ' + error.message);
    }
};

export const generateTradeSetupClaude = async (indexName: string): Promise<string> => {
    const t0 = Date.now();
    const client = getAnthropicClient();
    const { getTradeSetupPrompt } = require('../utils/prompts');
    const prompt = getTradeSetupPrompt(indexName, getFormattedDate());

    try {
        const response = await client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }]
        });

        logger.info('Claude AI Trade Setup Success', { durationMs: Date.now() - t0, indexName });
        let textOutput = "";
        for (const block of response.content) {
            if (block.type === 'text') {
                textOutput += block.text;
            }
        }
        textOutput = textOutput.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
        return textOutput || "<div>No trade setup generated by Claude.</div>";
    } catch (error: any) {
        logger.error('Claude AI Trade Setup Failed', { durationMs: Date.now() - t0, error: error.message, indexName });
        return `<div class="error-msg">Claude API Error. Please try again later.</div>`;
    }
};

