'use client';

import { cn } from '@/lib/utils';

/**
 * Skeleton Component
 *
 * Provides accessible loading placeholders with pulse animation
 * for better perceived performance during data fetches.
 *
 * Features:
 * - Smooth pulse animation
 * - ARIA live region for screen readers
 * - Customizable dimensions
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading content"
      {...props}
    />
  );
}

/**
 * KPI Card Skeleton
 * Matches the structure of actual KPI cards
 */
export function KPICardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-100">
      {/* Icon */}
      <Skeleton className="h-8 w-8 rounded mb-3" />

      {/* Label */}
      <Skeleton className="h-3 w-24 rounded mb-3" />

      {/* Value */}
      <Skeleton className="h-8 w-16 rounded mb-2" />

      {/* Change indicator */}
      <Skeleton className="h-3 w-20 rounded" />
    </div>
  );
}

/**
 * Table Row Skeleton
 * For loading states in data tables
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Chart Skeleton
 * For loading visualization placeholders
 */
export function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-32 rounded" />
      <Skeleton className="h-64 w-full rounded-lg" />
      <div className="flex gap-4">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
    </div>
  );
}
