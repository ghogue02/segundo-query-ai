import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

/**
 * Debug endpoint to inspect table schemas
 * Helps identify correct column names
 */
export async function GET() {
  try {
    // Get builder_attendance_new columns
    const attendanceSchema = await executeQuery(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'builder_attendance_new'
      ORDER BY ordinal_position
    `);

    // Get sample attendance record
    const attendanceSample = await executeQuery(`
      SELECT * FROM builder_attendance_new LIMIT 3
    `);

    // Get curriculum_days columns
    const curriculumSchema = await executeQuery(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'curriculum_days'
      ORDER BY ordinal_position
    `);

    // Get sample curriculum day
    const curriculumSample = await executeQuery(`
      SELECT * FROM curriculum_days WHERE cohort = 'September 2025' LIMIT 3
    `);

    return NextResponse.json({
      builder_attendance_new: {
        schema: attendanceSchema,
        sample: attendanceSample,
      },
      curriculum_days: {
        schema: curriculumSchema,
        sample: curriculumSample,
      },
    });
  } catch (error: any) {
    console.error('Schema debug error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
