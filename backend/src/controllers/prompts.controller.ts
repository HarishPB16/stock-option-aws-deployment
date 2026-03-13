import { Request, Response } from 'express';
import { getOptionSuggestionPrompt, getSimpleAdvicePrompt, getMarketBriefingPrompt } from '../utils/prompts';

export const generatePrompt = async (req: Request, res: Response) => {
    try {
        const { type, ticker, date } = req.body;

        if (!type) {
            return res.status(400).json({ success: false, message: "Prompt 'type' is required." });
        }

        // Validate date
        let targetDate = new Date();
        if (date) {
            targetDate = new Date(date);
            if (isNaN(targetDate.getTime())) {
                return res.status(400).json({ success: false, message: "Invalid date format provided." });
            }
        }

        const formattedDate = targetDate.toISOString().split('T')[0];
        let compiledPrompt = "";

        switch (type) {
            case 'suggestion':
                if (!ticker) return res.status(400).json({ success: false, message: "Ticker is required for suggestion prompts." });
                compiledPrompt = getOptionSuggestionPrompt(ticker, formattedDate);
                break;
            case 'advice':
                if (!ticker) return res.status(400).json({ success: false, message: "Ticker is required for advice prompts." });
                compiledPrompt = getSimpleAdvicePrompt(ticker, formattedDate);
                break;
            case 'market_briefing':
                compiledPrompt = getMarketBriefingPrompt(formattedDate);
                break;
            default:
                return res.status(400).json({ success: false, message: "Invalid prompt type." });
        }

        // Strip HTML specific formatting rules from the generated prompt
        // since the user is copying it to another AI tool instead of our own frontend UI.

        const formatRuleRegexSuggestion = /You MUST return ONLY a valid JSON object matching the exact structure below, without any markdown formatting or extra text:[\s\S]*?(?=})/i;
        compiledPrompt = compiledPrompt.replace(formatRuleRegexSuggestion, "Provide your analysis in a clear, readable text format.\n");
        compiledPrompt = compiledPrompt.replace("}`", "`"); // Remove the trailing JSON brace

        const formatRuleRegexAdvice = /--------------------------------------------------\s*Formatting Rules:[\s\S]*?(?=--------------------------------------------------)/i;
        compiledPrompt = compiledPrompt.replace(formatRuleRegexAdvice, "");

        const formatRuleRegexMarket = /STRICT FORMATTING RULES:[\s\S]*?(?=Sections required in the output HTML:)/i;
        compiledPrompt = compiledPrompt.replace(formatRuleRegexMarket, "");

        // General cleanup of HTML references
        compiledPrompt = compiledPrompt.replace(/output HTML/gi, "output");
        compiledPrompt = compiledPrompt.replace(/clean HTML markup/gi, "clean markdown");

        res.status(200).json({
            success: true,
            data: {
                prompt: compiledPrompt,
            }
        });
    } catch (error) {
        console.error("Generate Prompt error:", error);
        res.status(500).json({ success: false, message: "Server error generating prompt." });
    }
};
