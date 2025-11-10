import React, { useState } from 'react';
import { AnalysisResult, NewsAnalysisResult, Feedback } from '../types';
import AnalysisDisplay from './AnalysisDisplay';
import NewsAnalysis from './NewsAnalysis';
import Loader from './Loader';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';

interface AITrainingCenterProps {
  symbol: string;
  analysis: AnalysisResult | null;
  feedback?: Feedback;
  onFeedback: (symbol: string, feedback: Feedback) => void;
  onAnalyzeCustomData: (data: string, symbol: string) => void;
  customAnalysisResult: { analysis: AnalysisResult, news: NewsAnalysisResult } | null;
  isCustomLoading: boolean;
  customError: string | null;
}

const AITrainingCenter: React.FC<AITrainingCenterProps> = ({
  symbol,
  analysis,
  feedback,
  onFeedback,
  onAnalyzeCustomData,
  customAnalysisResult,
  isCustomLoading,
  customError
}) => {
  const [customData, setCustomData] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const symbolToAnalyze = customSymbol || symbol || 'CUSTOM';
    onAnalyzeCustomData(customData, symbolToAnalyze);
  };

  const renderFeedbackButton = (type: Feedback, text: string, icon: string) => {
    const isSelected = feedback === type;
    const isDisabled = !!feedback;
    return (
      <button
        onClick={() => onFeedback(symbol, type)}
        disabled={isDisabled}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-200
          ${isSelected && type === 'correct' ? 'bg-green-500/20 border-green-500 text-green-300' : ''}
          ${isSelected && type === 'incorrect' ? 'bg-red-500/20 border-red-500 text-red-300' : ''}
          ${!isSelected ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : ''}
          ${isDisabled && !isSelected ? 'opacity-40 cursor-not-allowed' : ''}
        `}
      >
        {icon} {text}
      </button>
    );
  };

  return (
    <div className="mt-6 bg-gray-800/50 p-6 rounded-xl shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-gray-100 mb-4 text-center flex items-center justify-center gap-3">
        <BrainCircuitIcon className="w-8 h-8 text-cyan-400" />
        AI Training Center
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feedback Section */}
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h3 className="font-semibold text-gray-200 mb-2">1. Provide Feedback on Analysis</h3>
          <p className="text-xs text-gray-400 mb-4">
            Your feedback helps the AI learn. After analyzing a stock, tell us if the prediction was useful.
          </p>
          {analysis && symbol ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {renderFeedbackButton('correct', 'Prediction was Correct', '✅')}
                {renderFeedbackButton('incorrect', 'Prediction was Incorrect', '❌')}
              </div>
              {feedback && <p className="text-xs text-center text-cyan-400">Thank you for your feedback!</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Search for a stock to provide feedback.</p>
          )}
        </div>

        {/* Custom Data Section */}
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h3 className="font-semibold text-gray-200 mb-2">2. Analyze Your Own Data</h3>
          <p className="text-xs text-gray-400 mb-4">
            Paste your own historical data in CSV format to get an instant AI analysis.
          </p>
          <form onSubmit={handleCustomSubmit}>
            <textarea
              value={customData}
              onChange={(e) => setCustomData(e.target.value)}
              placeholder="Paste CSV data here...&#10;date,open,high,low,close,volume&#10;2024-01-01,100,105,99,104,10000"
              rows={5}
              className="w-full text-xs p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
            <div className="flex gap-2 mt-2">
                 <input
                    type="text"
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value)}
                    placeholder={symbol || "Enter Symbol"}
                    className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                <button type="submit" disabled={isCustomLoading || !customData} className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 disabled:opacity-50">
                  Analyze
                </button>
            </div>
          </form>
        </div>
      </div>

      {isCustomLoading && <div className="mt-4"><Loader/></div>}
      
      {customError && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-sm text-center">
          <strong>Error:</strong> {customError}
        </div>
      )}

      {customAnalysisResult && !isCustomLoading && (
        <div className="mt-6 border-t-2 border-cyan-500 pt-6">
          <h3 className="text-xl font-bold text-gray-100 text-center mb-4">
            Analysis of Your Custom Data for '{customSymbol || symbol || 'CUSTOM'}'
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <AnalysisDisplay analysis={customAnalysisResult.analysis} rsi={null} macd={null} />
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <NewsAnalysis analysis={customAnalysisResult.news} isLoading={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITrainingCenter;