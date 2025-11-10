import React from 'react';
import { LiveIcon } from './icons/LiveIcon';

interface LiveToggleProps {
  isLive: boolean;
  onToggle: () => void;
  disabled: boolean;
}

const LiveToggle: React.FC<LiveToggleProps> = ({ isLive, onToggle, disabled }) => {
  return (
    <label 
      htmlFor="live-toggle" 
      className={`flex items-center cursor-pointer transition-opacity duration-300 ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <div className="relative">
        <input 
          id="live-toggle" 
          type="checkbox" 
          className="sr-only" 
          checked={isLive}
          onChange={onToggle}
          disabled={disabled}
        />
        <div className={`block w-14 h-8 rounded-full transition-colors ${isLive ? 'bg-cyan-500' : 'bg-gray-700'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isLive ? 'transform translate-x-6' : ''}`}></div>
      </div>
      <div className="ml-3 text-gray-300 font-medium flex items-center">
        <LiveIcon className={`w-5 h-5 mr-2 transition-colors ${isLive ? 'text-cyan-400 animate-pulse' : 'text-gray-500'}`} />
        Live Updates
      </div>
    </label>
  );
};

export default LiveToggle;