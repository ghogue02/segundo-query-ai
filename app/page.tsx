import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

async function getStats() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stats`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('Failed to fetch stats');
  }
  return await res.json();
}

export default async function HomePage() {
  let stats;
  let statsError = false;

  try {
    stats = await getStats();
  } catch (error) {
    console.error('Error fetching stats:', error);
    statsError = true;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-black rounded"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Second Query AI</h1>
              <p className="text-sm text-gray-300">September 2025 Cohort Analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-black mb-4">
            Choose Your Analytics Experience
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get instant insights about cohort performance with AI-powered analytics
          </p>
        </div>

        {/* Two Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Natural Language Option */}
          <Link href="/query" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-black">
              <CardHeader>
                <div className="w-16 h-16 bg-black rounded-lg mb-4 flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-white rounded"></div>
                </div>
                <CardTitle className="text-2xl">Natural Language Query</CardTitle>
                <CardDescription className="text-base">
                  Ask questions in plain English. AI translates to insights with interactive charts and drill-down panels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 bg-black rounded-sm flex-shrink-0 mt-0.5"></div>
                    <span className="text-gray-700">Ask anything about the cohort</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 bg-black rounded-sm flex-shrink-0 mt-0.5"></div>
                    <span className="text-gray-700">Auto-generated visualizations</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 bg-black rounded-sm flex-shrink-0 mt-0.5"></div>
                    <span className="text-gray-700">Click any chart to drill down</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 bg-black rounded-sm flex-shrink-0 mt-0.5"></div>
                    <span className="text-gray-700">20 pre-loaded example queries</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Best for: Ad-hoc exploration</Badge>
                  <div className="w-6 h-6 border-2 border-black rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Metrics Dashboard Option */}
          <Link href="/metrics" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-black">
              <CardHeader>
                <div className="w-16 h-16 bg-black rounded-lg mb-4 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-1 w-10 h-10">
                    <div className="bg-white border border-white"></div>
                    <div className="bg-white border border-white"></div>
                    <div className="bg-white border border-white"></div>
                    <div className="bg-white border border-white"></div>
                  </div>
                </div>
                <CardTitle className="text-2xl">Metrics Dashboard</CardTitle>
                <CardDescription className="text-base">
                  Pre-defined KPIs, hypothesis testing, and cohort pattern analysis with real-time filters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 bg-black rounded-sm flex-shrink-0 mt-0.5"></div>
                    <span className="text-gray-700">5 real-time KPI cards</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 bg-black rounded-sm flex-shrink-0 mt-0.5"></div>
                    <span className="text-gray-700">7 hypothesis charts (attendance, engagement, etc.)</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 bg-black rounded-sm flex-shrink-0 mt-0.5"></div>
                    <span className="text-gray-700">Quality scores from BigQuery</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 bg-black rounded-sm flex-shrink-0 mt-0.5"></div>
                    <span className="text-gray-700">Smart filters + dual segmentation</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Best for: Daily operations</Badge>
                  <div className="w-6 h-6 border-2 border-black rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Bar */}
        {statsError ? (
          <Card className="mt-16 max-w-4xl mx-auto border-red-300 bg-red-50">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="text-red-600 font-semibold mb-2">⚠️ Unable to load current stats</div>
                <p className="text-sm text-red-700">
                  There was an error fetching the latest cohort statistics. Please refresh the page.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : stats ? (
          <Card className="mt-16 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-black">{stats.activeBuilders}</div>
                  <div className="text-sm text-gray-600 mt-1">Active Builders</div>
                </div>
                <Separator orientation="vertical" className="h-auto" />
                <div>
                  <div className="text-4xl font-bold text-black">{stats.classDays}</div>
                  <div className="text-sm text-gray-600 mt-1">Class Days</div>
                </div>
                <Separator orientation="vertical" className="h-auto" />
                <div>
                  <div className="text-4xl font-bold text-black">{stats.totalTasks}</div>
                  <div className="text-sm text-gray-600 mt-1">Curriculum Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* No Class Notice (Thu/Fri) */}
        {(new Date().getDay() === 4 || new Date().getDay() === 5) && (
          <Card className="mt-8 max-w-4xl mx-auto bg-gray-50 border-gray-300">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  No class today ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Builders are off on Thursdays and Fridays. Class resumes Saturday.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Powered by Claude AI • Real-time data from PostgreSQL & BigQuery
          </p>
        </div>
      </div>
    </div>
  );
}
