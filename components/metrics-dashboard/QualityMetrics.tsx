'use client';

import { useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  RadialLinearScale,
  Chart as ChartJS,
} from 'chart.js';
import { DrillDownModal } from './DrillDownModal';

ChartJS.register(RadialLinearScale);

interface QualityData {
  avgScore: number;
  rubricBreakdown: Array<{
    category: string;
    score: number;
  }>;
  totalAssessments: number;
  dataSources?: { overall: string; rubric: string };
  note?: string;
}

export function QualityMetrics({ cohort = 'September 2025' }: { cohort?: string }) {
  const [data, setData] = useState<QualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [drillDownType, setDrillDownType] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`/api/metrics/quality?cohort=${encodeURIComponent(cohort)}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch quality data:', error);
        // Set placeholder data when BigQuery is unavailable
        setData({
          avgScore: 0,
          rubricBreakdown: [],
          totalAssessments: 0,
          note: 'BigQuery data currently unavailable. Please check credentials configuration.'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [cohort]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-6 mb-8" role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">Loading quality metrics...</span>
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-100">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="h-16 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="mt-6 space-y-2">
            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-100">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Show informational banner if no data available
  const hasNoData = data.totalAssessments === 0 && data.rubricBreakdown.length === 0;

  const radarData = {
    labels: data.rubricBreakdown.map((r) => r.category),
    datasets: [
      {
        label: 'Cohort Average',
        data: data.rubricBreakdown.map((r) => r.score),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <>
      {hasNoData && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">BigQuery Data Unavailable</h3>
              <p className="text-sm text-yellow-800">
                {data.note || 'Quality assessment data requires BigQuery credentials to be configured. This data will populate once the BigQuery connection is established.'}
              </p>
              <p className="text-xs text-yellow-700 mt-2">
                <strong>Note:</strong> All other metrics (KPIs, engagement, hypotheses) pull from PostgreSQL and are working normally.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Overall Quality Card */}
        <div
          className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-black"
          onClick={() => setDrillDownType('quality-score')}
          title="Average quality score across all task submissions analyzed by AI. Click to see individual builder scores."
        >
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Overall Quality Score</h3>
          <span className="text-gray-400 cursor-help text-sm" title="Average quality score across all task submissions analyzed by AI. Click to see individual builder scores.">
            ⓘ
          </span>
        </div>

        <div className="flex items-end gap-4">
          <div>
            <div className="text-5xl font-bold text-blue-600">{data.avgScore}</div>
            <div className="text-sm text-gray-500 mt-1">out of 100</div>
          </div>

          <div className="flex-1">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Data Source</span>
                <span className="font-semibold">Task Submissions</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Assessments</span>
                <span className="font-semibold">{data.totalAssessments}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs font-semibold text-blue-900 mb-1">Score Distribution</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
          </div>
          <div className="flex justify-between text-xs text-blue-700 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setDrillDownType('quality-task'); }}
          className="mt-2 text-sm text-blue-600 hover:underline w-full text-left"
        >
          View by Task →
        </button>
      </div>

        {/* Rubric Breakdown Radar Chart */}
        <div
          className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-black"
          onClick={() => setDrillDownType('quality-rubric')}
          title="Rubric category breakdown from curated BigQuery assessments. Click to see per-builder rubric scores."
        >
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quality by Category</h3>
          <span className="text-gray-400 cursor-help text-sm" title="Rubric category breakdown from curated BigQuery assessments. Click to see per-builder rubric scores.">
            ⓘ
          </span>
        </div>

        <div className="h-72">
          <Radar data={radarData} options={radarOptions} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {data.rubricBreakdown.map((rubric) => (
            <div key={rubric.category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-700">{rubric.category}</span>
              <span className="font-semibold text-gray-900">{rubric.score}%</span>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 mt-2">
          Data: BigQuery Rubric Assessments
        </div>
        </div>
      </div>

      <DrillDownModal
        isOpen={drillDownType !== null}
        onClose={() => setDrillDownType(null)}
        metricType={drillDownType || ''}
        cohort={cohort}
      />
    </>
  );
}
