'use client';

/**
 * All Hypothesis Charts - H3, H5, H6
 * Consolidated component for remaining hypothesis visualizations
 */

import { useEffect, useState } from 'react';
import { Radar, Bar } from 'react-chartjs-2';
import { DrillDownModal } from '../DrillDownModal';

// H3: Activity Type Preference
export function H3_ActivityPreference({ cohort = 'September 2025' }: { cohort?: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDrillDown, setShowDrillDown] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/metrics/hypotheses/h3?cohort=${encodeURIComponent(cohort)}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch H3 data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [cohort]);

  if (loading) return <div className="bg-white rounded-lg shadow-sm p-6 h-96 animate-pulse" />;
  if (!data) return null;

  const chartData = {
    labels: data.categories.map((c: any) => c.name),
    datasets: [
      {
        label: 'Completion Rate %',
        data: data.categories.map((c: any) => c.completion_pct),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { stepSize: 20 },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-black"
        onClick={() => setShowDrillDown(true)}
        title="Click to see activity type details"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          H3: Activity Type Completion Patterns
        </h3>
      <div className="h-80">
        <Radar data={chartData} options={options} />
      </div>
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
        <strong>Insight:</strong> {data.insight}
      </div>
      </div>

      <DrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        metricType="h3"
        cohort={cohort}
      />
    </>
  );
}

// H5: Weekend Work Patterns
export function H5_WeekendPatterns({ cohort = 'September 2025' }: { cohort?: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDrillDown, setShowDrillDown] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/metrics/hypotheses/h5?cohort=${encodeURIComponent(cohort)}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch H5 data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [cohort]);

  if (loading) return <div className="bg-white rounded-lg shadow-sm p-6 h-96 animate-pulse" />;
  if (!data) return null;

  const chartData = {
    labels: ['Weekday (Mon-Wed)', 'Weekend (Sat-Sun)'],
    datasets: [
      {
        label: 'Submissions',
        data: [data.weekday.count, data.weekend.count],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
        borderColor: ['rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)'],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        title: { display: true, text: 'Number of Submissions' },
        beginAtZero: true,
      },
    },
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-black"
        onClick={() => setShowDrillDown(true)}
        title="Click to see weekend vs weekday details"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          H5: Weekend vs Weekday Work Patterns
        </h3>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-600 font-semibold mb-1">Weekday Avg</div>
          <div className="text-2xl font-bold text-blue-900">{data.weekday.avgCompletion}%</div>
          <div className="text-xs text-blue-700">Completion rate</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-xs text-green-600 font-semibold mb-1">Weekend Avg</div>
          <div className="text-2xl font-bold text-green-900">{data.weekend.avgCompletion}%</div>
          <div className="text-xs text-green-700">Completion rate</div>
        </div>
      </div>
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
        <strong>Insight:</strong> {data.insight}
      </div>
      </div>

      <DrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        metricType="h5"
        cohort={cohort}
      />
    </>
  );
}

// H6: Peer Influence (Table Groups)
export function H6_PeerInfluence({ cohort = 'September 2025' }: { cohort?: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/metrics/hypotheses/h6?cohort=${encodeURIComponent(cohort)}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch H6 data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [cohort]);

  if (loading) return <div className="bg-white rounded-lg shadow-sm p-6 h-96 animate-pulse" />;
  if (!data) return null;

  // If no table group data available
  if (data.status === 'unavailable') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          H6: Peer Influence (Table Groups)
        </h3>
        <div className="h-80 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <div>Table group data not yet available</div>
            <div className="text-sm mt-2">Will be implemented when grouping data is tracked</div>
          </div>
        </div>
      </div>
    );
  }

  // TODO: Implement when table group data is available
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        H6: Peer Influence (Table Groups)
      </h3>
      <div className="h-80">
        {/* Chart implementation when data available */}
      </div>
    </div>
  );
}
