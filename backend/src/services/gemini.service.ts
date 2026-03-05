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
    Check always today's date and give me always recent data.
    Verify the data from at least three reliable sources:
    NSE India
    TradingView
    Moneycontrol
    Investing.com   

    Today Date is ${getFormattedDate()}   

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

    const prompt = `
    CRITICAL RULE — DATA ACCURACY

Before doing any analysis you MUST:

• Fetch the latest live price and today's % change

• Verify the price from at least two reliable sources:
NSE India
TradingView
Moneycontrol
Investing.com

Today Date is ${getFormattedDate()}   

• Ensure the price is from the current trading day.

Use this verified price for all calculations.

If reliable data cannot be verified, respond:
"Unable to verify latest market data. Analysis aborted."

--------------------------------------------------

GLOBAL MARKET SHOCK DETECTION (VERY IMPORTANT)

Before analyzing stock-specific news, check if any major global macro event occurred in the last 7 days.

Examples:

• War or geopolitical conflict
• Strait of Hormuz disruption
• OPEC production decisions
• Crude oil spike (>3%)
• Global market crash (>2%)
• Federal Reserve or RBI rate decisions
• USD/INR sharp movement
• Commodity price spikes (Oil, Steel, Copper)

If detected:

• Treat this as HIGH PRIORITY news
• Include it in the News Impact table even if the stock name is not mentioned.

--------------------------------------------------

SECTOR DRIVER ANALYSIS (MANDATORY)

Identify the main economic driver of the stock's sector.

Examples:

Oil stocks → Crude oil prices  
Metal stocks → Steel / Copper prices  
Banking → Interest rates  
IT → US tech demand  
Auto → Consumer demand / interest rates  
Pharma → USFDA / drug approvals  

Analyze whether the sector driver is bullish or bearish.

--------------------------------------------------

INTERNAL TECHNICAL ANALYSIS (DO NOT SHOW)

Analyze internally using:

Technical Indicators:

• 20 EMA  
• 50 EMA  
• 200 EMA  
• RSI (14)  
• Volume trend  

Support & Resistance using:

• Recent swing highs/lows  
• Moving averages  
• Option chain levels  

Option Chain Analysis:

• Highest Call OI  
• Highest Put OI  
• OI build-up  
• Max Pain level  

Sector momentum.

--------------------------------------------------

NEWS ANALYSIS (MANDATORY)

Search the latest 7–10 news articles.

You MUST read news from at least 5 reliable financial news websites:

• Reuters  
• Bloomberg  
• CNBC  
• Moneycontrol  
• Economic Times (ET Markets)

Steps:

Collect 7–10 recent news articles  
Remove duplicate or irrelevant news  
Select only news that can impact the stock price  

Classify each as:

• Bullish  
• Bearish  
• Neutral  

Priority order when selecting news:

1️⃣ Global macro events affecting the sector  
2️⃣ Sector news  
3️⃣ Company-specific news  

--------------------------------------------------

FINAL OUTPUT FORMAT (SHOW ONLY THIS)

Do NOT show internal analysis tables.

Decision Summary

Category | Suggestion
Your Suggestion | Buy Call / Buy Put / None
Overall | Buy Call / Buy Put / None
News | Buy Call / Buy Put / None
Technical | Buy Call / Buy Put / None
Confidence Score – Out of 10

--------------------------------------------------

Option Strategy (15–20 Trading Days)

Recommendation | Strike | Entry Range | Target | Stop Loss

Recommendation must be one of:

BUY CALL  
BUY PUT  
NO TRADE  

Rules:

• Use ATM or slightly ITM options only  
• Avoid far OTM options  
• Prefer highest liquidity strikes  

--------------------------------------------------

Key Levels (Today)

Level | Price
Support 1 |
Support 2 |
Resistance 1 |
Resistance 2 |

--------------------------------------------------

Technical Analysis Summary

Provide 3–4 bullet points only

Example format:

• Price trading above/below key EMAs  
• RSI showing bullish/bearish momentum  
• Volume confirming trend strength  
• Option chain indicating support/resistance zone  

--------------------------------------------------

News Impact

Show only the most relevant news affecting the stock or sector.

Date | News | Impact

Impact values:

Bullish  
Bearish  
Neutral  

If nothing relevant:

"No major stock-specific news impacting the price."

--------------------------------------------------

Important Output Rules

Do NOT show:

• EMA tables  
• RSI tables  
• Option chain tables  
• Data verification tables  

These are for internal analysis only.

Focus strictly on the next 15–20 trading days.

--------------------------------------------------

Formatting Rules:

• Output must be strictly clean HTML markup
• Do NOT use markdown blocks
• Use only these tags: <h3>, <p>, <strong>, <ul>, <li>
• Keep it visually structured and suitable for a web dashboard
• You MUST choose one final primary bias
• Do NOT remain neutral

--------------------------------------------------

Stock Name: ${ticker}
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

function getFormattedDate() {
    return new Date()
        .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        .replace(',', '')
        .replace(/\s/g, '-');
}

export const generateMarketBriefing = async (): Promise<string> => {
    const t0 = Date.now();
    const aiClient = getAIClient();

    const prompt = `
    You are a professional global financial market analyst AI.

    Check always today's date and give me always recent data.
    Verify the data from at least three reliable sources:
    NSE India
    TradingView
    Moneycontrol
    Investing.com 
    
    Today Date is ${getFormattedDate()}    

Generate a structured daily market briefing for the Indian stock market.

Provide the output strictly in HTML. Do NOT use markdown formatting outside the HTML tags.
Use a clean, beautiful, and modern HTML structure using standard HTML tables.
Ensure it is concise and formatted for financial dashboards.
Apply inline styles or standard CSS classes for up (green color) and down (red color) values where applicable.

Sections required in the output HTML:

<h2>1. Ten Big News – Indian Market Impact</h2>
Provide a standard <table> with columns: No | News | Date | Sector | Impact

<h2>2. Global Market Overview</h2>
Provide a standard <table> with columns: Name | Country | Date | Open-Close Time | Market Start (IST) | Down/UP (Points) | Down/UP (%)
Markets to include, in this strict order:
GIFT NIFTY, Nikkei 225, Dow Jones, S&P 500, Nasdaq, FTSE 100, DAX, Shanghai Composite, CAC 40

<h2>3. GIFT NIFTY All Stocks Trend</h2>
Provide a standard <table> with columns: Name | Date | Down/UP (Points) | Down/UP (%)

<h2>4. Option Expiry Table</h2>
Provide a standard <table> with columns: Name | Monthly/Weekly | Day | Date
Include: NIFTY, BANK NIFTY, SENSEX, FINNIFTY, MIDCPNIFTY

<h2>5. Upcoming Indian Stock Market Holidays (NSE/BSE)</h2>
Provide a standard <table> with columns: Holiday | Date | Day
`;

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
