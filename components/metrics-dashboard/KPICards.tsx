'use client';

import { useEffect, useState } from 'react';
import { DrillDownModal } from './DrillDownModal';
import { Tooltip } from '@/components/ui/tooltip';

interface KPIData {
  activeBuildersToday: number;
  activeBuildersYesterday: number;
  taskCompletionRate: number;
  attendanceRate: number;
  needingIntervention: number;
  totalBuilders: number;
  sevenDayAverage: number;
  taskCompletionLastWeek: number;
  attendanceLastWeek: number;
}

interface KPICardsProps {
  cohort?: string;
  refreshTrigger?: number;
}

export function KPICards({ cohort = 'September 2025', refreshTrigger = 0 }: KPICardsProps) {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [drillDownMetric, setDrillDownMetric] = useState<string | null>(null);
  const [lastClickedCardIndex, setLastClickedCardIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        const response = await fetch(`/api/metrics/kpis?cohort=${encodeURIComponent(cohort)}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch KPI data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchKPIs();
  }, [cohort, refreshTrigger]);

  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-6 mb-8" role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">Loading KPI metrics...</span>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-100">
            <div className="h-8 w-8 bg-gray-200 rounded mb-3 animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 rounded mb-3 animate-pulse" />
            <div className="h-8 w-16 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  // Check if today is Thursday or Friday (no class)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 4 = Thursday, 5 = Friday
  const isNoClassDay = dayOfWeek === 4 || dayOfWeek === 5;

  const cards = [
    {
      icon: '🟢',
      label: 'Attendance Today',
      value: isNoClassDay ? null : `${data.activeBuildersToday}/${data.totalBuilders}`,
      subValue: isNoClassDay ? null : `${Math.round((data.activeBuildersToday / data.totalBuilders) * 100)}%`,
      change: isNoClassDay ? null : data.activeBuildersToday - data.sevenDayAverage,
      changeLabel: 'vs 7-day class avg',
      tooltip: 'Number of builders who checked in during today\'s scheduled class time',
      tooltipExtended: 'Tracks attendance records from the builder_attendance_new table. Only counts Mon-Wed and Sat-Sun when class is scheduled.',
      drillDownType: 'attendance-today',
      isNoClassDay,
    },
    {
      icon: '🔵',
      label: 'Attendance Prior Day',
      value: `${data.activeBuildersYesterday}/${data.totalBuilders}`,
      subValue: `${Math.round((data.activeBuildersYesterday / data.totalBuilders) * 100)}%`,
      change: data.activeBuildersYesterday - data.sevenDayAverage,
      changeLabel: 'vs 7-day class avg',
      tooltip: 'Number of builders who checked in during the previous class day',
      tooltipExtended: 'Shows attendance from the most recent class day (excludes Thu/Fri when there is no class).',
      drillDownType: 'attendance-yesterday',
    },
    {
      icon: '📊',
      label: 'Task Completion',
      value: `${data.taskCompletionRate}%`,
      subValue: 'This Week',
      change: data.taskCompletionRate - data.taskCompletionLastWeek,
      changeLabel: 'vs last week',
      tooltip: 'Percentage of assigned tasks completed by builders this week',
      tooltipExtended: 'Measures engagement through task submissions. Any interaction with a task (conversation, submission, deliverable) counts as completed.',
      drillDownType: 'task-completion',
    },
    {
      icon: '👥',
      label: 'Attendance Rate',
      value: `${data.attendanceRate}%`,
      subValue: '7-Day Class Avg',
      change: data.attendanceRate - data.attendanceLastWeek,
      changeLabel: 'vs last week',
      tooltip: 'Average attendance across last 7 class days (excludes Thu/Fri)',
      tooltipExtended: 'Calculates average attendance rate over the past 7 days when class was scheduled (Mon-Wed, Sat-Sun only).',
      drillDownType: 'attendance-rate',
    },
    {
      icon: '🔴',
      label: 'Need Intervention',
      value: data.needingIntervention,
      subValue: 'builders flagged',
      change: null,
      changeLabel: '<50% completion OR <70% attendance',
      tooltip: 'Builders with less than 50% task completion OR less than 70% attendance rate',
      tooltipExtended: 'Identifies builders who need additional support based on engagement thresholds. Meeting either criterion flags the builder.',
      drillDownType: 'need-intervention',
    },
  ];

  // Handle card click and keyboard navigation
  const handleCardActivation = (drillDownType: string, index: number) => {
    setLastClickedCardIndex(index);
    setDrillDownMetric(drillDownType);
  };

  const handleModalClose = () => {
    setDrillDownMetric(null);
    // Restore focus to the card that opened the modal
    if (lastClickedCardIndex !== null) {
      setTimeout(() => {
        const cardElement = document.querySelector(`[data-card-index="${lastClickedCardIndex}"]`) as HTMLElement;
        if (cardElement) {
          cardElement.focus();
        }
      }, 100);
    }
  };

  return (
    <>
      <div className="grid grid-cols-5 gap-6 mb-8">
        {cards.map((card, index) => {
          const changeColor =
            card.change === null
              ? 'text-gray-600'
              : card.change > 0
              ? 'text-green-600'
              : card.change < 0
              ? 'text-red-600'
              : 'text-gray-600';

          const changeIcon =
            card.change === null ? '' : card.change > 0 ? '↑' : card.change < 0 ? '↓' : '→';

          // Create comprehensive ARIA label for screen readers
          const ariaLabel = card.isNoClassDay
            ? `${card.label}: No class scheduled today (Thursday or Friday). ${card.changeLabel}. Click to view details.`
            : card.change !== null && card.value
            ? `${card.label}: ${card.value}, ${Math.round((Number(card.value.split('/')[0]) / Number(card.value.split('/')[1]) || 0) * 100)}%, ${changeIcon === '↑' ? 'up' : changeIcon === '↓' ? 'down' : 'unchanged'} by ${Math.abs(card.change)} compared to ${card.changeLabel}. Click to view details.`
            : `${card.label}: ${card.value || 'Loading'} ${card.subValue || ''}. ${card.changeLabel}. Click to view details.`;

          return (
            <div
              key={index}
              data-card-index={index}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer border-2 border-gray-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="button"
              tabIndex={0}
              aria-label={ariaLabel}
              onClick={() => handleCardActivation(card.drillDownType, index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardActivation(card.drillDownType, index);
                }
              }}
            >
              {/* Icon */}
              <div className="text-3xl mb-3" aria-hidden="true">{card.icon}</div>

              {/* Label with Tooltip */}
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                {card.label}
                <Tooltip content={card.tooltipExtended || card.tooltip}>
                  <span className="text-gray-400 cursor-help" aria-label={`More information: ${card.tooltipExtended || card.tooltip}`}>
                    ⓘ
                  </span>
                </Tooltip>
              </div>

              {/* No Class Day Display */}
              {card.isNoClassDay && (
                <div className="text-gray-400">
                  <div className="text-2xl font-bold mb-2">—</div>
                  <p className="text-sm">No class scheduled</p>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-xs border border-gray-300 rounded-md">
                      {dayOfWeek === 4 ? 'Thursday' : 'Friday'} - No Class
                    </span>
                  </div>
                </div>
              )}

              {/* Regular Value Display */}
              {!card.isNoClassDay && (
                <>
                  {/* Value */}
                  <div className="text-2xl font-bold text-gray-900 mb-2">{card.value}</div>

                  {/* Sub-value or change */}
                  <div className={`text-sm font-medium ${changeColor} flex items-center gap-1`}>
                    {card.change !== null && (
                      <>
                        <span aria-hidden="true">{changeIcon}</span>
                        <span>{Math.abs(card.change)}%</span>
                      </>
                    )}
                    <span className="text-gray-500 text-xs">{card.changeLabel}</span>
                  </div>

                  {card.subValue && !card.change && (
                    <div className="text-sm text-gray-500">{card.subValue}</div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <DrillDownModal
        isOpen={drillDownMetric !== null}
        onClose={handleModalClose}
        metricType={drillDownMetric || ''}
        cohort={cohort}
      />
    </>
  );
}
