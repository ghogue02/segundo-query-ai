import { NextRequest, NextResponse } from 'next/server';
import { calculateWeekRanges, getCurrentWeek, COHORTS } from '@/lib/utils/cohort-dates';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cohort = searchParams.get('cohort') || 'September 2025';

    const weeks = calculateWeekRanges(cohort);
    const currentWeek = getCurrentWeek(cohort);
    const cohortConfig = COHORTS[cohort];

    return NextResponse.json({
      cohort: cohortConfig.name,
      startDate: cohortConfig.startDate,
      endDate: cohortConfig.endDate,
      totalWeeks: cohortConfig.totalWeeks,
      currentWeek,
      weeks: weeks.map(w => ({
        weekNumber: w.weekNumber,
        startDate: w.startDate,
        endDate: w.endDate,
        label: w.label,
        dateRange: w.dateRange,
        isCurrent: w.weekNumber === currentWeek,
      })),
    });
  } catch (error) {
    console.error('Error fetching cohort weeks:', error);
    return NextResponse.json(
      { error: 'Failed to calculate cohort weeks' },
      { status: 500 }
    );
  }
}
