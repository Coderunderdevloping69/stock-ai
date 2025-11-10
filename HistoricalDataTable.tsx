import React, { useState, useMemo } from 'react';
import { StockDataPoint } from '../types';
import { SortIcon } from './icons/SortIcon';

interface HistoricalDataTableProps {
  data: StockDataPoint[];
}

type SortKey = keyof StockDataPoint;
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const formatCurrency = (value: number) => value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
const formatVolume = (value: number) => {
    if (value >= 1_000_000_0) return `${(value / 1_000_000_0).toFixed(2)} Cr`;
    if (value >= 1_00_000) return `${(value / 1_00_000).toFixed(2)} L`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)} k`;
    return value.toLocaleString('en-IN');
}

const HistoricalDataTable: React.FC<HistoricalDataTableProps> = ({ data }) => {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });
    const [filter, setFilter] = useState('');

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredData = useMemo(() => {
        let sortableItems = [...data];

        sortableItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        if (!filter) {
            return sortableItems;
        }

        return sortableItems.filter(item =>
            item.date.toLowerCase().includes(filter.toLowerCase())
        );
    }, [data, sortConfig, filter]);

    const TableHeader: React.FC<{ sortKey: SortKey; label: string; className?: string }> = ({ sortKey, label, className }) => (
        <th 
            className={`p-3 text-sm font-semibold text-left sticky top-0 bg-gray-800 cursor-pointer hover:bg-gray-700 ${className}`}
            onClick={() => requestSort(sortKey)}
        >
            <div className="flex items-center gap-2">
                {label}
                {sortConfig.key === sortKey && <SortIcon sortDirection={sortConfig.direction} />}
            </div>
        </th>
    );

    return (
        <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                 <h2 className="text-xl font-bold text-gray-100">Historical Data</h2>
                 <input
                    type="text"
                    placeholder="Filter by date (e.g., 2024-07)..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none focus:border-cyan-500 transition-colors"
                 />
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="text-gray-300">
                        <tr>
                            <TableHeader sortKey="date" label="Date" />
                            <TableHeader sortKey="open" label="Open" className="text-right" />
                            <TableHeader sortKey="high" label="High" className="text-right" />
                            <TableHeader sortKey="low" label="Low" className="text-right" />
                            <TableHeader sortKey="close" label="Close" className="text-right" />
                            <TableHeader sortKey="volume" label="Volume" className="text-right" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {sortedAndFilteredData.map((row) => {
                            const change = row.close - row.open;
                            const changeColor = change >= 0 ? 'text-green-400' : 'text-red-400';
                            return (
                                <tr key={row.date} className="hover:bg-gray-700/50">
                                    <td className="p-3 whitespace-nowrap">{new Date(row.date).toLocaleDateString('en-GB')}</td>
                                    <td className="p-3 whitespace-nowrap text-right">{formatCurrency(row.open)}</td>
                                    <td className="p-3 whitespace-nowrap text-right">{formatCurrency(row.high)}</td>
                                    <td className="p-3 whitespace-nowrap text-right">{formatCurrency(row.low)}</td>
                                    <td className={`p-3 whitespace-nowrap text-right font-bold ${changeColor}`}>{formatCurrency(row.close)}</td>
                                    <td className="p-3 whitespace-nowrap text-right text-gray-400">{formatVolume(row.volume)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoricalDataTable;