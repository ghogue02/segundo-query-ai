/**
 * Cohort Date Utilities
 * Dynamically calculates week ranges based on cohort configuration
 */

export interface CohortConfig {
  name: string;
  startDate: Date;
  endDate: Date;
  totalWeeks: number;
}

export interface WeekRange {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  label: string;
  dateRange: string;
}

// Cohort configurations
export const COHORTS: Record<string, CohortConfig> = {
  'September 2025': {
    name: 'September 2025',
    startDate: new Date('2025-09-06'), // Saturday, Sept 6
    endDate: new Date('2025-10-29'),   // Wednesday, Oct 29
    totalWeeks: 8,
  },
};

/**
 * Calculate week ranges for a cohort
 * Weeks run Saturday to Friday (7 days)
 */
export function calculateWeekRanges(cohortName: string): WeekRange[] {
  const cohort = COHORTS[cohortName];
  if (!cohort) {
    throw new Error(`Unknown cohort: ${cohortName}`);
  }

  const weeks: WeekRange[] = [];
  let currentStart = new Date(cohort.startDate);

  for (let weekNum = 1; weekNum <= cohort.totalWeeks; weekNum++) {
    // Week ends 6 days after start (Saturday to Friday)
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 6);

    // Don't go past cohort end date
    if (currentEnd > cohort.endDate) {
      currentEnd.setTime(cohort.endDate.getTime());
    }

    weeks.push({
      weekNumber: weekNum,
      startDate: new Date(currentStart),
      endDate: new Date(currentEnd),
      label: `Week ${weekNum}`,
      dateRange: formatDateRange(currentStart, currentEnd),
    });

    // Move to next week (Saturday)
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);

    // Stop if we've reached or passed the cohort end date
    if (currentStart > cohort.endDate) {
      break;
    }
  }

  return weeks;
}

/**
 * Get the current week number for a cohort
 */
export function getCurrentWeek(cohortName: string, asOfDate: Date = new Date()): number {
  const weeks = calculateWeekRanges(cohortName);

  for (const week of weeks) {
    if (asOfDate >= week.startDate && asOfDate <= week.endDate) {
      return week.weekNumber;
    }
  }

  // If before cohort starts, return week 1
  if (asOfDate < weeks[0].startDate) {
    return 1;
  }

  // If after cohort ends, return last week
  return weeks[weeks.length - 1].weekNumber;
}

/**
 * Get week range for a specific week number
 */
export function getWeekRange(cohortName: string, weekNumber: number): WeekRange | null {
  const weeks = calculateWeekRanges(cohortName);
  return weeks.find(w => w.weekNumber === weekNumber) || null;
}

/**
 * Format date range as "Sept 6-12"
 */
function formatDateRange(start: Date, end: Date): string {
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();

  // Same month: "Sept 6-12"
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  }

  // Different months: "Sept 30-Oct 6"
  return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
}

/**
 * Check if a date falls on a class day (Mon/Tue/Wed/Sat/Sun)
 * Thursday (4) and Friday (5) are NOT class days
 */
export function isClassDay(date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  return dayOfWeek !== 4 && dayOfWeek !== 5; // Exclude Thu(4) and Fri(5)
}

/**
 * Get total class days in a week range
 */
export function getClassDaysInRange(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    if (isClassDay(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Get all class dates in a week
 */
export function getClassDatesInWeek(cohortName: string, weekNumber: number): Date[] {
  const week = getWeekRange(cohortName, weekNumber);
  if (!week) return [];

  const classDates: Date[] = [];
  const current = new Date(week.startDate);

  while (current <= week.endDate) {
    if (isClassDay(current)) {
      classDates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return classDates;
}

/**
 * Format date for SQL queries (YYYY-MM-DD)
 */
export function toSQLDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get date range for SQL WHERE clause
 */
export function getSQLDateRange(cohortName: string, weekNumber?: number): {
  startDate: string;
  endDate: string;
} {
  if (weekNumber) {
    const week = getWeekRange(cohortName, weekNumber);
    if (!week) {
      throw new Error(`Invalid week number: ${weekNumber}`);
    }
    return {
      startDate: toSQLDate(week.startDate),
      endDate: toSQLDate(week.endDate),
    };
  }

  // Return entire cohort range
  const cohort = COHORTS[cohortName];
  return {
    startDate: toSQLDate(cohort.startDate),
    endDate: toSQLDate(cohort.endDate),
  };
}
