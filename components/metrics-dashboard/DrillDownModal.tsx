'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface DrillDownData {
  title: string;
  description: string;
  data: any[];
  columns: { key: string; label: string; format?: (val: any) => string }[];
}

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: string;
  cohort?: string;
}

export function DrillDownModal({ isOpen, onClose, metricType, cohort = 'September 2025' }: DrillDownModalProps) {
  const [data, setData] = useState<DrillDownData | null>(null);
  const [loading, setLoading] = useState(true);
  const modalRef = useFocusTrap(isOpen, onClose);

  useEffect(() => {
    if (isOpen && metricType) {
      fetchDrillDownData();
    }
  }, [isOpen, metricType, cohort]);

  async function fetchDrillDownData() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/metrics/drill-down/${metricType}?cohort=${encodeURIComponent(cohort)}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch drill-down data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={modalRef}
        className="max-w-7xl max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drill-down-modal-title"
        aria-describedby="drill-down-modal-description"
      >
        <DialogHeader>
          <DialogTitle id="drill-down-modal-title">
            {data?.title || 'Loading...'}
          </DialogTitle>
          <DialogDescription id="drill-down-modal-description">
            {data?.description}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div
            className="py-12 text-center text-gray-500"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            Loading detailed data...
          </div>
        ) : data && data.data ? (
          <div>
            <div className="mb-4">
              <Badge variant="secondary" aria-label={`${data.data?.length || 0} records found`}>
                {data.data?.length || 0} records
              </Badge>
            </div>

            <Separator className="my-4" />

            {/* Data Table with ARIA attributes */}
            <div className="overflow-x-auto">
              <table
                className="w-full text-sm"
                role="table"
                aria-label={`Detailed data for ${data.title}`}
              >
                <caption className="sr-only">
                  {data.title} - Detailed breakdown showing {data.data?.length || 0} records
                </caption>
                <thead>
                  <tr className="border-b bg-gray-50" role="row">
                    {data.columns?.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left font-semibold text-gray-900"
                        role="columnheader"
                        scope="col"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data?.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50" role="row">
                      {data.columns?.map((col, colIdx) => {
                        const value = col.format ? col.format(row[col.key]) : row[col.key];
                        const isBuilderName = col.key === 'builder_name' && row.user_id;

                        if (isBuilderName) {
                          return (
                            <td key={col.key} className="px-4 py-3" role="cell">
                              <Link
                                href={`/builder/${row.user_id}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                aria-label={`View profile for ${value}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Future: Open builder stats modal instead
                                }}
                              >
                                {value}
                              </Link>
                            </td>
                          );
                        }

                        return (
                          <td key={col.key} className="px-4 py-3 text-gray-700" role="cell">
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                aria-label="Close modal and return to dashboard"
              >
                Close
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  // Export to CSV
                  const csv = [
                    data.columns?.map(c => c.label).join(','),
                    ...(data.data?.map(row =>
                      data.columns?.map(c => row[c.key]).join(',')
                    ) || [])
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${metricType}-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                aria-label={`Export ${data.data?.length || 0} records to CSV file`}
              >
                Export CSV
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="py-12 text-center text-gray-500"
            role="status"
            aria-live="polite"
          >
            No data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
