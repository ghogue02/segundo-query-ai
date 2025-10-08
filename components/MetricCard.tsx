'use client';

import { useState } from 'react';
import { Database, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ChartRenderer from './ChartRenderer';

interface MetricCardProps {
  metric: {
    id: string;
    label: string;
    sql: string;
    explanation: string;
    chartType: string;
    xAxis?: string;
    yAxis?: string;
    results: Record<string, unknown>[];
    insights: string[];
    error?: string;
    resultCount: number;
  };
  index: number;
  onTaskClick?: (taskId: number) => void;
  onBuilderClick?: (builderId: number) => void;
}

export default function MetricCard({ metric, index, onTaskClick, onBuilderClick }: MetricCardProps) {
  const [showSQL, setShowSQL] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index}
              </span>
              {metric.label}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{metric.explanation}</p>
          </div>
          <button
            onClick={() => setShowSQL(!showSQL)}
            className="ml-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 flex-shrink-0"
          >
            <Database className="w-4 h-4" />
            {showSQL ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showSQL && (
          <div className="mt-3 p-3 bg-gray-900 text-gray-100 rounded text-xs font-mono overflow-x-auto">
            {metric.sql}
          </div>
        )}
      </div>

      {/* Error Display */}
      {metric.error && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-700 text-sm">{metric.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chart Display */}
      {!metric.error && metric.results.length > 0 && (
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-gray-700 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Results ({metric.resultCount} row{metric.resultCount !== 1 ? 's' : ''})
            </h5>
          </div>

          <ChartRenderer
            data={metric.results}
            chartType={metric.chartType as 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table'}
            xAxis={metric.xAxis}
            yAxis={metric.yAxis}
            onTaskClick={onTaskClick}
            onBuilderClick={onBuilderClick}
          />

          {/* Insights */}
          {metric.insights && metric.insights.length > 0 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h6 className="font-semibold text-blue-900 mb-2 text-sm">
                💡 Insights
              </h6>
              <ul className="space-y-1">
                {metric.insights.map((insight, i) => (
                  <li key={i} className="text-blue-800 text-xs flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty Results */}
      {!metric.error && metric.results.length === 0 && (
        <div className="p-6 bg-yellow-50 border-t border-yellow-200 text-center">
          <p className="text-yellow-800 text-sm">No results found for this metric</p>
        </div>
      )}
    </div>
  );
}
