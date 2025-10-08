'use client';

import { useEffect, useState } from 'react';

interface RefreshIndicatorProps {
  onRefresh: () => void;
  autoRefreshInterval?: number; // milliseconds
}

export function RefreshIndicator({
  onRefresh,
  autoRefreshInterval = 300000, // 5 minutes default
}: RefreshIndicatorProps) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState<string>('just now');
  const [nextRefreshIn, setNextRefreshIn] = useState<number>(autoRefreshInterval / 1000);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      onRefresh();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, onRefresh]);

  // Update "time ago" and countdown every second
  useEffect(() => {
    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
      const remaining = Math.max(0, (autoRefreshInterval / 1000) - seconds);

      setNextRefreshIn(remaining);

      if (seconds < 60) {
        setTimeAgo('just now');
      } else if (seconds < 120) {
        setTimeAgo('1 minute ago');
      } else if (seconds < 300) {
        setTimeAgo(`${Math.floor(seconds / 60)} minutes ago`);
      } else {
        setTimeAgo('5+ minutes ago');
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000); // Update every second for countdown

    return () => clearInterval(interval);
  }, [lastRefresh, autoRefreshInterval]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
    setNextRefreshIn(autoRefreshInterval / 1000);
    onRefresh();
    // Simulate refresh delay for visual feedback
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Last refreshed:</span>
        <span className="font-medium text-gray-900">{timeAgo}</span>
      </div>

      <button
        onClick={handleManualRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span>{isRefreshing ? 'Refreshing...' : 'Refresh Now'}</span>
      </button>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-400">Next refresh in</span>
        <span className="font-mono font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
          {formatCountdown(nextRefreshIn)}
        </span>
      </div>
    </div>
  );
}
