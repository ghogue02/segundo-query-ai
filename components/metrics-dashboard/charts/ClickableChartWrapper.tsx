'use client';

import { useState, ReactNode } from 'react';
import { DrillDownModal } from '../DrillDownModal';

interface ClickableChartWrapperProps {
  children: ReactNode;
  metricType: string;
  cohort?: string;
  title: string;
}

export function ClickableChartWrapper({
  children,
  metricType,
  cohort = 'September 2025',
  title,
}: ClickableChartWrapperProps) {
  const [showDrillDown, setShowDrillDown] = useState(false);

  return (
    <>
      <div
        className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-black rounded-lg"
        onClick={() => setShowDrillDown(true)}
        title={`${title} (Click to see detailed data)`}
      >
        {children}
      </div>

      <DrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        metricType={metricType}
        cohort={cohort}
      />
    </>
  );
}
