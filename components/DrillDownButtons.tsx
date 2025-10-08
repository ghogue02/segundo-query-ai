'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export interface DrillDownSuggestion {
  id: string;
  label: string;
  icon: string;
  query: string;
  queryType: 'detail' | 'comparison' | 'correlation' | 'filter' | 'temporal';
  expectedChartType: string;
  priority: number;
  description: string;
}

interface DrillDownButtonsProps {
  suggestions: DrillDownSuggestion[];
  onDrillDown: (query: string, suggestion: DrillDownSuggestion) => Promise<void>;
  disabled?: boolean;
}

export default function DrillDownButtons({
  suggestions,
  onDrillDown,
  disabled = false
}: DrillDownButtonsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleClick = async (suggestion: DrillDownSuggestion) => {
    setLoadingId(suggestion.id);
    try {
      await onDrillDown(suggestion.query, suggestion);
    } finally {
      setLoadingId(null);
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-5 mt-6">
      <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2 text-base">
        🔍 Explore Further
      </h4>
      <p className="text-sm text-purple-700 mb-4">
        Click a button to automatically drill down into this data:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => handleClick(suggestion)}
            disabled={disabled || loadingId !== null}
            title={suggestion.description}
            className="group relative flex items-center gap-3 px-4 py-3 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <span className="text-2xl flex-shrink-0">{suggestion.icon}</span>
            <span className="flex-1 text-sm font-medium text-gray-800 group-hover:text-purple-900 transition-colors">
              {suggestion.label}
            </span>
            {loadingId === suggestion.id && (
              <Loader2 className="w-4 h-4 animate-spin text-purple-600 flex-shrink-0" />
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
              {suggestion.description}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
