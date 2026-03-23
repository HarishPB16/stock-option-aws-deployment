export const getOptionSuggestionPrompt = (ticker: string, formattedDate: string): string => {
  return `Analyze the stock ticker ${ticker} based on news from the past 5 days and provide an options trading suggestion for the next 15 to 20 days.
    Check always today's date and give me always recent data.
    Verify the data from at least three reliable sources:
    NSE India
    TradingView
    Moneycontrol
    Investing.com   

    Today Date is ${formattedDate}   

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
};

export const getSimpleAdvicePrompt = (ticker: string, formattedDate: string): string => {
  return `
    CRITICAL RULE — DATA ACCURACY

Before doing any analysis you MUST:

• Fetch the latest live price and today's % change

• Verify the price from at least two reliable sources:
NSE India
TradingView
Moneycontrol
Investing.com

Today Date is ${formattedDate}   

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
My Suggestion | Buy Call / Buy Put / None
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
If this stock is have GIFT NIFTY then only give the following table
GIFT NIFTY Stock Name | Date | Points | percentage   

--------------------------------------------------

Formatting Rules:

• Output must be strictly clean HTML markup
• Do NOT use markdown blocks
• Use only these tags: <h3>, <p>, <strong>, <ul>, <li>, <table>, <tr>, <td>
• Keep it visually structured and suitable for a web dashboard
• You MUST choose one final primary bias
• Do NOT remain neutral

--------------------------------------------------

Stock Name: ${ticker}
    `;
};


export const getMarketBriefingPrompt = (formattedDate: string): string => {
  return `
    You are a professional global financial market analyst AI.

    Check always today's date and give me always recent data.
    Verify the data from at least three reliable sources:
    NSE India
    TradingView
    Moneycontrol
    Investing.com 
    
    Today Date is ${formattedDate}    

Generate a structured daily market briefing for the Indian stock market.

STRICT FORMATTING RULES:
    1. Output must be strictly clean HTML markup.
    2. Do NOT use markdown blocks (\`\`\`html).
    3. Every <table> must include these inline styles: 
       "border-collapse: collapse; width: 100%; border: 1px solid #ddd; font-family: sans-serif; margin-bottom: 20px;"
    4. Every <th> and <td> must include these inline styles: 
       "border: 1px solid #ddd; padding: 12px; text-align: left;"
    5. For <th>, add: "background-color: #f4f4f4; font-weight: bold;"

Sections required in the output HTML:

<h2>1. Ten Big News – Indian Market Impact</h2>
Provide a standard <table> with columns: No | News | Date | Sector | Positive/Negative | Reason

<h2>2. Global Market Overview</h2>
Provide a standard <table> with columns: Name | Closed/Open | Down/UP (Points) | Down/UP (%) | Country | Date | Open-Close Time | Market Start (IST) 
Markets to include, in this strict order:
GIFT NIFTY, Nikkei 225, Dow Jones, S&P 500, Nasdaq, FTSE 100, DAX, Shanghai Composite, CAC 40

<h2>3. GIFT NIFTY All Stocks Trend</h2>
Provide a standard <table> with columns: Name | Date | Down/UP (Points) | Down/UP (%)

<h2>4. Option Expiry Table</h2>
Provide a standard <table> with columns: Name | Monthly/Weekly | Day | Date
Include (Only these for next expiry only): NIFTY, BANK NIFTY, SENSEX, FINNIFTY, MIDCPNIFTY,Stock Expiry

<h2>5. Upcoming Indian Stock Market Holidays (NSE/BSE)</h2>
Provide a standard <table> with columns: Holiday | Date | Day
`;
};

export const getTopPicksPrompt = (formattedDate: string): string => {
  return `
    You are an elite Indian Stock Market Options Analyst.
    Today's Date is ${formattedDate}.
    
    Analyze the current Indian F&O equity market momentum, news, and technicals.
    Identify exactly 5 CALL options and 5 PUT options that have the highest probability of success right now.

    CRITICAL RULE - JSON FORMAT ONLY:
    You MUST return ONLY a valid JSON object matching the exact structure below. Do NOT use markdown code blocks (\`\`\`json). Do NOT add conversational text.
    {
      "calls": [
        {
          "ticker": "RELIANCE",
          "strike": "3000",
          "expiry": "28-Mar-2024",
          "premium": "150",
          "reason": "Clear breakout above 200 EMA with heavy volume and bullish sector rotation."
        }
      ],
      "puts": [
        {
          "ticker": "HDFCBANK",
          "strike": "1400",
          "expiry": "28-Mar-2024",
          "premium": "45",
          "reason": "Breaking critical support at 1420 with high short build-up."
        }
      ]
    }
  `;
};
