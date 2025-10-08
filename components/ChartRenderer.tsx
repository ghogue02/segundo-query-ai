'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface ChartRendererProps {
  data: Record<string, unknown>[];
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table';
  xAxis?: string;
  yAxis?: string;
  onTaskClick?: (taskId: number) => void;
  onBuilderClick?: (builderId: number) => void;
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#6366f1', '#ef4444', '#14b8a6', '#f97316'
];

function detectClickableType(data: Record<string, unknown>[]): {
  type: 'task' | 'builder' | null;
  idKey: string | null;
  nameKeys: string[];
} {
  if (!data.length) return { type: null, idKey: null, nameKeys: [] };

  const keys = Object.keys(data[0]);

  // Detect task-related data
  if (keys.includes('task_id') || (keys.includes('id') && keys.includes('task_title'))) {
    return {
      type: 'task',
      idKey: keys.includes('task_id') ? 'task_id' : 'id',
      nameKeys: ['task_title']
    };
  }

  // Detect builder-related data
  if (keys.includes('user_id') || keys.includes('first_name') || keys.includes('last_name')) {
    return {
      type: 'builder',
      idKey: 'user_id',
      nameKeys: ['first_name', 'last_name', 'email']
    };
  }

  return { type: null, idKey: null, nameKeys: [] };
}

export default function ChartRenderer({ data, chartType, xAxis, yAxis, onTaskClick, onBuilderClick }: ChartRendererProps) {
  const [showAll, setShowAll] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data to display
      </div>
    );
  }

  // Auto-detect axes if not provided
  const keys = Object.keys(data[0]);
  const xKey = xAxis || keys[0];
  const yKey = yAxis || keys[1] || keys[0];

  // Detect clickable items
  const clickable = detectClickableType(data);
  const hasClickHandler = (clickable.type === 'task' && onTaskClick) || (clickable.type === 'builder' && onBuilderClick);

  const handleRowClick = (row: Record<string, unknown>) => {
    if (!clickable.idKey || !hasClickHandler) return;

    const id = row[clickable.idKey];
    if (typeof id === 'number') {
      if (clickable.type === 'task') {
        onTaskClick?.(id);
      } else if (clickable.type === 'builder') {
        onBuilderClick?.(id);
      }
    } else if (typeof id === 'string') {
      const numId = parseInt(id);
      if (!isNaN(numId)) {
        if (clickable.type === 'task') {
          onTaskClick?.(numId);
        } else if (clickable.type === 'builder') {
          onBuilderClick?.(numId);
        }
      }
    }
  };

  // Table fallback
  if (chartType === 'table' || data.length > 100) {
    const displayData = showAll ? data : data.slice(0, 50);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {keys.map((key) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((row, i) => (
              <tr
                key={i}
                onClick={() => handleRowClick(row)}
                className={hasClickHandler ? 'cursor-pointer hover:bg-blue-50 transition-colors group' : ''}
              >
                {keys.map((key) => {
                  const isClickableCol = clickable.nameKeys.includes(key) || key === clickable.idKey;
                  return (
                    <td
                      key={key}
                      className={`px-4 py-3 text-sm whitespace-nowrap ${
                        isClickableCol && hasClickHandler
                          ? 'text-blue-700 font-medium group-hover:text-blue-900'
                          : 'text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{String(row[key])}</span>
                        {isClickableCol && hasClickHandler && (
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 50 && (
          <div className="mt-3 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show All {data.length} Rows
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  const chartHeight = 400;

  // Bar Chart
  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={yKey} fill={COLORS[0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Line Chart
  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={yKey} stroke={COLORS[0]} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Area Chart
  if (chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey={yKey} stroke={COLORS[0]} fill={COLORS[0]} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Pie Chart
  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart>
          <Pie
            data={data}
            dataKey={yKey}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Scatter Chart
  if (chartType === 'scatter') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis dataKey={yKey} />
          <Tooltip />
          <Legend />
          <Scatter data={data} fill={COLORS[0]} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  // Default to table
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {keys.map((key) => (
              <th
                key={key}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, i) => (
            <tr key={i}>
              {keys.map((key) => (
                <td key={key} className="px-4 py-3 text-sm text-gray-900">
                  {String(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
