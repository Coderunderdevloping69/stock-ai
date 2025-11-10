
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-500"></div>
        <p className="mt-4 text-lg text-slate-300">AI agent is analyzing trends and predicting...</p>
    </div>
  );
};

export default Loader;
