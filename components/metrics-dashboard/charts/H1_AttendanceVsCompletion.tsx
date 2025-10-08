'use client';

import { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { DrillDownModal } from '../DrillDownModal';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface BuilderDataPoint {
  x: number; // attendance %
  y: number; // completion %
  label: string; // builder name
  user_id: number;
}

interface ChartData {
  builders: BuilderDataPoint[];
  correlation: number;
  trendline: { x: number; y: number }[];
}

export function H1_AttendanceVsCompletion({ cohort = 'September 2025' }: { cohort?: string }) {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDrillDown, setShowDrillDown] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `/api/metrics/hypotheses/h1?cohort=${encodeURIComponent(cohort)}`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch H1 data:', error);
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
          H1: Attendance Drives Task Completion
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          Loading chart data...
        </div>
      </div>
    );
  }

  if (!data || !data.builders || data.correlation === undefined) return null;

  const chartData = {
    datasets: [
      {
        label: 'Builders',
        data: data.builders,
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
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
  } as any; // Chart.js type compatibility

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const point = context.raw as BuilderDataPoint;
            if (point.label) {
              return [
                `${point.label}`,
                `Attendance: ${point.x.toFixed(1)}%`,
                `Completion: ${point.y.toFixed(1)}%`,
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
          text: 'Attendance Rate (%)',
        },
        min: 0,
        max: 100,
      },
      y: {
        title: {
          display: true,
          text: 'Task Completion Rate (%)',
        },
        min: 0,
        max: 100,
      },
    },
  };

  const correlationText =
    data.correlation > 0.7
      ? 'Strong positive correlation'
      : data.correlation > 0.4
      ? 'Moderate positive correlation'
      : data.correlation > 0
      ? 'Weak positive correlation'
      : 'No significant correlation';

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-black"
        onClick={() => setShowDrillDown(true)}
        title="Click to see all builders' attendance vs completion data"
      >
        <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          H1: Attendance Drives Task Completion
        </h3>
        <div className="text-sm">
          <span className="text-gray-600">Correlation: </span>
          <span className="font-semibold text-blue-600">
            {data.correlation.toFixed(2)}
          </span>
          <span className="text-gray-500 ml-2">({correlationText})</span>
        </div>
      </div>

      <div className="h-80">
        <Scatter data={chartData} options={options} />
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
        <strong>Insight:</strong> {correlationText} between attendance and task completion.
        {data.correlation > 0.5 &&
          ' Builders with higher attendance tend to complete more tasks.'}
      </div>
      </div>

      <DrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        metricType="h1"
        cohort={cohort}
      />
    </>
  );
}
