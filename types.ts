export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AnalysisResult {
  prediction: 'RISE' | 'FALL' | 'STABLE';
  confidence: number;
  reasoning: string;
  estimated_price: number;
  market_sentiment: 'Bullish' | 'Bearish' | 'Neutral';
}

export interface NewsItem {
  headline: string;
  url: string;
  impact: string;
  impact_type: 'Positive' | 'Negative' | 'Neutral';
}

export interface NewsAnalysisResult {
  sentiment: 'Very Positive' | 'Positive' | 'Neutral' | 'Negative' | 'Very Negative';
  sentiment_score: number; // -1.0 to 1.0
  summary: string;
  news_items: NewsItem[];
}

export interface TopPerformer {
  symbol: string;
  price: number;
  change_percent: number;
  prediction: 'RISE' | 'FALL' | 'STABLE';
}

export interface StockToBuy {
    symbol: string;
    price: number;
    confidence: number;
    predicted_return_percent: number;
    reason: string;
}

export interface MACDResult {
  MACD: number;
  signal: number;
  histogram: number;
}

export type Feedback = 'correct' | 'incorrect';