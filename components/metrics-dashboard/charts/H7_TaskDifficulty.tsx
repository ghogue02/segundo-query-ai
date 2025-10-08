'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { BarElement } from 'chart.js';
import { Chart as ChartJS } from 'chart.js';
import { DrillDownModal } from '../DrillDownModal';

ChartJS.register(BarElement);

interface TaskData {
  task_id: number;
  task_title: string;
  completion_rate: number;
  total_builders: number;
  completed_count: number;
  difficulty: string;
}

interface ChartData {
  tasks: TaskData[];
  distribution: {
    easy: number;
    medium: number;
    hard: number;
    veryHard: number;
  };
  needsRedesign: TaskData[];
}

export function H7_TaskDifficulty({ cohort = 'September 2025' }: { cohort?: string }) {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDrillDown, setShowDrillDown] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `/api/metrics/hypotheses/h7?cohort=${encodeURIComponent(cohort)}`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch H7 data:', error);
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
          Task Completion by Difficulty Level
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          Loading chart data...
        </div>
      </div>
    );
  }

  if (!data || !data.distribution || !data.tasks) return null;

  const chartData = {
    labels: ['Easy (>90%)', 'Medium (70-90%)', 'Hard (50-70%)', 'Very Hard (<50%)'],
    datasets: [
      {
        label: 'Number of Tasks',
        data: [
          data.distribution.easy,
          data.distribution.medium,
          data.distribution.hard,
          data.distribution.veryHard,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const index = context.dataIndex;
            const categories = ['easy', 'medium', 'hard', 'veryHard'] as const;
            const category = categories[index];
            const count = data.distribution[category];
            const total = Object.values(data.distribution).reduce((a, b) => a + b, 0);
            const pct = ((count / total) * 100).toFixed(1);
            return `${pct}% of all tasks`;
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Number of Tasks',
        },
        beginAtZero: true,
      },
      x: {
        title: {
          display: true,
          text: 'Completion Rate Range',
        },
      },
    },
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-black"
        onClick={() => setShowDrillDown(true)}
        title="Click to see all tasks with completion rates"
      >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Task Completion by Difficulty Level
      </h3>

      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>

      {data.needsRedesign.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <div className="text-sm font-semibold text-red-900 mb-2">
            🚨 {data.needsRedesign.length} Tasks Need Review (under 70% completion)
          </div>
          <div className="space-y-1">
            {data.needsRedesign.slice(0, 5).map((task) => (
              <div key={task.task_id} className="text-sm text-red-800">
                • {task.task_title} ({task.completion_rate}% completion)
              </div>
            ))}
            {data.needsRedesign.length > 5 && (
              <div className="text-xs text-red-700 italic">
                +{data.needsRedesign.length - 5} more tasks...
              </div>
            )}
          </div>
        </div>
      )}

      {data.needsRedesign.length === 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-900">
          <strong>Insight:</strong> All tasks have over 70% completion rate. No immediate redesign needed.
        </div>
      )}
      </div>

      <DrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        metricType="h7"
        cohort={cohort}
      />
    </>
  );
}
