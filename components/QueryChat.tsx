'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, TrendingUp, Database, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ChartRenderer from './ChartRenderer';
import MetricCard from './MetricCard';
import DrillDownButtons, { DrillDownSuggestion } from './DrillDownButtons';
import TaskDetailPanel from './detail-panels/TaskDetailPanel';
import BuilderDetailPanel from './detail-panels/BuilderDetailPanel';
import { useSlideOverState } from '@/hooks/useSlideOverState';
import { analyzeQueryContext } from '@/lib/drill-downs/context-analyzer';
import { generateDrillDowns } from '@/lib/drill-downs/drill-down-generator';

interface MetricResult {
  id: string;
  label: string;
  sql: string;
  explanation: string;
  chartType: string;
  xAxis?: string;
  yAxis?: string;
  results: Record<string, unknown>[];
  insights: string[];
  error?: string;
  resultCount: number;
}

interface QueryResult {
  question: string;

  // Single query
  sql?: string;
  explanation?: string;
  chartType?: string;
  xAxis?: string;
  yAxis?: string;
  results?: Record<string, unknown>[];
  insights?: string[];
  error?: string;
  resultCount?: number;

  // Multi-query
  multiQuery?: boolean;
  metrics?: MetricResult[];
}

interface StackedQueryResult extends QueryResult {
  id: string;
  drillDowns: DrillDownSuggestion[];
  depth: number;
  collapsed: boolean;
}

export default function QueryChat() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [resultStack, setResultStack] = useState<StackedQueryResult[]>([]);
  const [showSQL, setShowSQL] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const [needsClarification, setNeedsClarification] = useState(false);
  const [clarificationQuestion, setClarificationQuestion] = useState('');
  const [originalQuestion, setOriginalQuestion] = useState('');
  const [stats, setStats] = useState({ activeBuilders: 75, classDays: 18, totalTasks: 107 });

  // Slide-over panel state
  const slideOver = useSlideOverState();

  // Fetch stats on mount
  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch stats:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      // If this is a follow-up to a clarification, combine with original question
      let effectiveQuestion = question;
      let effectiveHistory = [...conversationHistory];

      if (needsClarification && originalQuestion) {
        // Combine original question with follow-up answer
        effectiveQuestion = `${originalQuestion} - specifically: ${question}`;
        effectiveHistory = [
          { role: 'user', content: originalQuestion },
          { role: 'assistant', content: clarificationQuestion },
          { role: 'user', content: question }
        ];

        // Clear clarification state
        setNeedsClarification(false);
        setOriginalQuestion('');
      } else {
        // First query - store for potential follow-up
        setOriginalQuestion(question);
      }

      effectiveHistory.push({ role: 'user', content: effectiveQuestion });

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: effectiveQuestion,
          conversationHistory: effectiveHistory,
          isFollowUp: needsClarification
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Query failed');
      }

      // Check if AI needs clarification
      if (data.needsClarification && data.clarificationQuestion) {
        setNeedsClarification(true);
        setClarificationQuestion(data.clarificationQuestion);
        setConversationHistory(effectiveHistory);
        setQuestion(''); // Clear input for follow-up
        console.log('Clarification needed:', data.clarificationQuestion);
      } else {
        // Add assistant response to history
        setConversationHistory([
          ...effectiveHistory,
          { role: 'assistant', content: `Generated query for: ${effectiveQuestion}` }
        ]);

        // Generate drill-down suggestions
        const context = analyzeQueryContext(data);
        const drillDowns = generateDrillDowns(context);

        // Add to result stack
        setResultStack([{
          ...data,
          id: `result-${Date.now()}`,
          drillDowns,
          depth: 0,
          collapsed: false
        }]);

        setResult(data);
        setQuestion(''); // Clear input after successful query
      }
    } catch (error) {
      setResult({
        question,
        sql: '',
        explanation: '',
        chartType: 'table',
        results: [],
        insights: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        resultCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (templateQuestion: string) => {
    setQuestion(templateQuestion);
  };

  const handleDrillDown = async (query: string, suggestion: DrillDownSuggestion) => {
    setLoading(true);
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          conversationHistory: [
            ...conversationHistory,
            { role: 'user', content: query }
          ]
        })
      });

      const data = await response.json();

      if (response.ok && !data.needsClarification) {
        // Generate drill-downs for the new result
        const context = analyzeQueryContext(data);
        const newDrillDowns = generateDrillDowns(context);

        // Append to result stack
        setResultStack(prev => [...prev, {
          ...data,
          id: `drill-${Date.now()}`,
          drillDowns: newDrillDowns,
          depth: prev.length,
          collapsed: false
        }]);
      }
    } catch (error) {
      console.error('Drill-down error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Query Input */}
      <form onSubmit={handleSubmit} className="p-4 border-b bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about September 2025 cohort data..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Ask
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Area */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {/* Clarification Message */}
        {needsClarification && clarificationQuestion && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0 mt-1">
                  AI
                </div>
                <div className="flex-1">
                  <p className="text-blue-900 font-medium mb-3">I need a bit more information:</p>
                  <div className="text-blue-800 space-y-3">
                    {clarificationQuestion.split(/\d\)/).map((part, idx) => {
                      if (idx === 0) {
                        // First part before numbered options
                        return <p key={`intro-${idx}`} className="mb-2">{part.trim()}</p>;
                      }
                      // Numbered options
                      const optionText = part.trim();
                      if (!optionText) return null;

                      return (
                        <button
                          key={`option-${idx}`}
                          onClick={() => {
                            setQuestion(optionText);
                            document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
                          }}
                          className="block w-full text-left px-4 py-3 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
                        >
                          <span className="font-medium text-blue-700 group-hover:text-blue-900">
                            {idx}) {optionText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!result && !loading && !needsClarification && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Ask about your cohort data
              </h2>
              <p className="text-gray-600 mb-4">
                Get instant answers with auto-generated charts • {stats.activeBuilders} builders • {stats.classDays} days • {stats.totalTasks} tasks
              </p>
              <div className="inline-flex gap-3 text-xs text-gray-500">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Daily Operations</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Trends & Analysis</span>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">At-Risk Support</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Top Performers</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                // Daily Operations
                "What is today's attendance rate?",
                "Who is absent today?",
                "Show me today's task completion",

                // Weekly/Trend Analysis
                "Show attendance trends for this week",
                "What's the average engagement score?",
                "Which tasks had the best completion this week?",

                // At-Risk & Support
                "Which builders need additional support?",
                "Show me builders with attendance below 80%",
                "Which builders are falling behind on tasks?",

                // Performance & Success
                "Who are the top 10 most engaged builders?",
                "Show me builders with perfect attendance",
                "Which builders completed the most tasks?",

                // Task & Feedback Analysis
                "Which tasks have the lowest completion rates?",
                "Show me Weekly Feedback completion rates",
                "What are the latest feedback scores?"
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleTemplateClick(q)}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left group"
                >
                  <p className="text-gray-700 text-sm group-hover:text-blue-700 transition-colors">{q}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Generating query and analyzing data...</p>
            </div>
          </div>
        )}

        {result && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Question Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {result.question}
              </h3>
              {result.multiQuery && result.metrics && (
                <p className="text-gray-600 text-sm">Showing {result.metrics.length} separate metrics</p>
              )}
              {!result.multiQuery && result.explanation && (
                <p className="text-gray-600 text-sm">{result.explanation}</p>
              )}
            </div>

            {/* MULTI-QUERY: Render metric cards */}
            {result.multiQuery && result.metrics && (
              <div className="space-y-5">
                {result.metrics.map((metric, index) => (
                  <MetricCard
                    key={metric.id}
                    metric={metric}
                    index={index + 1}
                    onTaskClick={slideOver.openTask}
                    onBuilderClick={slideOver.openBuilder}
                  />
                ))}
              </div>
            )}

            {/* SINGLE QUERY: Original rendering */}
            {!result.multiQuery && (
              <>
                {/* Error Display */}
                {result.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Error</p>
                  <p className="text-red-700 text-sm">{result.error}</p>
                </div>
              </div>
            )}

            {/* Chart Display */}
            {!result.error && result.results && result.results.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Results ({result.resultCount} rows)
                  </h4>
                  <button
                    onClick={() => setShowSQL(!showSQL)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Database className="w-4 h-4" />
                    {showSQL ? 'Hide' : 'Show'} SQL
                  </button>
                </div>

                {showSQL && (
                  <div className="mb-4 p-3 bg-gray-900 text-gray-100 rounded text-sm font-mono overflow-x-auto">
                    {result.sql}
                  </div>
                )}

                <ChartRenderer
                  data={result.results}
                  chartType={result.chartType as 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table'}
                  xAxis={result.xAxis}
                  yAxis={result.yAxis}
                  onTaskClick={slideOver.openTask}
                  onBuilderClick={slideOver.openBuilder}
                />
              </div>
            )}

                {/* Insights */}
                {result.insights && result.insights.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-3">
                      💡 Key Insights
                    </h4>
                    <ul className="space-y-2">
                      {result.insights.map((insight, i) => (
                        <li key={i} className="text-blue-800 text-sm flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Smart Drill-Down Buttons */}
                {!result.error && result.results && result.results.length > 0 && resultStack.length > 0 && (
                  <DrillDownButtons
                    suggestions={resultStack[resultStack.length - 1].drillDowns}
                    onDrillDown={handleDrillDown}
                    disabled={loading}
                  />
                )}

            {/* Follow-up Question Area */}
            {!result.error && result.results && result.results.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-5">
                <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Refine These Results
                </h4>
                <p className="text-sm text-indigo-700 mb-3">
                  Ask a follow-up question to modify these results (filter, sort, group differently, etc.)
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const followUpInput = (e.target as HTMLFormElement).followup as HTMLInputElement;
                    if (followUpInput.value.trim()) {
                      setQuestion(followUpInput.value);
                      // Add result context to conversation history
                      setConversationHistory([
                        ...conversationHistory,
                        { role: 'user', content: result.question },
                        { role: 'assistant', content: `Generated SQL query returning ${result.resultCount} rows. SQL: ${result.sql}` },
                        { role: 'user', content: followUpInput.value }
                      ]);
                      followUpInput.value = '';
                      handleSubmit(e);
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    name="followup"
                    placeholder="e.g., 'show only above 50%' or 'group by day' or 'sort by name'"
                    className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                  >
                    Refine
                  </button>
                </form>
              </div>
            )}

                {/* Empty Results */}
                {!result.error && result.results && result.results.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <p className="text-yellow-800">No results found for this query</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Task Detail Panel */}
      {slideOver.hasTask && slideOver.taskId && (
        <TaskDetailPanel
          taskId={slideOver.taskId}
          isOpen={slideOver.hasTask}
          onClose={slideOver.close}
          onBuilderClick={slideOver.openBuilder}
        />
      )}

      {/* Builder Detail Panel */}
      {slideOver.hasBuilder && slideOver.builderId && (
        <BuilderDetailPanel
          builderId={slideOver.builderId}
          isOpen={slideOver.hasBuilder}
          onClose={slideOver.close}
          onTaskClick={slideOver.openTask}
        />
      )}
    </div>
  );
}
