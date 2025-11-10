import React from 'react';

type Exchange = 'NSE' | 'BSE';

interface ExchangeSelectorProps {
  selected: Exchange;
  onSelect: (exchange: Exchange) => void;
}

const ExchangeSelector: React.FC<ExchangeSelectorProps> = ({ selected, onSelect }) => {
  const getButtonClass = (exchange: Exchange) => {
    return `w-full py-2 px-4 text-sm font-bold rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
      selected === exchange
        ? 'bg-cyan-500 text-white shadow-lg'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`;
  };

  return (
    <div className="flex items-center justify-center p-1 bg-gray-800 rounded-lg my-4 max-w-xs mx-auto">
      <button onClick={() => onSelect('NSE')} className={getButtonClass('NSE')}>
        NSE
      </button>
      <button onClick={() => onSelect('BSE')} className={getButtonClass('BSE')}>
        BSE
      </button>
    </div>
  );
};

export default ExchangeSelector;