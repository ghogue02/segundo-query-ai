'use client';

import { useState } from 'react';

/**
 * Terminology Legend Tab
 * Defines all metrics clearly for stakeholder alignment
 */

const METRIC_DEFINITIONS = [
  {
    id: 'engagement-score',
    name: 'Engagement Score',
    definition: 'Composite metric combining attendance, task completion, and quality assessment',
    calculation: 'Engagement Score = (Attendance % × 0.3) + (Completion % × 0.5) + (Quality Score × 0.2)',
    weights: {
      attendance: '30%',
      completion: '50%',
      quality: '20%',
    },
    ranges: [
      { range: '0-40', label: 'Struggling', color: 'Red' },
      { range: '40-80', label: 'On Track', color: 'Gray' },
      { range: '80-100', label: 'Top Performer', color: 'Green' },
    ],
    example: 'Builder with 80% attendance, 70% completion, and 60 quality score: (80 × 0.3) + (70 × 0.5) + (60 × 0.2) = 24 + 35 + 12 = 71 (On Track)',
    updateFrequency: 'Real-time (recalculated on each page load)',
  },
  {
    id: 'need-intervention',
    name: 'Need Intervention',
    definition: 'Builders who require additional support based on performance thresholds',
    criteria: [
      'Task Completion < 50% OR',
      'Attendance Rate < 70%',
    ],
    calculation: 'WHERE completion_pct < 50 OR attendance_pct < 70',
    flagReasons: [
      '"Both low" - Both completion and attendance below thresholds',
      '"Low completion" - Task completion < 50% only',
      '"Low attendance" - Attendance rate < 70% only',
    ],
    example: 'Builder with 45% completion and 80% attendance → Flagged for "Low completion"',
    updateFrequency: 'Real-time',
    actionable: 'Use this list to identify builders who may need check-ins, tutoring, or schedule adjustments',
  },
  {
    id: 'attendance',
    name: 'Attendance',
    definition: 'Builder checked in during scheduled class time (Mon-Wed, Sat-Sun only)',
    calculation: 'COUNT(attendance.status = \'present\') ÷ COUNT(curriculum_days)',
    exclusions: [
      'No class on Thu/Fri',
      'No class on 9/15/2025 (holiday)',
      'Staff users excluded (IDs: 129, 5, 240, 326)',
      'Volunteer users excluded (IDs: 327, 329, 331, 330, 328, 332)',
    ],
    dataSource: 'builder_attendance_new table',
    updateFrequency: 'Real-time',
    example: 'If there are 19 class days and builder attended 17: Attendance = 17 ÷ 19 = 89.5%',
  },
  {
    id: 'task-completion',
    name: 'Task Completion',
    definition: 'Builder had ANY text conversation or interaction with the task in the tool',
    calculation: 'EXISTS(task_submission WHERE task_id = X AND user_id = Y)',
    whatCounts: [
      'ANY conversation/text back and forth with the tool',
      'Any text submission (including "I need help" or questions)',
      'Conversation with AI helper in the task',
      'Deliverable upload with text',
      'Does NOT count: Just viewing task with no interaction',
    ],
    dataSource: 'task_submissions table (thread_content field)',
    updateFrequency: 'Real-time',
    example: 'If builder has ANY text in thread_content → counts as completed. Example: "I\'m working on this" or "Here\'s my answer" both count.',
    note: 'This measures ENGAGEMENT (did they interact?), not QUALITY (how good was it?). See "Quality Score" for assessment of work quality.',
  },
  {
    id: 'quality-score',
    name: 'Quality Score',
    definition: 'Assessment rubric score from comprehensive AI analysis',
    calculation: 'Average of assessment scores across all rubric categories',
    rubricCategories: [
      'Product & Business Thinking',
      'Professional & Learning Skills',
      'AI Direction & Collaboration',
      'Technical Concepts & Integration',
    ],
    dataSource: 'BigQuery: comprehensive_assessment_analysis',
    updateFrequency: 'Daily (after assessments are graded)',
    example: 'Builder scores: Assessment 1 (85%), Assessment 2 (78%), Assessment 3 (90%) → Avg = 84%',
    scoreInterpretation: [
      '90-100%: Excellent',
      '80-89%: Good',
      '70-79%: Satisfactory',
      '60-69%: Needs Improvement',
      '0-59%: Poor',
    ],
  },
  {
    id: 'active-builder',
    name: 'Active Builder',
    definition: 'Builder with at least 1 submission in the specified time period',
    calculation: 'COUNT(DISTINCT user_id) FROM task_submissions WHERE created_at BETWEEN [start] AND [end]',
    timePeriods: ['Today', 'Prior Day', '7-day average', 'Custom range'],
    dataSource: 'task_submissions table',
    updateFrequency: 'Real-time',
    example: '"68 active builders today" = 68 builders submitted something today',
  },
  {
    id: 'struggling-builder-threshold',
    name: 'Struggling Builder (Threshold)',
    definition: 'Builder meeting ANY of these criteria',
    criteria: [
      'Task completion rate < 50%',
      'Attendance rate < 70%',
    ],
    calculation: 'WHERE completion_pct < 50 OR attendance_pct < 70',
    dataSource: 'Calculated from task_submissions + builder_attendance_new',
    updateFrequency: 'Real-time',
    example: 'Builder with 45% completion OR 65% attendance = Flagged',
  },
  {
    id: 'struggling-builder-composite',
    name: 'Struggling Builder (Composite Score)',
    definition: 'Builder with Engagement Score < 40',
    calculation: 'Engagement Score = (Attendance × 0.3) + (Completion × 0.5) + (Quality × 0.2)',
    weights: {
      attendance: '30%',
      completion: '50%',
      quality: '20%',
    },
    dataSource: 'Calculated from multiple sources',
    updateFrequency: 'Real-time',
    example: 'Attendance 70%, Completion 60%, Quality 75% → Score = (70×0.3) + (60×0.5) + (75×0.2) = 66 (Not struggling)',
  },
  {
    id: 'top-performer-threshold',
    name: 'Top Performer (Threshold)',
    definition: 'Builder meeting ALL of these criteria',
    criteria: [
      'Task completion rate > 90%',
      'Attendance rate > 90%',
    ],
    calculation: 'WHERE completion_pct > 90 AND attendance_pct > 90',
    dataSource: 'Calculated from task_submissions + builder_attendance_new',
    updateFrequency: 'Real-time',
    example: 'Builder with 92% completion AND 95% attendance = Top Performer',
  },
  {
    id: 'top-performer-composite',
    name: 'Top Performer (Composite Score)',
    definition: 'Builder with Engagement Score > 80',
    calculation: 'Engagement Score = (Attendance × 0.3) + (Completion × 0.5) + (Quality × 0.2)',
    weights: {
      attendance: '30%',
      completion: '50%',
      quality: '20%',
    },
    dataSource: 'Calculated from multiple sources',
    updateFrequency: 'Real-time',
    example: 'Attendance 90%, Completion 95%, Quality 85% → Score = (90×0.3) + (95×0.5) + (85×0.2) = 91.5 (Top Performer)',
  },
  {
    id: '7-day-class-average',
    name: '7-Day Class Average',
    definition: 'Average across last 7 CLASS days only (excludes Thu/Fri when builders are off)',
    classDays: ['Monday', 'Tuesday', 'Wednesday', 'Saturday', 'Sunday'],
    excludedDays: ['Thursday (OFF)', 'Friday (OFF)'],
    calculation: 'AVG(metric) over last 7 days WHERE day_of_week NOT IN (Thu, Fri)',
    dataSource: 'Various (depends on metric)',
    updateFrequency: 'Real-time',
    example: 'If Mon-Wed, Sat-Sun had values: 70, 65, 72, 68, 71 → Avg = 69.2%',
    note: 'CRITICAL: Builders are OFF on Thursdays and Fridays (no class). These days are EXCLUDED from all averages and attendance calculations. If you see "0 active builders" on Thu/Fri, this is expected.',
  },
];

export function TerminologyLegend() {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Terminology Legend</h2>
        <p className="text-sm text-gray-600 mt-2">
          Common definitions for all stakeholders. Click any metric to see full details.
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {METRIC_DEFINITIONS.map((metric) => {
          const isExpanded = expandedMetric === metric.id;

          return (
            <div key={metric.id} className="p-6">
              <button
                onClick={() => setExpandedMetric(isExpanded ? null : metric.id)}
                className="w-full flex items-center justify-between text-left group"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {metric.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{metric.definition}</p>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="mt-4 pl-4 border-l-4 border-blue-200 space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Calculation</div>
                    <code className="block p-3 bg-gray-50 rounded text-sm font-mono text-gray-900">
                      {metric.calculation}
                    </code>
                  </div>

                  {metric.whatCounts && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">What Counts</div>
                      <ul className="space-y-1">
                        {metric.whatCounts.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {metric.criteria && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Criteria</div>
                      <ul className="list-disc list-inside space-y-1">
                        {metric.criteria.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {metric.weights && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Score Weights</div>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(metric.weights).map(([key, value]) => (
                          <div key={key} className="p-2 bg-blue-50 rounded text-center">
                            <div className="text-xs text-blue-600 uppercase">{key}</div>
                            <div className="text-lg font-bold text-blue-900">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {metric.exclusions && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Exclusions</div>
                      <ul className="list-disc list-inside space-y-1">
                        {metric.exclusions.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {metric.rubricCategories && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Rubric Categories</div>
                      <ul className="list-disc list-inside space-y-1">
                        {metric.rubricCategories.map((cat, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            {cat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {metric.scoreInterpretation && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Score Interpretation</div>
                      <div className="space-y-1">
                        {metric.scoreInterpretation.map((level, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className={`w-3 h-3 rounded-full ${
                              i === 0 ? 'bg-green-500' :
                              i === 1 ? 'bg-blue-500' :
                              i === 2 ? 'bg-yellow-500' :
                              i === 3 ? 'bg-orange-500' :
                              'bg-red-500'
                            }`} />
                            <span className="text-gray-600">{level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-semibold text-gray-700 mb-1">Data Source</div>
                      <div className="text-gray-600">{metric.dataSource}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700 mb-1">Update Frequency</div>
                      <div className="text-gray-600">{metric.updateFrequency}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-semibold text-green-900 mb-1">Example</div>
                    <div className="text-sm text-green-800">{metric.example}</div>
                  </div>

                  {metric.note && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-sm font-semibold text-yellow-900 mb-1">⚠️ Important Note</div>
                      <div className="text-sm text-yellow-800">{metric.note}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Excluded Users</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-gray-700 mb-2">Staff (4 users)</div>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Afiya Augustine (ID: 129)</li>
              <li>Greg Hogue (ID: 5)</li>
              <li>Carlos Godoy - duplicates (IDs: 240, 326)</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-2">Volunteers (6 users)</div>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Jason Specland (ID: 327)</li>
              <li>Brian Heckman (ID: 329)</li>
              <li>Hasani Blackwell (ID: 331)</li>
              <li>David Caiafa (ID: 330)</li>
              <li>Rivas Elvimar (ID: 328)</li>
              <li>Joe Fabisevich (ID: 332)</li>
            </ul>
          </div>
        </div>
        <div className="mt-4">
          <div className="font-semibold text-gray-700 mb-2">Inactive/Duplicates (3 users)</div>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Farid ahmad Sofizada - duplicate (ID: 324)</li>
            <li>Aaron Glaser (ID: 325)</li>
            <li>Laziah Bernstine (ID: 9)</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm font-semibold text-blue-900 mb-2">Active Builder Count</div>
          <div className="text-3xl font-bold text-blue-900">76</div>
          <div className="text-sm text-blue-700 mt-1">September 2025 cohort (after exclusions)</div>
        </div>
      </div>
    </div>
  );
}
