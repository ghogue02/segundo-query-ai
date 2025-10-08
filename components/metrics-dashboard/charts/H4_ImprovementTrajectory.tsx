'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { DrillDownModal } from '../DrillDownModal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeekData {
  week_number: number;
  week_label: string;
  completion_pct: number;
  attendance_pct: number;
  active_builders: number;
}

interface ChartData {
  weeks: WeekData[];
  trends: {
    completion: 'improving' | 'declining' | 'stable';
    attendance: 'improving' | 'declining' | 'stable';
    overallDirection: string;
  };
}

export function H4_ImprovementTrajectory({ cohort = 'September 2025' }: { cohort?: string }) {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDrillDown, setShowDrillDown] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `/api/metrics/hypotheses/h4?cohort=${encodeURIComponent(cohort)}`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch H4 data:', error);
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
          Week-over-Week Performance Trends
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          Loading chart data...
        </div>
      </div>
    );
  }

  if (!data || !data.weeks || !data.trends) return null;

  const chartData = {
    labels: data.weeks.map((w) => w.week_label),
    datasets: [
      {
        label: 'Task Completion %',
        data: data.weeks.map((w) => w.completion_pct),
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
      {
        label: 'Attendance %',
        data: data.weeks.map((w) => w.attendance_pct),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
    ],
  };

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
          afterLabel: (context: any) => {
            const weekIndex = context.dataIndex;
            const weekData = data.weeks[weekIndex];
            return `Active builders: ${weekData.active_builders}`;
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Percentage',
        },
        min: 0,
        max: 100,
      },
      x: {
        title: {
          display: true,
          text: 'Week',
        },
      },
    },
  };

  const trendIcon = {
    improving: '📈',
    declining: '📉',
    stable: '➡️',
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-black"
        onClick={() => setShowDrillDown(true)}
        title="Click to see week-by-week improvement details"
      >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Week-over-Week Performance Trends
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-600">Completion: </span>
            <span className="font-semibold">
              {trendIcon[data.trends.completion]} {data.trends.completion}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Attendance: </span>
            <span className="font-semibold">
              {trendIcon[data.trends.attendance]} {data.trends.attendance}
            </span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
        <strong>Insight:</strong> {data.trends.overallDirection}
      </div>
      </div>

      <DrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        metricType="h4"
        cohort={cohort}
      />
    </>
  );
}
