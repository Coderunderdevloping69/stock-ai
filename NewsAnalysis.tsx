import React from 'react';
import { NewsAnalysisResult, NewsItem } from '../types';
import { NewsIcon } from './icons/NewsIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { TrendingDownIcon } from './icons/TrendingDownIcon';
import { NeutralIcon } from './icons/NeutralIcon';


interface NewsAnalysisProps {
  analysis: NewsAnalysisResult | null;
  isLoading: boolean;
}

const SentimentMeter: React.FC<{ score: number, sentiment: string }> = ({ score, sentiment }) => {
    const percentage = (score + 1) / 2 * 100;
    
    const getColor = (s: number) => {
        if (s > 0.5) return 'bg-green-500';
        if (s > 0.1) return 'bg-emerald-500';
        if (s > -0.1) return 'bg-gray-500';
        if (s > -0.5) return 'bg-red-500';
        return 'bg-rose-600';
    };

    const colorClass = getColor(score);

    return (
      <div className="my-2">
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
        <p className={`text-center text-sm font-bold mt-1 ${colorClass.replace('bg-', 'text-')}`}>{sentiment}</p>
      </div>
    );
};

const ImpactIcon: React.FC<{ type: NewsItem['impact_type'] }> = ({ type }) => {
    switch (type) {
        case 'Positive': return <TrendingUpIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />;
        case 'Negative': return <TrendingDownIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />;
        default: return <NeutralIcon className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />;
    }
};

const NewsAnalysis: React.FC<NewsAnalysisProps> = ({ analysis }) => {
  if (!analysis) {
    return (
        <div className="p-6 flex flex-col justify-center items-center h-full text-center">
            <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center"><NewsIcon className="w-6 h-6 mr-2" /> News Sentiment Analysis</h2>
            <p className="text-gray-400">News analysis will appear here.</p>
        </div>
    );
  }

  const { sentiment, sentiment_score, summary, news_items } = analysis;

  return (
    <div className="flex flex-col h-full">
        <h2 className="text-xl font-bold text-gray-100 mb-2 text-center flex items-center justify-center">
            <NewsIcon className="w-6 h-6 mr-2" />
            News Sentiment Analysis
        </h2>
        
        <SentimentMeter score={sentiment_score} sentiment={sentiment}/>

        <div className="space-y-3 text-gray-300 flex-grow mt-3">
            <div>
                <h3 className="font-semibold text-gray-100">Summary:</h3>
                <p className="text-sm text-gray-400">{summary}</p>
            </div>
        </div>
        
         <div className="mt-4 pt-4 border-t border-gray-700">
             <h3 className="font-semibold text-gray-100 mb-2 text-center">Key News & Impact</h3>
             <div className="space-y-3 text-sm text-left max-h-48 overflow-y-auto pr-2">
                {news_items && news_items.length > 0 ? (
                    news_items.map((item, index) => (
                        <div key={index} className="p-2 bg-gray-700/40 rounded">
                           <div className="flex items-start gap-2">
                               <ImpactIcon type={item.impact_type} />
                               <div className="flex-grow">
                                   <a 
                                     href={item.url}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="block text-xs text-cyan-400 hover:underline truncate font-semibold"
                                     title={item.headline}
                                   >
                                    {item.headline}
                                   </a>
                                   <p className="text-xs text-gray-400 mt-1">
                                        <span className="font-bold text-gray-300">Impact: </span>{item.impact}
                                   </p>
                               </div>
                           </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-xs text-center">No recent articles found.</p>
                )}
             </div>
        </div>
    </div>
  );
};

export default NewsAnalysis;