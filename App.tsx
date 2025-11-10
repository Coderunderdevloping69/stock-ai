import React, { useState, useEffect, useRef } from 'react';

// Types
import { StockDataPoint, AnalysisResult, NewsAnalysisResult, TopPerformer, StockToBuy, MACDResult, Feedback } from './types';

// Services
import { fetchStockData, getNextTick } from './services/stockService';
import { analyzeStockData, analyzeNewsForStock, fetchMarketHighlights, analyzeCustomStockData } from './services/geminiService';

// Utils
import { calculateRSI, calculateMACD } from './utils/indicators';

// Components
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import StockChart from './components/StockChart';
import AnalysisDisplay from './components/AnalysisDisplay';
import Loader from './components/Loader';
import LiveToggle from './components/LiveToggle';
import SuggestedStocks from './components/SuggestedStocks';
import ExchangeSelector from './components/ExchangeSelector';
import NewsAnalysis from './components/NewsAnalysis';
import MarketHighlights from './components/TopMovers';
import PriceAlert from './components/PriceAlert';
import HistoricalDataTable from './components/HistoricalDataTable';
import AITrainingCenter from './components/AITrainingCenter';

// Icons for layout
import { ChartIcon } from './components/icons/ChartIcon';

const App: React.FC = () => {
    // Core state
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
    const [exchange, setExchange] = useState<'NSE' | 'BSE'>('NSE');
    const [stockData, setStockData] = useState<StockDataPoint[]>([]);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [newsAnalysis, setNewsAnalysis] = useState<NewsAnalysisResult | null>(null);

    // Loading and error states
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isHighlightsLoading, setIsHighlightsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Feature states
    const [isLive, setIsLive] = useState<boolean>(false);
    const [rsi, setRsi] = useState<number | null>(null);
    const [macd, setMacd] = useState<MACDResult | null>(null);
    const [marketHighlights, setMarketHighlights] = useState<{ topPerformers: TopPerformer[], stocksToBuy: StockToBuy[] }>({ topPerformers: [], stocksToBuy: [] });
    const [alertPrice, setAlertPrice] = useState<number | null>(null);
    const [isAlertTriggered, setIsAlertTriggered] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<Map<string, Feedback>>(new Map());

    // AI Training Center State
    const [customAnalysisResult, setCustomAnalysisResult] = useState<{ analysis: AnalysisResult, news: NewsAnalysisResult } | null>(null);
    const [isCustomLoading, setIsCustomLoading] = useState<boolean>(false);
    const [customError, setCustomError] = useState<string | null>(null);

    const liveUpdateInterval = useRef<NodeJS.Timeout | null>(null);

    // Fetch market highlights on initial load
    useEffect(() => {
        const loadHighlights = async () => {
            try {
                setIsHighlightsLoading(true);
                const highlights = await fetchMarketHighlights();
                setMarketHighlights(highlights);
            } catch (err: any) {
                console.error("Error fetching market highlights:", err);
                // Not setting a visible error for this, as it's a background feature
            } finally {
                setIsHighlightsLoading(false);
            }
        };
        loadHighlights();
    }, []);
    
    // Effect to handle live updates
    useEffect(() => {
        if (isLive && stockData.length > 0) {
            liveUpdateInterval.current = setInterval(() => {
                setStockData(prevData => {
                    if (prevData.length === 0) return [];
                    const lastPoint = prevData[prevData.length - 1];
                    const newPoint = getNextTick(lastPoint);
                    const newData = [...prevData.slice(0, -1), newPoint];

                    // Check for price alert on each tick
                    if (alertPrice && !isAlertTriggered) {
                        if ((lastPoint.close < alertPrice && newPoint.close >= alertPrice) || (lastPoint.close > alertPrice && newPoint.close <= alertPrice)) {
                            setIsAlertTriggered(true);
                        }
                    }
                    return newData;
                });
            }, 1500); // Update every 1.5 seconds
        } else {
            if (liveUpdateInterval.current) {
                clearInterval(liveUpdateInterval.current);
            }
        }
        return () => {
            if (liveUpdateInterval.current) {
                clearInterval(liveUpdateInterval.current);
            }
        };
    }, [isLive, stockData, alertPrice, isAlertTriggered]);
    
    const resetState = () => {
        setError(null);
        setStockData([]);
        setAnalysisResult(null);
        setNewsAnalysis(null);
        setIsLive(false);
        setRsi(null);
        setMacd(null);
        setAlertPrice(null);
        setIsAlertTriggered(false);
        setCustomAnalysisResult(null);
        setCustomError(null);
    };

    const handleSearch = async (symbol: string) => {
        if (!symbol) {
            setError("Please enter a stock symbol.");
            return;
        }
        setIsLoading(true);
        resetState();
        const upperSymbol = symbol.toUpperCase();
        setSelectedSymbol(upperSymbol);
        
        try {
            const currentFeedback = feedback.get(upperSymbol);

            const data = await fetchStockData(symbol);
            
            if (data.length === 0) {
                throw new Error("No data found for this stock symbol.");
            }

            const [analysis, news] = await Promise.all([
                analyzeStockData(symbol, exchange, data, currentFeedback),
                analyzeNewsForStock(symbol, exchange)
            ]);
            
            setStockData(data);
            setAnalysisResult(analysis);
            setNewsAnalysis(news);
            setRsi(calculateRSI(data));
            setMacd(calculateMACD(data));

        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
            setStockData([]);
            setAnalysisResult(null);
            setNewsAnalysis(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleToggleLive = () => {
        if (stockData.length > 0) {
            setIsLive(prev => !prev);
        }
    };

    const handleExchangeChange = (newExchange: 'NSE' | 'BSE') => {
        setExchange(newExchange);
        // Reset everything if exchange changes
        setSelectedSymbol(null);
        resetState();
    }
    
    const handleSetAlert = (price: number) => {
        setAlertPrice(price);
        setIsAlertTriggered(false); // Reset trigger when setting a new alert
    }

    const handleFeedback = (symbol: string, fb: Feedback) => {
      setFeedback(prev => new Map(prev).set(symbol, fb));
    }

    const handleAnalyzeCustomData = async (csvData: string, symbol: string) => {
        setIsCustomLoading(true);
        setCustomError(null);
        setCustomAnalysisResult(null);
        try {
            const result = await analyzeCustomStockData(csvData, symbol, exchange);
            setCustomAnalysisResult(result);
        } catch (err: any) {
            setCustomError(err.message || "Failed to analyze custom data.");
        } finally {
            setIsCustomLoading(false);
        }
    }

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-6 lg:p-8">
                <div className="bg-gray-800/50 p-6 rounded-xl shadow-2xl border border-gray-700">
                    <ExchangeSelector selected={exchange} onSelect={handleExchangeChange} />
                    <SearchBar onSearch={handleSearch} isLoading={isLoading} exchange={exchange} />
                    <SuggestedStocks onSelect={handleSearch} isLoading={isLoading} />
                </div>
                
                {error && <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-center">{error}</div>}

                {isLoading && <div className="mt-6"><Loader /></div>}

                {!isLoading && !error && stockData.length > 0 && selectedSymbol && (
                    <div className="mt-6 space-y-6">
                        {/* Main Analysis Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Chart and Data */}
                            <div className="lg:col-span-2 bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                                            <ChartIcon className="w-6 h-6 text-cyan-400" />
                                            {selectedSymbol}
                                        </h2>
                                        <p className="text-sm text-gray-400">
                                            Last Close: {stockData[stockData.length-1]?.close.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </p>
                                    </div>
                                    <div className="mt-3 sm:mt-0">
                                      <LiveToggle isLive={isLive} onToggle={handleToggleLive} disabled={stockData.length === 0} />
                                    </div>
                                </div>
                                <div className="h-[400px] md:h-[500px]">
                                    <StockChart data={stockData} />
                                </div>
                            </div>
                            
                            {/* Right Column: AI Analysis */}
                            <div className="space-y-6">
                                <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700 h-full">
                                    <AnalysisDisplay analysis={analysisResult} rsi={rsi} macd={macd} />
                                </div>
                                 <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700 h-full">
                                    <NewsAnalysis analysis={newsAnalysis} isLoading={isLoading}/>
                                </div>
                            </div>
                        </div>

                        {/* Price Alert Section */}
                        <div>
                           <PriceAlert
                             onSetAlert={handleSetAlert}
                             alertPrice={alertPrice}
                             isAlertTriggered={isAlertTriggered}
                             currentPrice={stockData[stockData.length-1]?.close}
                             onDismiss={() => { setIsAlertTriggered(false); setAlertPrice(null); }}
                           />
                        </div>

                        {/* Historical Data Table */}
                        <div>
                            <HistoricalDataTable data={stockData} />
                        </div>
                    </div>
                )}
                
                {/* Initial State / No Stock Selected */}
                {!selectedSymbol && !isLoading && (
                    <div className="mt-6">
                        <MarketHighlights 
                            topPerformers={marketHighlights.topPerformers}
                            stocksToBuy={marketHighlights.stocksToBuy}
                            isLoading={isHighlightsLoading}
                        />
                    </div>
                )}

                 {/* AI Training Center */}
                <AITrainingCenter 
                    symbol={selectedSymbol || ''}
                    analysis={analysisResult}
                    feedback={selectedSymbol ? feedback.get(selectedSymbol) : undefined}
                    onFeedback={handleFeedback}
                    onAnalyzeCustomData={handleAnalyzeCustomData}
                    customAnalysisResult={customAnalysisResult}
                    isCustomLoading={isCustomLoading}
                    customError={customError}
                />
            </main>
        </div>
    );
};

export default App;
