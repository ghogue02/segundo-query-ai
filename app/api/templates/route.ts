import { NextResponse } from 'next/server';
import { queryTemplates, getTemplatesByCategory } from '@/lib/templates';

export async function GET() {
  const categorized = getTemplatesByCategory();

  return NextResponse.json({
    templates: queryTemplates,
    byCategory: categorized,
    categories: Object.keys(categorized)
  });
}
