import React, { useState, useEffect, useRef } from 'react';
import { getStockList } from '../services/stockList';

interface SearchBarProps {
  onSearch: (symbol: string) => void;
  isLoading: boolean;
  exchange: 'NSE' | 'BSE';
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, exchange }) => {
  const [symbol, setSymbol] = useState('');
  const [suggestions, setSuggestions] = useState<{ symbol: string; name: string }[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const stockList = getStockList(exchange);
  
  useEffect(() => {
    // Reset symbol when exchange changes
    setSymbol('');
  }, [exchange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSuggestionsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSymbol(value);

    if (value.length > 0) {
      const filteredSuggestions = stockList
        .filter(stock => 
          stock.symbol.toLowerCase().startsWith(value.toLowerCase()) || 
          stock.name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 7); // Limit suggestions
      setSuggestions(filteredSuggestions);
      setIsSuggestionsVisible(true);
    } else {
      setSuggestions([]);
      setIsSuggestionsVisible(false);
    }
  };

  const handleSuggestionClick = (selectedSymbol: string) => {
    setSymbol(selectedSymbol);
    setSuggestions([]);
    setIsSuggestionsVisible(false);
    onSearch(selectedSymbol);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuggestionsVisible(false);
    onSearch(symbol);
  };

  return (
    <div ref={searchContainerRef} className="relative">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={symbol}
            onChange={handleInputChange}
            onFocus={() => { if (symbol) setIsSuggestionsVisible(true) }}
            placeholder={`Enter ${exchange} Stock Symbol (e.g., RELIANCE)`}
            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none focus:border-cyan-500 transition-colors duration-300 placeholder-gray-500"
            disabled={isLoading}
            autoComplete="off"
          />
          {isSuggestionsVisible && suggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map(stock => (
                <li
                  key={stock.symbol}
                  onClick={() => handleSuggestionClick(stock.symbol)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                >
                  <div className="font-bold text-gray-200">{stock.symbol}</div>
                  <div className="text-sm text-gray-400">{stock.name}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;