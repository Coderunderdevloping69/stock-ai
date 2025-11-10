import React, { useState } from 'react';
import { BellIcon } from './icons/BellIcon';
import { XIcon } from './icons/XIcon';

interface PriceAlertProps {
  onSetAlert: (price: number) => void;
  alertPrice: number | null;
  isAlertTriggered: boolean;
  currentPrice: number;
  onDismiss: () => void;
}

const formatCurrency = (value: number) => {
  if (typeof value !== 'number') return 'N/A';
  return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
};

const PriceAlert: React.FC<PriceAlertProps> = ({ onSetAlert, alertPrice, isAlertTriggered, currentPrice, onDismiss }) => {
  const [priceInput, setPriceInput] = useState('');

  const handleSetAlertClick = () => {
    const price = parseFloat(priceInput);
    if (!isNaN(price) && price > 0) {
      onSetAlert(price);
    }
  };
  
  if (isAlertTriggered && alertPrice) {
    return (
        <div className="bg-cyan-800/50 border-2 border-cyan-500 p-4 rounded-xl shadow-lg flex items-center justify-between animate-pulse">
            <div>
                <div className="flex items-center">
                    <BellIcon className="w-6 h-6 text-cyan-300 mr-3" />
                    <h3 className="text-lg font-bold text-cyan-200">Price Alert Triggered!</h3>
                </div>
                <p className="text-gray-200 mt-1">
                    Price has reached your target of <span className="font-bold">{formatCurrency(alertPrice)}</span>. Current price: <span className="font-bold">{formatCurrency(currentPrice)}</span>
                </p>
            </div>
            <button onClick={onDismiss} className="p-1 rounded-full hover:bg-cyan-700/50">
                <XIcon className="w-5 h-5 text-gray-300"/>
            </button>
        </div>
    )
  }

  return (
    <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-grow w-full">
            <label htmlFor="price-alert" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                <BellIcon className="w-4 h-4 mr-2" />
                Set Price Alert
            </label>
            <input
              id="price-alert"
              type="number"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder={`Current: ${formatCurrency(currentPrice)}`}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
        </div>
        <button
          onClick={handleSetAlertClick}
          className="w-full sm:w-auto px-5 py-2 mt-2 sm:mt-0 self-end bg-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors"
        >
          {alertPrice ? 'Update Alert' : 'Set Alert'}
        </button>
      </div>
      {alertPrice && !isAlertTriggered && (
          <p className="text-xs text-center text-cyan-400 mt-3">
              Alert is active. You will be notified when the price reaches {formatCurrency(alertPrice)}.
          </p>
      )}
    </div>
  );
};

export default PriceAlert;