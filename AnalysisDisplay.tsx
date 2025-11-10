import React from 'react';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { TrendingDownIcon } from './icons/TrendingDownIcon';
import { NeutralIcon } from './icons/NeutralIcon';
import { AnalysisResult, MACDResult } from '../types';

interface AnalysisDisplayProps {
  analysis: AnalysisResult | null;
  rsi: number | null;
  macd: MACDResult | null;
}

const getPredictionStyle = (prediction: 'RISE' | 'FALL' | 'STABLE' | undefined) => {
    switch (prediction) {
        case 'RISE': return { bg: 'bg-green-900/50', border: 'border-green-700', text: 'text-green-300', icon: <TrendingUpIcon className="w-8 h-8"/> };
        case 'FALL': return { bg: 'bg-red-900/50', border: 'border-red-700', text: 'text-red-300', icon: <TrendingDownIcon className="w-8 h-8"/> };
        default: return { bg: 'bg-gray-700/50', border: 'border-gray-600', text: 'text-gray-300', icon: <NeutralIcon className="w-8 h-8" /> };
    }
};

const getSentimentStyle = (sentiment: 'Bullish' | 'Bearish' | 'Neutral' | undefined) => {
    switch (sentiment) {
        case 'Bullish': return { text: 'text-green-400', icon: <TrendingUpIcon className="w-5 h-5 mr-2"/> };
        case 'Bearish': return { text: 'text-red-400', icon: <TrendingDownIcon className="w-5 h-5 mr-2"/> };
        default: return { text: 'text-gray-400', icon: <NeutralIcon className="w-5 h-5 mr-2" /> };
    }
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, rsi, macd }) => {
  if (!analysis) {
    return (
        <div className="p-6 flex flex-col justify-center items-center h-full text-center">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Technical Analysis</h2>
            <p className="text-gray-400">Analysis will appear here once you search for a stock.</p>
        </div>
    );
  }

  const { prediction, confidence, reasoning, estimated_price, market_sentiment } = analysis;
  const predStyles = getPredictionStyle(prediction);
  const sentStyles = getSentimentStyle(market_sentiment);

  const formatCurrency = (value: number) => {
     return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  }

  return (
    <div className="flex flex-col h-full">
        <h2 className="text-xl font-bold text-gray-100 mb-4 text-center">Technical Analysis</h2>

        <div className={`p-4 rounded-lg border ${predStyles.border} ${predStyles.bg} mb-4`}>
            <div className="flex items-center justify-between">
                <span className={`text-lg font-bold uppercase ${predStyles.text}`}>{prediction}</span>
                {predStyles.icon}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: `${confidence * 100}%` }}></div>
            </div>
            <p className="text-right text-sm text-gray-400 mt-1">Confidence: {(confidence * 100).toFixed(0)}%</p>
        </div>
        
        <div className="space-y-3 text-gray-300 flex-grow">
            <div>
                <h3 className="font-semibold text-gray-100">Market Sentiment:</h3>
                 <p className={`text-sm font-bold flex items-center ${sentStyles.text}`}>
                    {sentStyles.icon}
                    {market_sentiment}
                </p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-100">Reasoning:</h3>
                <p className="text-sm text-gray-400">{reasoning}</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-100">Estimated Price:</h3>
                <p className="text-sm text-cyan-400 font-bold">{formatCurrency(estimated_price)}</p>
            </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
             <h3 className="font-semibold text-gray-100 mb-2 text-center">Technical Indicators</h3>
             <div className="grid grid-cols-2 gap-2 text-sm text-center">
                <div className="bg-gray-700/40 p-2 rounded">
                    <p className="text-xs text-gray-400">RSI (14)</p>
                    <p className="font-bold text-lg">{rsi ? rsi.toFixed(1) : 'N/A'}</p>
                </div>
                 <div className="bg-gray-700/40 p-2 rounded">
                    <p className="text-xs text-gray-400">MACD Hist.</p>
                    <p className={`font-bold text-lg ${macd && macd.histogram > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {macd ? macd.histogram.toFixed(2) : 'N/A'}
                    </p>
                </div>
             </div>
        </div>
    </div>
  );
};

export default AnalysisDisplay;