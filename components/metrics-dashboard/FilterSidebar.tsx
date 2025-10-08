'use client';

import { useState, useEffect } from 'react';
import { Tooltip } from '@/components/ui/tooltip';
import { calculateWeekRanges, getCurrentWeek } from '@/lib/utils/cohort-dates';

export interface FilterState {
  timeRange: 'all' | '7days' | '14days' | '30days' | 'custom';
  customRange?: { start: Date; end: Date };
  weeks: number[]; // Week numbers to include (1-4)
  daysOfWeek: string[]; // ['Mon', 'Tue', 'Wed', 'Sat', 'Sun']
  builderSegment: 'all' | 'top' | 'struggling' | 'custom';
  selectedBuilders: number[];
  activityCategories: string[]; // ['learning', 'building', 'collaboration', 'reflection', 'other']
  taskTypes: string[]; // ['individual', 'group']
  taskModes: string[]; // ['conversation', 'basic']
}

// Calculate default weeks dynamically (only called in useEffect to avoid hydration mismatch)
const getDefaultWeeks = (cohortName: string = 'September 2025'): number[] => {
  if (typeof window === 'undefined') {
    // Server-side: return all 8 weeks to avoid hydration mismatch
    return [1, 2, 3, 4, 5, 6, 7, 8];
  }
  const currentWeek = getCurrentWeek(cohortName);
  const allWeeks = calculateWeekRanges(cohortName);
  // Default to all weeks up to current week
  return allWeeks.slice(0, currentWeek).map(w => w.weekNumber);
};

export const DEFAULT_FILTERS: FilterState = {
  timeRange: 'all',
  weeks: [1, 2, 3, 4, 5, 6, 7, 8], // Default to all 8 weeks (prevents hydration mismatch)
  daysOfWeek: ['Mon', 'Tue', 'Wed', 'Sat', 'Sun'], // Exclude Thu/Fri (no class)
  builderSegment: 'all',
  selectedBuilders: [],
  activityCategories: ['learning', 'building'], // Priority categories
  taskTypes: ['individual', 'group'],
  taskModes: ['conversation', 'basic'],
};

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  builderCount?: number;
}

export function FilterSidebar({ filters, onChange, builderCount = 76 }: FilterSidebarProps) {
  const cohortName = 'September 2025';
  const weekRanges = calculateWeekRanges(cohortName);
  const currentWeek = getCurrentWeek(cohortName);

  const [counts, setCounts] = useState<{
    segments: { all: number; top: number; struggling: number };
    categories: Record<string, number>;
  }>({
    segments: { all: builderCount, top: 0, struggling: 0 },
    categories: {}
  });

  // Fetch filter counts on mount
  useEffect(() => {
    fetch('/api/metrics/filter-counts?cohort=September%202025')
      .then(res => res.json())
      .then(data => setCounts(data))
      .catch(err => console.error('Failed to fetch filter counts:', err));
  }, []);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = <K extends keyof FilterState>(
    key: K,
    value: string | number
  ) => {
    const current = filters[key] as any[];
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: newValue });
  };

  // Helper function for date ranges
  const getDateRange = (days: number): string => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} - ${fmt(end)}`;
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 p-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Filters
        </h2>
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Reset
        </button>
      </div>

      {/* Time Range */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Time Range
        </h3>
        <div className="space-y-2">
          {[
            { value: '7days', label: `Last 7 days (${getDateRange(7)})` },
            { value: '14days', label: `Last 14 days (${getDateRange(14)})` },
            { value: '30days', label: `Last 30 days (${getDateRange(30)})` },
            { value: 'all', label: `All time (Sept 6 - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` },
          ].map((option) => (
            <label key={option.value} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="timeRange"
                value={option.value}
                checked={filters.timeRange === option.value}
                onChange={(e) => updateFilter('timeRange', e.target.value as any)}
                className="mr-3 h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 my-6" />

      {/* Week Selection - Dynamic */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Week Selection
        </h3>
        <div className="space-y-2">
          {weekRanges.map((week) => (
            <label key={week.weekNumber} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.weeks.includes(week.weekNumber)}
                  onChange={() => toggleArrayItem('weeks', week.weekNumber)}
                  className="mr-3 h-4 w-4 text-blue-600 rounded"
                />
                <span className={`text-sm ${week.weekNumber === currentWeek ? 'font-semibold text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                  {week.label} ({week.dateRange})
                </span>
              </div>
              {week.weekNumber === currentWeek && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Current
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 my-6" />

      {/* Builder Segments */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Builder Segments
        </h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center">
              <input
                type="radio"
                name="builderSegment"
                value="all"
                checked={filters.builderSegment === 'all'}
                onChange={(e) => updateFilter('builderSegment', e.target.value as any)}
                className="mr-3 h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                All Builders ({builderCount})
              </span>
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-1.5">
              <input
                type="radio"
                name="builderSegment"
                value="top"
                checked={filters.builderSegment === 'top'}
                onChange={(e) => updateFilter('builderSegment', e.target.value as any)}
                className="mr-3 h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                Top Performers
              </span>
              <Tooltip content={
                <div className="text-xs max-w-xs">
                  <div className="font-semibold mb-1">Criteria:</div>
                  <div>• &gt;90% attendance AND &gt;90% completion</div>
                  <div>• OR engagement score &gt;80</div>
                </div>
              }>
                <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </Tooltip>
            </div>
            {counts.segments?.top > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {counts.segments.top}
              </span>
            )}
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-1.5">
              <input
                type="radio"
                name="builderSegment"
                value="struggling"
                checked={filters.builderSegment === 'struggling'}
                onChange={(e) => updateFilter('builderSegment', e.target.value as any)}
                className="mr-3 h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                Struggling
              </span>
              <Tooltip content={
                <div className="text-xs max-w-xs">
                  <div className="font-semibold mb-1">Criteria:</div>
                  <div>• &lt;50% completion OR &lt;70% attendance</div>
                  <div>• OR engagement score &lt;40</div>
                </div>
              }>
                <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </Tooltip>
            </div>
            {counts.segments?.struggling > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {counts.segments.struggling}
              </span>
            )}
          </label>
        </div>
      </div>

      <div className="border-t border-gray-200 my-6" />

      {/* Activity Categories */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Activity Category
          </h3>
          <Tooltip content={
            <div className="text-xs">
              ⭐ Core categories are selected by default for focused analysis
            </div>
          }>
            <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </Tooltip>
        </div>
        <div className="space-y-2">
          {[
            { value: 'learning', label: 'Core Learning ⭐', priority: true },
            { value: 'building', label: 'Applied Work ⭐', priority: true },
            { value: 'collaboration', label: 'Collaboration' },
            { value: 'reflection', label: 'Reflection' },
            { value: 'other', label: 'Other' },
          ].map((cat) => (
            <label key={cat.value} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.activityCategories.includes(cat.value)}
                onChange={() => toggleArrayItem('activityCategories', cat.value)}
                className="mr-3 h-4 w-4 text-blue-600 rounded"
              />
              <span
                className={`text-sm ${
                  cat.priority
                    ? 'font-medium text-gray-900'
                    : 'text-gray-700 group-hover:text-gray-900'
                }`}
              >
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 my-6" />

      {/* Task Type */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Task Type
        </h3>
        <div className="space-y-2">
          {[
            { value: 'individual', label: 'Individual' },
            { value: 'group', label: 'Group' },
          ].map((type) => (
            <label key={type.value} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.taskTypes.includes(type.value)}
                onChange={() => toggleArrayItem('taskTypes', type.value)}
                className="mr-3 h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 my-6" />

      {/* Task Mode */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Task Mode
        </h3>
        <div className="space-y-2">
          {[
            { value: 'conversation', label: 'Conversation (AI-assisted)' },
            { value: 'basic', label: 'Basic (independent)' },
          ].map((mode) => (
            <label key={mode.value} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.taskModes.includes(mode.value)}
                onChange={() => toggleArrayItem('taskModes', mode.value)}
                className="mr-3 h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {mode.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Filter Summary */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="text-xs font-semibold text-blue-900 mb-2">Active Filters</div>
        <div className="text-xs text-blue-700 space-y-1">
          <div>• {filters.timeRange === 'all' ? 'All time' : `Last ${filters.timeRange}`}</div>
          <div>• {filters.weeks.length} weeks selected</div>
          <div>• {filters.activityCategories.length} categories</div>
          <div>
            • {filters.builderSegment === 'all' ? 'All builders' : filters.builderSegment}
          </div>
        </div>
      </div>
    </div>
  );
}
