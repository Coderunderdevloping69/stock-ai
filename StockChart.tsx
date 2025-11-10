import React, { useState, useMemo, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
  Cell,
} from 'recharts';
import { StockDataPoint } from '../types';
import { calculateSMA } from '../utils/indicators';

interface StockChartProps {
  data: StockDataPoint[];
}

// Extend the data point type to include calculated indicators for plotting
type ChartDataPoint = StockDataPoint & {
  sma20?: number | null;
  sma50?: number | null;
};

// Store indicator state globally within the component module so it persists across re-renders of different stocks
let visibleIndicators = { sma20: false, sma50: true };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data: ChartDataPoint = payload[0].payload;
    const formatCurrency = (value: number) => value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    const change = data.close - data.open;
    const changePercent = (change / data.open) * 100;
    const changeColor = change >= 0 ? 'text-green-400' : 'text-red-400';

    return (
      <div className="p-3 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg shadow-lg text-sm">
        <p className="label text-gray-300 font-bold">{`${new Date(label).toLocaleDateString()}`}</p>
        <p className={`font-bold ${changeColor}`}>
          {formatCurrency(data.close)} ({change >= 0 ? '+' : ''}{change.toFixed(2)}, {changePercent.toFixed(2)}%)
        </p>
        <div className="grid grid-cols-2 gap-x-4 mt-2">
            <p className="text-gray-400">Open:</p><p className="font-semibold text-right">{formatCurrency(data.open)}</p>
            <p className="text-gray-400">High:</p><p className="font-semibold text-right">{formatCurrency(data.high)}</p>
            <p className="text-gray-400">Low:</p><p className="font-semibold text-right">{formatCurrency(data.low)}</p>
        </div>
        {visibleIndicators.sma20 && data.sma20 && <p className="text-orange-400 mt-1">{`SMA 20: ${formatCurrency(data.sma20)}`}</p>}
        {visibleIndicators.sma50 && data.sma50 && <p className="text-purple-400 mt-1">{`SMA 50: ${formatCurrency(data.sma50)}`}</p>}
        <p className="text-gray-500 mt-1">{`Volume: ${data.volume.toLocaleString()}`}</p>
      </div>
    );
  }

  return null;
};

// A more robust implementation of the Candlestick custom shape.
// This version directly uses the yAxis.scale function to convert price to pixels,
// which is more reliable than calculating ratios from height.
const Candlestick = (props: any) => {
    const { x, width, yAxis, high, low, open, close } = props;

    // The yAxis prop with the scale function is injected by Recharts. If it's not there, we can't draw.
    if (!yAxis || typeof yAxis.scale !== 'function') {
        return null;
    }
    
    const isGrowing = close > open;
    const fill = isGrowing ? '#10b981' : '#f43f5e';
    
    // Directly convert price values into pixel coordinates using the axis scale
    const yHigh = yAxis.scale(high);
    const yLow = yAxis.scale(low);
    const yOpen = yAxis.scale(open);
    const yClose = yAxis.scale(close);

    const bodyHeight = Math.max(1, Math.abs(yOpen - yClose));
    const bodyY = Math.min(yOpen, yClose);

    return (
        <g>
            {/* Wick (the line from high to low) */}
            <line
                x1={x + width / 2} y1={yHigh}
                x2={x + width / 2} y2={yLow}
                stroke={fill}
                strokeWidth={1}
            />
            {/* Body (the rectangle from open to close) */}
            <rect
                x={x}
                y={bodyY}
                width={width}
                height={bodyHeight}
                fill={fill}
            />
        </g>
    );
};

const StockChart: React.FC<StockChartProps> = ({ data }) => {
  const [indicatorState, setIndicatorState] = useState(visibleIndicators);
  const [dateRange, setDateRange] = useState({ startIndex: 0, endIndex: data.length -1 });
  const [crosshair, setCrosshair] = useState<{x: number | null, y: number | null}>({x: null, y: null});

  useEffect(() => {
    // Reset view when new stock data comes in
    const newEndIndex = data.length - 1;
    const newStartIndex = Math.max(0, data.length - 90); // Default to 3 months view
    setDateRange({ startIndex: newStartIndex, endIndex: newEndIndex });
  }, [data]);

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!data || data.length === 0) return [];
    const sma20 = calculateSMA(data, 20);
    const sma50 = calculateSMA(data, 50);
    return data.map((d, i) => ({
      ...d,
      sma20: sma20[i],
      sma50: sma50[i],
    }));
  }, [data]);
  
  const handleIndicatorToggle = (indicator: 'sma20' | 'sma50') => {
    visibleIndicators = { ...visibleIndicators, [indicator]: !visibleIndicators[indicator] };
    setIndicatorState(visibleIndicators);
  };

  const handleDateRange = (range: '1m' | '3m' | 'all') => {
    const total = chartData.length;
    if (range === '1m') {
      setDateRange({ startIndex: Math.max(0, total - 30), endIndex: total - 1 });
    } else if (range === '3m') {
       setDateRange({ startIndex: Math.max(0, total - 90), endIndex: total - 1 });
    } else {
       setDateRange({ startIndex: 0, endIndex: total - 1 });
    }
  }

  const formatYAxis = (tickItem: number) => {
    if (tickItem > 100000) return `${(tickItem / 1000000).toFixed(1)}M`;
    if (tickItem > 1000) return `${(tickItem / 1000).toFixed(0)}k`;
    return tickItem.toLocaleString('en-IN');
  };
  
  const formatXAxis = (str: string) => {
    const date = new Date(str);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const visibleData = chartData.slice(dateRange.startIndex, dateRange.endIndex + 1);
  const prices = visibleData.flatMap(p => [p.high, p.low]);
  const yMin = Math.min(...prices);
  const yMax = Math.max(...prices);
  const yDomain = prices.length > 0 ? [yMin * 0.98, yMax * 1.02] : [0,1];

  const renderToggleButton = (key: 'sma20' | 'sma50', name: string, color: string) => (
    <button
      onClick={() => handleIndicatorToggle(key)}
      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 border ${
        indicatorState[key]
          ? `bg-${color}-500/20 border-${color}-500 text-${color}-300`
          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {name}
    </button>
  );

   const renderDateButton = (range: '1m' | '3m' | 'all', name: string) => {
     const total = chartData.length;
     let isActive = false;
     if (range === '1m') isActive = dateRange.endIndex - dateRange.startIndex <= 30;
     else if (range === '3m') isActive = dateRange.endIndex - dateRange.startIndex <= 90 && dateRange.endIndex - dateRange.startIndex > 30;
     else if (range === 'all') isActive = dateRange.startIndex === 0 && dateRange.endIndex === total-1;

     return (
        <button
          onClick={() => handleDateRange(range)}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${
            isActive ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {name}
        </button>
     );
   }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400">Indicators:</span>
          {renderToggleButton('sma20', 'SMA 20', 'orange')}
          {renderToggleButton('sma50', 'SMA 50', 'purple')}
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-semibold text-gray-400">Range:</span>
           {renderDateButton('1m', '1M')}
           {renderDateButton('3m', '3M')}
           {renderDateButton('all', 'All')}
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          onMouseMove={(e: any) => {
            if (e.isTooltipActive) {
                setCrosshair({ x: e.activePayload?.[0].payload.date, y: e.activeCoordinate?.y ?? null });
            }
          }}
          onMouseLeave={() => setCrosshair({x: null, y: null})}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }} 
              tickFormatter={formatXAxis}
              scale="band"
          />
          <YAxis 
              yAxisId="price"
              orientation="right"
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }} 
              domain={yDomain}
              tickFormatter={(tick) => `₹${tick.toLocaleString('en-IN')}`}
              scale="linear"
          />
          <YAxis
            yAxisId="volume"
            orientation="left"
            stroke="#9ca3af"
            tick={{ fontSize: 10 }}
            domain={[0, (dataMax: number) => dataMax * 4]}
            tickFormatter={formatYAxis}
            scale="linear"
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#67e8f9', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{fontSize: "14px", paddingTop: "10px"}}/>
          
          {indicatorState.sma20 && 
            <Line yAxisId="price" type="monotone" dataKey="sma20" stroke="#f97316" dot={false} strokeWidth={2} name="SMA 20" />
          }
          {indicatorState.sma50 && 
            <Line yAxisId="price" type="monotone" dataKey="sma50" stroke="#a855f7" dot={false} strokeWidth={2} name="SMA 50" />
          }
          
          {/* This Bar component renders the candlesticks using the custom shape */}
          <Bar
            yAxisId="price"
            dataKey="close" // dataKey is arbitrary here as the shape uses the full payload
            shape={<Candlestick />}
            name="Price (OHLC)"
          />
          
          <Bar yAxisId="volume" dataKey="volume" name="Volume" opacity={0.4}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.close > entry.open ? '#10b981' : '#f43f5e'} />
            ))}
          </Bar>

          {crosshair.x && <ReferenceLine x={crosshair.x} stroke="#9ca3af" strokeDasharray="3 3" />}
          {crosshair.y && <ReferenceLine y={crosshair.y} yAxisId="price" stroke="#9ca3af" strokeDasharray="3 3" />}
          
          <Brush 
            dataKey="date" 
            height={30} 
            stroke="#8884d8" 
            fill="#374151" 
            tickFormatter={formatXAxis}
            startIndex={dateRange.startIndex}
            endIndex={dateRange.endIndex}
            onChange={(range) => setDateRange({startIndex: range.startIndex!, endIndex: range.endIndex!})}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
};

export default StockChart;