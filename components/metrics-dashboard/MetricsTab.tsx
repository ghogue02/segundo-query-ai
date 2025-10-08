'use client';

/**
 * Main Metrics Dashboard Component
 * Integrates all hypothesis charts, filters, KPIs, and quality metrics
 */

import { useState } from 'react';
import Link from 'next/link';
import { FilterSidebar, FilterState, DEFAULT_FILTERS } from './FilterSidebar';
import { KPICards } from './KPICards';
import { QualityMetrics } from './QualityMetrics';
import { RefreshIndicator } from './RefreshIndicator';
import { TerminologyLegend } from './TerminologyLegend';
import { H1_AttendanceVsCompletion } from './charts/H1_AttendanceVsCompletion';
import { H2_EarlyEngagement } from './charts/H2_EarlyEngagement';
import { H4_ImprovementTrajectory } from './charts/H4_ImprovementTrajectory';
import { H7_TaskDifficulty } from './charts/H7_TaskDifficulty';
import { H3_ActivityPreference, H5_WeekendPatterns, H6_PeerInfluence } from './charts/AllHypothesisCharts';

type TabType = 'operational' | 'experimental' | 'natural-language' | 'terminology';

interface MetricsTabProps {
  cohort?: string;
  defaultTab?: TabType;
}

export function MetricsTab({ cohort = 'September 2025', defaultTab = 'operational' }: MetricsTabProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const tabs = [
    { id: 'operational' as const, label: 'Operational', icon: '📈', description: 'Key metrics for daily decision-making' },
    { id: 'experimental' as const, label: 'Experimental', icon: '🔬', description: 'Research hypotheses and long-term insights' },
    { id: 'natural-language' as const, label: 'Natural Language', icon: '💬', description: 'Ask questions in plain English' },
    { id: 'terminology' as const, label: 'Terminology', icon: '📖', description: 'Definitions and data sources' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
              ← Home
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cohort Analytics Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">September 2025 Cohort</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/query" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
              💬 Natural Language
            </Link>
            <RefreshIndicator onRefresh={handleRefresh} />
            <button
              onClick={() => setActiveTab('terminology')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              📖 Legend
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 font-medium text-sm transition-colors relative group
                ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
              aria-label={`${tab.label}: ${tab.description}`}
              title={tab.description}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex">
        {/* Sidebar - Only show on operational and experimental tabs */}
        {(activeTab === 'operational' || activeTab === 'experimental') && (
          <FilterSidebar filters={filters} onChange={setFilters} />
        )}

        {/* Main Content */}
        <div className="flex-1">
          {/* Operational Tab - Daily Decision-Making Metrics */}
          {activeTab === 'operational' && (
            <div className="p-6">
              {/* Section Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Operational Metrics</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Key performance indicators for daily cohort management and decision-making
                </p>
              </div>

              {/* KPI Cards */}
              <KPICards cohort={cohort} refreshTrigger={refreshTrigger} />

              {/* Engagement Trends */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement & Progress</h3>
                <p className="text-sm text-gray-600">
                  Track task completion and attendance trends across completed weeks. Both metrics calculated as averages across all active builders.
                </p>
              </div>
              <div className="mb-8">
                <H4_ImprovementTrajectory cohort={cohort} />
              </div>
            </div>
          )}

          {/* Experimental Tab - Research Hypotheses */}
          {activeTab === 'experimental' && (
            <div className="p-6">
              {/* Section Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Experimental Insights</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Research hypotheses and long-term pattern analysis for curriculum development and team insights
                </p>
              </div>

              {/* Info Banner */}
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔬</span>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-purple-900 mb-1">About This Tab</h3>
                    <p className="text-sm text-purple-800">
                      These charts represent hypotheses and experimental metrics. Some are ready for insights, others need data review:
                      <br />• <strong>Ready:</strong> H1, H2, H3, H5, H6 (long-term curriculum insights and peer dynamics)
                      <br />• <strong>Needs Review:</strong> Quality by Category (BigQuery rubric data), H7 (task difficulty classification)
                      <br />• <strong>Use for:</strong> Long-term curriculum design, cohort dynamics research, peer feedback optimization
                    </p>
                  </div>
                </div>
              </div>

              {/* Quality Metrics with Documentation */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assessment Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Note:</strong> Quality by Category uses BigQuery rubric assessments—useful for gauging cohort performance in Technical Skills, Business Development, L2L Skills, etc. Currently shows low scores (32-59%) from limited assessment data. Review with content team before making curriculum decisions.
                </p>
              </div>
              <QualityMetrics cohort={cohort} />

              {/* H1 & H2: Long-term insights */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Pattern Correlations</h3>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>H1:</strong> Attendance vs. completion correlation (useful long-term for other teams)
                  <br />
                  <strong>H2:</strong> Early engagement patterns (nice insight but not operationally critical)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <H1_AttendanceVsCompletion cohort={cohort} />
                <H2_EarlyEngagement cohort={cohort} />
              </div>

              {/* H3 & H5: Activity and timing patterns */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity & Timing Patterns</h3>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>H3:</strong> Activity type completion (collaboration = applied work with peers, feedback, pair work)
                  <br />
                  <strong>H5:</strong> Weekend vs weekday patterns (useful for technical vs L2L vs business development breakdown)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <H3_ActivityPreference cohort={cohort} />
                <H5_WeekendPatterns cohort={cohort} />
              </div>

              {/* H6: Peer Influence */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Peer Dynamics</h3>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>H6:</strong> Peer influence patterns—can inform peer feedback analysis, table grouping strategies, and identifying who may benefit from regrouping
                </p>
              </div>
              <div className="mb-8">
                <H6_PeerInfluence cohort={cohort} />
              </div>

              {/* H7: Task Difficulty (needs refinement) */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Difficulty Analysis</h3>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>H7:</strong> Task completion by difficulty level—currently showing all retros/build time as 0% completion (needs data review)
                </p>
              </div>
              <div className="mb-8">
                <H7_TaskDifficulty cohort={cohort} />
              </div>
            </div>
          )}

          {/* Natural Language Tab */}
          {activeTab === 'natural-language' && (
            <div className="p-6">
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Natural Language Query Interface
                </h2>
                <p className="text-gray-600 mb-6">
                  This tab will contain the existing natural language query interface.
                  <br />
                  (Already built - just needs to be integrated here)
                </p>
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
                  See current implementation at homepage
                </div>
              </div>
            </div>
          )}

          {/* Terminology Tab */}
          {activeTab === 'terminology' && (
            <div className="p-6">
              <TerminologyLegend />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
