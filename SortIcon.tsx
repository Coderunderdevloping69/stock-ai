import React from 'react';

interface SortIconProps {
  sortDirection: 'ascending' | 'descending';
  className?: string;
}

export const SortIcon: React.FC<SortIconProps> = ({ sortDirection, className }) => {
    const isAsc = sortDirection === 'ascending';
    return (
        <div className={`inline-flex flex-col -space-y-1 ${className}`}>
            <svg className={`w-3 h-3 ${isAsc ? 'text-gray-200' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2.5l-6 6h12l-6-6z"></path>
            </svg>
            <svg className={`w-3 h-3 ${!isAsc ? 'text-gray-200' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 17.5l6-6H4l6 6z"></path>
            </svg>
        </div>
    );
};