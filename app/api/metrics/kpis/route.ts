import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveBuildersToday,
  getActiveBuildersYesterday,
  get7DayClassAverage,
  getTaskCompletionThisWeek,
  getAttendanceRate,
  getBuildersNeedingIntervention,
  getTotalActiveBuilders,
} from '@/lib/metrics-calculations';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cohort = searchParams.get('cohort') || 'September 2025';

    // Fetch all KPIs in parallel
    const [
      activeBuildersToday,
      activeBuildersYesterday,
      sevenDayAverage,
      taskCompletionRate,
      attendanceRate,
      needingIntervention,
      totalBuilders,
    ] = await Promise.all([
      getActiveBuildersToday(cohort),
      getActiveBuildersYesterday(cohort),
      get7DayClassAverage(cohort),
      getTaskCompletionThisWeek(cohort),
      getAttendanceRate(cohort),
      getBuildersNeedingIntervention(cohort),
      getTotalActiveBuilders(cohort),
    ]);

    // Mock last week data for comparison (TODO: implement historical tracking)
    const taskCompletionLastWeek = taskCompletionRate - 4; // Mock: 4% increase
    const attendanceLastWeek = attendanceRate + 4; // Mock: 4% decrease

    return NextResponse.json({
      activeBuildersToday,
      activeBuildersYesterday,
      taskCompletionRate,
      attendanceRate,
      needingIntervention,
      totalBuilders,
      sevenDayAverage,
      taskCompletionLastWeek,
      attendanceLastWeek,
    });
  } catch (error) {
    console.error('KPI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI data' },
      { status: 500 }
    );
  }
}
