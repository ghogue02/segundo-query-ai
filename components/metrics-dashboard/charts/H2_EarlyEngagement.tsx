'use client';

import { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import { DrillDownModal } from '../DrillDownModal';

interface BuilderDataPoint {
  x: number; // Week 1 submissions
  y: number; // Total submissions
  label: string;
  user_id: number;
}

interface ChartData {
  builders: BuilderDataPoint[];
  correlation: number;
  trendline: { x: number; y: number }[];
  insights: {
    avgWeek1: number;
    topPerformersAvgWeek1: number;
    strugglingAvgWeek1: number;
  };
}

export function H2_EarlyEngagement({ cohort = 'September 2025' }: { cohort?: string }) {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDrillDown, setShowDrillDown] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `/api/metrics/hypotheses/h2?cohort=${encodeURIComponent(cohort)}`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch H2 data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [cohort]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          H2: Early Engagement Predicts Success
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          Loading chart data...
        </div>
      </div>
    );
  }

  if (!data || !data.builders || !data.correlation) return null;

  const chartData = {
    datasets: [
      {
        label: 'Builders',
        data: data.builders,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Trend Line',
        data: data.trendline,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 0.8)',
        borderWidth: 2,
        pointRadius: 0,
        showLine: true,
      },
    ],
  } as any;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const point = context.raw as BuilderDataPoint;
            if (point.label) {
              return [
                `${point.label}`,
                `Week 1: ${point.x} submissions`,
                `Total: ${point.y} submissions`,
              ];
            }
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Week 1 Submissions',
        },
        min: 0,
      },
      y: {
        title: {
          display: true,
          text: 'Total Submissions (All Weeks)',
        },
        min: 0,
      },
    },
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-black"
        onClick={() => setShowDrillDown(true)}
        title="Click to see all builders' Week 1 vs Total engagement"
      >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          H2: Early Engagement Predicts Success
        </h3>
        <div className="text-sm">
          <span className="text-gray-600">Correlation: </span>
          <span className="font-semibold text-green-600">{data.correlation.toFixed(2)}</span>
        </div>
      </div>

      <div className="h-80">
        <Scatter data={chartData} options={options} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-600 font-semibold mb-1">Cohort Avg</div>
          <div className="text-2xl font-bold text-blue-900">
            {data.insights.avgWeek1.toFixed(1)}
          </div>
          <div className="text-xs text-blue-700">Week 1 submissions</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-xs text-green-600 font-semibold mb-1">Top Performers</div>
          <div className="text-2xl font-bold text-green-900">
            {data.insights.topPerformersAvgWeek1.toFixed(1)}
          </div>
          <div className="text-xs text-green-700">Week 1 avg</div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="text-xs text-red-600 font-semibold mb-1">Struggling</div>
          <div className="text-2xl font-bold text-red-900">
            {data.insights.strugglingAvgWeek1.toFixed(1)}
          </div>
          <div className="text-xs text-red-700">Week 1 avg</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-900">
        <strong>Insight:</strong> Early engagement in Week 1 {data.correlation > 0.5 ? 'strongly' : 'moderately'} predicts overall success.
        Top performers averaged {data.insights.topPerformersAvgWeek1.toFixed(1)} submissions in Week 1.
      </div>
      </div>

      <DrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        metricType="h2"
        cohort={cohort}
      />
    </>
  );
}
