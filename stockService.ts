import { StockDataPoint } from '../types';

const REALISTIC_PROFILES: { [key: string]: { basePrice: number; volatility: number; volume: number } } = {
  'RELIANCE': { basePrice: 2900, volatility: 0.025, volume: 5_000_000 },
  'TCS': { basePrice: 3800, volatility: 0.02, volume: 2_000_000 },
  'HDFCBANK': { basePrice: 1500, volatility: 0.022, volume: 8_000_000 },
  'INFY': { basePrice: 1600, volatility: 0.028, volume: 6_000_000 },
  'ICICIBANK': { basePrice: 1100, volatility: 0.03, volume: 12_000_000 },
  'HINDUNILVR': { basePrice: 2400, volatility: 0.018, volume: 1_500_000 },
  'SBIN': { basePrice: 830, volatility: 0.035, volume: 15_000_000 },
  'BHARTIARTL': { basePrice: 1300, volatility: 0.032, volume: 7_000_000 },
  'ITC': { basePrice: 430, volatility: 0.02, volume: 10_000_000 },
  'L&T': { basePrice: 3600, volatility: 0.025, volume: 2_500_000 },
  'BAJFINANCE': { basePrice: 7000, volatility: 0.04, volume: 1_000_000 },
  'KOTAKBANK': { basePrice: 1700, volatility: 0.027, volume: 4_000_000 },
  'ASIANPAINT': { basePrice: 2900, volatility: 0.021, volume: 1_200_000 },
  'MARUTI': { basePrice: 12500, volatility: 0.029, volume: 500_000 },
  'TITAN': { basePrice: 3400, volatility: 0.031, volume: 1_800_000 },
  'SUNPHARMA': { basePrice: 1500, volatility: 0.033, volume: 3_000_000 },
  'ULTRACEMCO': { basePrice: 10500, volatility: 0.024, volume: 400_000 },
  'WIPRO': { basePrice: 480, volatility: 0.03, volume: 9_000_000 },
  'NESTLEIND': { basePrice: 2500, volatility: 0.015, volume: 300_000 },
  'ADANIENT': { basePrice: 3200, volatility: 0.05, volume: 4_500_000 },
  'TATAMOTORS': { basePrice: 980, volatility: 0.045, volume: 20_000_000 },
  'TATASTEEL': { basePrice: 165, volatility: 0.048, volume: 30_000_000 },
  'YESBANK': { basePrice: 24, volatility: 0.06, volume: 100_000_000 },
  'ZOMATO': { basePrice: 190, volatility: 0.055, volume: 50_000_000 },
};

const symbolToSeed = (symbol: string): number => {
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
        const char = symbol.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash;
}

const seededRandom = (seed: number) => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

const generateCandle = (openPrice: number, volatility: number, trend: number): { high: number, low: number, close: number } => {
    const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
    const change = trend * openPrice + randomFactor * volatility * openPrice;
    const close = openPrice + change;

    const high = Math.max(openPrice, close) + Math.random() * volatility * openPrice * 0.6;
    const low = Math.min(openPrice, close) - Math.random() * volatility * openPrice * 0.6;
    return { high, low, close };
};


export const fetchStockData = (symbol: string): Promise<StockDataPoint[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!symbol || typeof symbol !== 'string') {
        return reject(new Error('Invalid stock symbol provided.'));
      }
      
      const upperSymbol = symbol.toUpperCase();
      const profile = REALISTIC_PROFILES[upperSymbol];
      const seed = symbolToSeed(upperSymbol);
      
      const { basePrice, baseVolatility, baseVolume } = profile 
        ? { basePrice: profile.basePrice, baseVolatility: profile.volatility, baseVolume: profile.volume }
        : { 
            basePrice: (Math.abs(seed) % 8000) + 50, 
            baseVolatility: ((Math.abs(seed) % 20) + 20) / 1000, 
            baseVolume: (Math.abs(seed) % 10_000_000) + 500_000 
          };

      const data: StockDataPoint[] = [];
      let lastClose = basePrice;
      
      // Seeded random parameters for generating a unique but deterministic pattern for each stock
      const trendStrength = (seededRandom(seed + 1) - 0.5) * 0.005; // Overall trend direction
      const cyclePeriod1 = seededRandom(seed + 2) * 40 + 20; // 20 to 60 days
      const cycleStrength1 = seededRandom(seed + 3) * 0.01;
      const cyclePeriod2 = seededRandom(seed + 4) * 20 + 10; // 10 to 30 days
      const cycleStrength2 = seededRandom(seed + 5) * 0.005;

      let momentum = 0;

      for (let i = 0; i < 90; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (90 - i));
        
        // 1. Base Trend
        let dailyTrend = trendStrength;

        // 2. Cyclical Trends (sine waves)
        dailyTrend += Math.sin(i * 2 * Math.PI / cyclePeriod1) * cycleStrength1;
        dailyTrend += Math.sin(i * 2 * Math.PI / cyclePeriod2) * cycleStrength2;

        // 3. Momentum
        dailyTrend += momentum * 0.1; // Momentum from previous day affects today

        // 4. Volatility Clustering (randomly higher/lower vol periods)
        const currentVolatility = baseVolatility * (1 + (seededRandom(seed + i) - 0.5) * 0.5);

        // 5. Random Shock Event
        if (Math.random() < 0.015) { // 1.5% chance of a shock
            dailyTrend += (Math.random() - 0.5) * 0.15; // +/- 15% shock
        }

        const open = lastClose * (1 + (Math.random() - 0.5) * 0.005);
        const { high, low, close } = generateCandle(open, currentVolatility, dailyTrend);
        const volume = Math.floor(baseVolume * (0.75 + Math.random() * 0.5) * (1 + Math.abs(dailyTrend) * 10));
        
        const finalClose = Math.max(0.01, parseFloat(close.toFixed(2))); // Ensure price doesn't go below zero

        // Update momentum for next day
        const changePercent = (finalClose - lastClose) / lastClose;
        momentum = momentum * 0.8 + changePercent * 0.2; // Decay and add new change
        
        data.push({
          date: date.toISOString().split('T')[0],
          open: parseFloat(open.toFixed(2)),
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          close: finalClose,
          volume: volume,
        });

        lastClose = finalClose;
      }
      resolve(data);
    }, 500); // Reduced delay for a faster feel
  });
};


export const getNextTick = (lastPoint: StockDataPoint): StockDataPoint => {
    const tickVolatility = 0.0005; 
    let newClose = lastPoint.close * (1 + (Math.random() - 0.5) * 2 * tickVolatility);
    
    // Update high and low for the current candle
    const newHigh = Math.max(lastPoint.high, newClose);
    const newLow = Math.min(lastPoint.low, newClose);

    return {
      ...lastPoint,
      high: parseFloat(newHigh.toFixed(2)),
      low: parseFloat(newLow.toFixed(2)),
      close: parseFloat(newClose.toFixed(2)),
      // Volume can also be incremented slightly with each tick
      volume: lastPoint.volume + Math.floor(Math.random() * 1000),
    };
};