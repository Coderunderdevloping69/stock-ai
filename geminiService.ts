import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, NewsAnalysisResult, StockDataPoint, TopPerformer, StockToBuy, Feedback } from '../types';

// Per guidelines, initialize once.
// The API key MUST be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisResultSchema = {
    type: Type.OBJECT,
    properties: {
      prediction: { type: Type.STRING, enum: ['RISE', 'FALL', 'STABLE'], description: "The predicted direction of the stock price." },
      confidence: { type: Type.NUMBER, description: "Confidence level of the prediction, from 0.0 to 1.0." },
      reasoning: { type: Type.STRING, description: "A detailed explanation for the prediction, based on technical indicators and data patterns." },
      estimated_price: { type: Type.NUMBER, description: "The estimated target price for the stock in the short term." },
      market_sentiment: { type: Type.STRING, enum: ['Bullish', 'Bearish', 'Neutral'], description: "The overall market sentiment derived from the data." },
    },
    required: ['prediction', 'confidence', 'reasoning', 'estimated_price', 'market_sentiment'],
};

const newsAnalysisResultSchema = {
    type: Type.OBJECT,
    properties: {
      sentiment: { type: Type.STRING, enum: ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative'], description: "Overall sentiment from the news headlines." },
      sentiment_score: { type: Type.NUMBER, description: "A score from -1.0 (very negative) to 1.0 (very positive)." },
      summary: { type: Type.STRING, description: "A brief summary of the key news affecting the stock." },
      news_items: {
        type: Type.ARRAY,
        description: "A list of relevant news articles.",
        items: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: "The news article headline." },
            url: { type: Type.STRING, description: "A placeholder URL for the article." },
            impact: { type: Type.STRING, description: "A short description of the news's potential impact on the stock." },
            impact_type: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'], description: "The classified impact type." },
          },
          required: ['headline', 'url', 'impact', 'impact_type'],
        },
      },
    },
    required: ['sentiment', 'sentiment_score', 'summary', 'news_items'],
};

const topPerformersSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            symbol: { type: Type.STRING },
            price: { type: Type.NUMBER },
            change_percent: { type: Type.NUMBER },
            prediction: { type: Type.STRING, enum: ['RISE', 'FALL', 'STABLE'] },
        },
        required: ['symbol', 'price', 'change_percent', 'prediction'],
    }
}

const stocksToBuySchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            symbol: { type: Type.STRING },
            price: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            predicted_return_percent: { type: Type.NUMBER },
            reason: { type: Type.STRING },
        },
        required: ['symbol', 'price', 'confidence', 'predicted_return_percent', 'reason'],
    }
}

const parseJsonResponse = <T>(jsonString: string): T => {
    try {
        // As per guidelines, the response text might have markdown.
        const cleanedString = jsonString.trim().replace(/^```json/, '').replace(/```$/, '').trim();
        return JSON.parse(cleanedString) as T;
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonString);
        throw new Error("The AI returned an invalid analysis format. Please try again.");
    }
}

export const analyzeStockData = async (symbol: string, exchange: 'NSE' | 'BSE', data: StockDataPoint[], feedback?: Feedback): Promise<AnalysisResult> => {
    const dataSummary = data.slice(-30).map(d => `Date: ${d.date}, Close: ${d.close}, Volume: ${d.volume}`).join('\n');
    
    let prompt = `Analyze the recent historical stock data for ${symbol} (${exchange}) and predict its short-term trend.
    Focus on price action, volume, and key patterns.
    The last 30 days of data are:
    ${dataSummary}
    
    Provide a prediction ('RISE', 'FALL', 'STABLE'), a confidence score (0.0 to 1.0), a concise reasoning (2-3 sentences), an estimated target price, and the overall market sentiment ('Bullish', 'Bearish', 'Neutral').
    `;

    if(feedback) {
        prompt += `\n\nUser feedback on a previous prediction for this stock was: '${feedback}'. Take this into account. If the feedback was 'incorrect', re-evaluate your analysis method for this stock. If it was 'correct', reinforce the patterns you identified.`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisResultSchema,
        }
    });
    
    return parseJsonResponse<AnalysisResult>(response.text);
}

export const analyzeNewsForStock = async (symbol: string, exchange: 'NSE' | 'BSE'): Promise<NewsAnalysisResult> => {
    // In a real app, we'd fetch live news. Here we simulate it.
    const prompt = `
    You are a financial news analyst. Generate a simulated but realistic news sentiment analysis for the stock ${symbol} (${exchange}).
    Create 3-5 recent, plausible-sounding news headlines. For each headline, provide a dummy URL, a brief summary of its impact, and classify the impact as 'Positive', 'Negative', or 'Neutral'.
    Based on these headlines, determine an overall market sentiment ('Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative'), a sentiment score (-1.0 to 1.0), and a concise summary of the news landscape.
    Ensure the generated news is diverse and reflects typical financial events (e.g., earnings reports, sector news, macroeconomic factors, company-specific news).
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: newsAnalysisResultSchema,
        }
    });

    return parseJsonResponse<NewsAnalysisResult>(response.text);
}

export const fetchMarketHighlights = async (): Promise<{ topPerformers: TopPerformer[], stocksToBuy: StockToBuy[] }> => {
    const performersPrompt = `
        Generate a list of 10 simulated "Top Performers" from the Indian stock market (NSE/BSE) for today.
        For each stock, provide its symbol, a realistic current price, its percentage change for the day, and a predicted short-term trend ('RISE', 'FALL', 'STABLE').
        Make the data look authentic and diverse, including significant gainers.
    `;
    const toBuyPrompt = `
        You are an AI with a predictive model optimized to identify stocks with the highest potential for short-term profit. Your model analyzes technical breakouts, news catalysts, and market sentiment to find high-momentum opportunities.
        Generate a list of 10 "Stocks to Buy" from the Indian stock market (NSE/BSE).
        For each stock, provide its symbol, a realistic current price, your confidence level (0.0 to 1.0) in its potential, the predicted return percentage for the next month, and a brief, compelling reason.
        The reason MUST explain *why your profit-maximization model selected this stock* (e.g., "Strong technical breakout on high volume," "Positive earnings surprise expected," "Benefiting from recent favorable government policy").
    `;

    const [performersResponse, toBuyResponse] = await Promise.all([
        ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: performersPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: topPerformersSchema,
            }
        }),
        ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: toBuyPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: stocksToBuySchema,
            }
        })
    ]);
    
    const topPerformers = parseJsonResponse<TopPerformer[]>(performersResponse.text);
    const stocksToBuy = parseJsonResponse<StockToBuy[]>(toBuyResponse.text);

    return { topPerformers, stocksToBuy };
}

export const analyzeCustomStockData = async (csvData: string, symbol: string, exchange: 'NSE' | 'BSE'): Promise<{ analysis: AnalysisResult, news: NewsAnalysisResult }> => {
    const analysisPrompt = `
        A user has provided the following custom stock data in CSV format for a stock they've labeled "${symbol} (${exchange})".
        CSV Data:
        \`\`\`csv
        ${csvData}
        \`\`\`
        Analyze this data as if it were real historical stock data. Predict its short-term trend.
        Provide a prediction ('RISE', 'FALL', 'STABLE'), a confidence score (0.0 to 1.0), a concise reasoning (2-3 sentences), an estimated target price, and the overall market sentiment ('Bullish', 'Bearish', 'Neutral').
    `;

    const newsPrompt = `
        Based on the technical analysis of the custom data for "${symbol} (${exchange})", generate a plausible, simulated news analysis that could accompany such a trend.
        Create 2-3 relevant, fictional news headlines. For each, provide a dummy URL, a brief summary of its impact, and classify the impact as 'Positive', 'Negative', or 'Neutral'.
        Then, provide an overall sentiment, sentiment score, and summary.
    `;

    const [analysisResponse, newsResponse] = await Promise.all([
        ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: analysisPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisResultSchema,
            }
        }),
        ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: newsPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: newsAnalysisResultSchema,
            }
        })
    ]);

    const analysis = parseJsonResponse<AnalysisResult>(analysisResponse.text);
    const news = parseJsonResponse<NewsAnalysisResult>(newsResponse.text);

    return { analysis, news };
}