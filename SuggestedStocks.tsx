import React from 'react';

interface SuggestedStocksProps {
  onSelect: (symbol: string) => void;
  isLoading: boolean;
}

const popularStocks = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR',
  'ICICIBANK', 'BHARTIARTL', 'SBIN', 'ITC', 'BAJFINANCE',
  'KOTAKBANK', 'HCLTECH', 'ASIANPAINT', 'MARUTI', 'LT',
  'AXISBANK', 'WIPRO', 'TITAN', 'ULTRACEMCO', 'SUNPHARMA',
  'ADANIENT', 'BAJAJFINSV', 'NESTLEIND', 'NTPC', 'POWERGRID'
];

const SuggestedStocks: React.FC<SuggestedStocksProps> = ({ onSelect, isLoading }) => {
  return (
    <div className="mt-6">
      <h3 className="text-center text-gray-400 text-sm mb-3">Or try one of these popular examples:</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {popularStocks.map(symbol => (
          <button
            key={symbol}
            onClick={() => onSelect(symbol)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-700 hover:border-cyan-500 hover:text-cyan-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800 disabled:hover:border-gray-700"
          >
            {symbol}
          </button>
        ))}
      </div>
       <p className="text-center text-xs text-gray-600 mt-4">
        Note: This is a simulation. The stocks listed are for demonstration purposes only and do not constitute financial advice.
      </p>
    </div>
  );
};

export default SuggestedStocks;