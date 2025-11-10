import React, { useState } from 'react';
import { TopPerformer, StockToBuy } from '../types';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { TrendingDownIcon } from './icons/TrendingDownIcon';
import { NeutralIcon } from './icons/NeutralIcon';

interface MarketHighlightsProps {
  topPerformers: TopPerformer[];
  stocksToBuy: StockToBuy[];
  isLoading: boolean;
}

type Tab = 'performers' | 'buy';

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
};

const PredictionIcon: React.FC<{ prediction: 'RISE' | 'FALL' | 'STABLE' }> = ({ prediction }) => {
    switch (prediction) {
        case 'RISE': return <TrendingUpIcon className="w-5 h-5 text-green-400" />;
        case 'FALL': return <TrendingDownIcon className="w-5 h-5 text-red-400" />;
        default: return <NeutralIcon className="w-5 h-5 text-gray-400" />;
    }
};

const MarketHighlights: React.FC<MarketHighlightsProps> = ({ topPerformers, stocksToBuy, isLoading }) => {
  const [activeTab, setActiveTab] = useState<Tab>('performers');

  const renderPerformers = () => (
    <div className="space-y-1">
      {topPerformers.map(stock => {
        const isPositive = stock.change_percent >= 0;
        return (
          <div key={stock.symbol} className="p-2 rounded-md hover:bg-gray-700/50">
            <div className="grid grid-cols-3 items-center gap-2 text-sm">
              <span className="font-bold text-gray-100 col-span-1 truncate">{stock.symbol}</span>
              <div className="text-right">
                  <p className="font-semibold text-gray-200">{formatCurrency(stock.price)}</p>
                  <p className={`text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{stock.change_percent.toFixed(1)}%
                  </p>
              </div>
              <div className="flex justify-end items-center gap-1 text-gray-400">
                  <PredictionIcon prediction={stock.prediction} />
                  <span className="text-xs">{stock.prediction}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
  
  const renderStocksToBuy = () => (
     <div className="space-y-2">
        {stocksToBuy.map(stock => (
           <div key={stock.symbol} className="p-2 rounded-md hover:bg-gray-700/50 border-b border-gray-700/50 last:border-b-0">
             <div className="grid grid-cols-3 items-center gap-2 text-sm">
               <span className="font-bold text-gray-100 col-span-1 truncate">{stock.symbol}</span>
               <div className="text-right">
                   <p className="font-semibold text-gray-200">{formatCurrency(stock.price)}</p>
                   <p className="text-xs text-gray-400">{(stock.confidence * 100).toFixed(0)}% Conf.</p>
               </div>
               <div className="text-right text-green-400 font-bold">
                  +{stock.predicted_return_percent.toFixed(1)}%
               </div>
             </div>
             <p className="text-xs text-gray-400 mt-1.5 pl-1">
                <span className="font-semibold text-gray-300">Reason: </span>{stock.reason}
             </p>
           </div>
        ))}
     </div>
  );

  const renderSkeletons = () => (
     <div className="space-y-3 animate-pulse">
        {[...Array(10)].map((_, i) => (
             <div key={i} className="space-y-2 p-1">
                <div className="grid grid-cols-3 gap-4">
                     <div className="h-4 bg-gray-700 rounded col-span-1"></div>
                     <div className="h-4 bg-gray-700 rounded col-span-1"></div>
                     <div className="h-4 bg-gray-700 rounded col-span-1"></div>
                </div>
                <div className="h-3 bg-gray-700 rounded w-5/6"></div>
            </div>
        ))}
    </div>
  )

  return (
    <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700 h-full">
      <h2 className="text-xl font-bold text-gray-100 mb-4 text-center">
        Market Highlights
      </h2>
      <div className="mb-4">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('performers')}
            className={`flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${activeTab === 'performers' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Top Performers
          </button>
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${activeTab === 'buy' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Stocks to Buy
          </button>
        </div>
      </div>
      
      {isLoading ? renderSkeletons() : (
        <div className="px-1 max-h-[80vh] overflow-y-auto">
          {activeTab === 'performers' ? renderPerformers() : renderStocksToBuy()}
        </div>
      )}
      
    </div>
  );
};

export default MarketHighlights;