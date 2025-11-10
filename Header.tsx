import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/60 backdrop-blur-md sticky top-0 z-10 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-200">
          AI Stock Predictor
        </h1>
      </div>
    </header>
  );
};

export default Header;