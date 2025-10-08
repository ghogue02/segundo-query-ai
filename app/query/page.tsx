import { Suspense } from 'react';
import Link from 'next/link';
import QueryChat from '@/components/QueryChat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function QueryPage() {
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-black text-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-black rounded"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold">Second Query AI</h1>
              <p className="text-sm text-gray-300">September 2025 Cohort Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Home
              </Button>
            </Link>
            <Link href="/metrics">
              <Button variant="secondary" size="sm">
                Metrics Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-600">Loading query interface...</div>
            </div>
          }
        >
          <QueryChat />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-3 px-4 text-center text-sm text-gray-600">
        <p>Powered by Claude AI • Ask questions in plain English</p>
      </footer>
    </div>
  );
}
