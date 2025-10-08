import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { generateSQLFromQuestion, generateInsights } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const { question, conversationHistory, isFollowUp } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Generate SQL using Claude (with conversation context)
    const sqlResponse = await generateSQLFromQuestion(question, conversationHistory);

    // Check if clarification is needed
    if (sqlResponse.needsClarification) {
      return NextResponse.json({
        needsClarification: true,
        clarificationQuestion: sqlResponse.clarificationQuestion,
        question
      });
    }

    // Handle multi-query response (NEW)
    if (sqlResponse.multiQuery && sqlResponse.queries) {
      // Execute all queries in parallel
      const metricResults = await Promise.all(
        sqlResponse.queries.map(async (queryMetric) => {
          let results: Record<string, unknown>[] = [];
          let executionError: string | null = null;

          try {
            results = await executeQuery(queryMetric.sql);
          } catch (error) {
            console.error(`SQL execution error for ${queryMetric.id}:`, error);
            executionError = error instanceof Error ? error.message : 'Unknown error';
          }

          // Generate insights for this specific metric
          let insights = queryMetric.insights;
          if (results.length > 0 && !executionError) {
            try {
              const generatedInsights = await generateInsights(queryMetric.label, results);
              insights = generatedInsights;
            } catch (error) {
              console.error('Insight generation error:', error);
              // Keep default insights
            }
          }

          return {
            id: queryMetric.id,
            label: queryMetric.label,
            sql: queryMetric.sql,
            explanation: queryMetric.explanation,
            chartType: queryMetric.chartType,
            xAxis: queryMetric.xAxis,
            yAxis: queryMetric.yAxis,
            results,
            insights,
            error: executionError,
            resultCount: results.length
          };
        })
      );

      return NextResponse.json({
        question,
        multiQuery: true,
        metrics: metricResults
      });
    }

    // Handle single query (EXISTING)
    let results: Record<string, unknown>[] = [];
    let executionError: string | null = null;

    try {
      results = await executeQuery(sqlResponse.sql!);
    } catch (error) {
      console.error('SQL execution error:', error);
      executionError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Generate insights if we have results
    let insights = sqlResponse.insights;
    if (results.length > 0 && !executionError) {
      try {
        const generatedInsights = await generateInsights(question, results);
        insights = generatedInsights;
      } catch (error) {
        console.error('Insight generation error:', error);
        // Keep default insights from SQL generation
      }
    }

    return NextResponse.json({
      question,
      sql: sqlResponse.sql,
      explanation: sqlResponse.explanation,
      chartType: sqlResponse.chartType,
      xAxis: sqlResponse.xAxis,
      yAxis: sqlResponse.yAxis,
      results,
      insights,
      error: executionError,
      resultCount: results.length
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to submit queries',
    example: {
      question: "What is today's attendance rate?"
    }
  });
}
