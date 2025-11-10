import { StockDataPoint, MACDResult } from '../types';

// Helper to calculate Exponential Moving Average (EMA)
const calculateEMA = (prices: number[], period: number): number[] => {
  const k = 2 / (period + 1);
  const emaArray: number[] = [];
  if (prices.length > 0) {
      emaArray[0] = prices[0];
      for (let i = 1; i < prices.length; i++) {
          emaArray[i] = prices[i] * k + emaArray[i - 1] * (1 - k);
      }
  }
  return emaArray;
};

// New helper to calculate Simple Moving Average (SMA)
export const calculateSMA = (data: StockDataPoint[], period: number): (number | null)[] => {
  if (data.length < period) return Array(data.length).fill(null);

  const prices = data.map(p => p.close);
  const smaArray: (number | null)[] = Array(period - 1).fill(null);
  
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  smaArray.push(sum / period);

  for (let i = period; i < prices.length; i++) {
    sum -= prices[i - period];
    sum += prices[i];
    smaArray.push(sum / period);
  }

  return smaArray;
};


export const calculateRSI = (data: StockDataPoint[], period: number = 14): number | null => {
  if (data.length <= period) return null;

  const prices = data.map(p => p.close); // Use closing price
  const changes = prices.slice(1).map((price, i) => price - prices[i]);
  
  const initialSlice = changes.slice(0, period);
  const initialGain = initialSlice.filter(c => c > 0).reduce((sum, c) => sum + c, 0);
  const initialLoss = initialSlice.filter(c => c < 0).reduce((sum, c) => sum + Math.abs(c), 0);
  
  let avgGain = initialGain / period;
  let avgLoss = initialLoss / period;

  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return rsi;
};

export const calculateMACD = (data: StockDataPoint[], shortPeriod: number = 12, longPeriod: number = 26, signalPeriod: number = 9): MACDResult | null => {
    const prices = data.map(p => p.close); // Use closing price
    if (prices.length < longPeriod) return null;

    const emaShort = calculateEMA(prices, shortPeriod);
    const emaLong = calculateEMA(prices, longPeriod);
    
    const macdLine: number[] = [];
    for (let i = 0; i < emaLong.length; i++) {
        // Find corresponding point in emaShort. It will be offset
        const shortIndex = i + (longPeriod - shortPeriod);
        if(shortIndex < emaShort.length){
            macdLine.push(emaShort[shortIndex] - emaLong[i]);
        }
    }

    if (macdLine.length < signalPeriod) return null;

    const signalLine = calculateEMA(macdLine, signalPeriod);
    
    if (macdLine.length === 0 || signalLine.length === 0) return null;

    const lastMacd = macdLine[macdLine.length-1];
    const lastSignal = signalLine[signalLine.length-1];

    return {
        MACD: lastMacd,
        signal: lastSignal,
        histogram: lastMacd - lastSignal,
    };
};