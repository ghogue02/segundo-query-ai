'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  colorScheme?: 'blue' | 'green' | 'yellow' | 'red';
}

export default function StatCard({ label, value, icon, trend, colorScheme = 'blue' }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[colorScheme]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium opacity-80">{label}</p>
        {icon && <div className="opacity-60">{icon}</div>}
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {trend && (
        <p className={`text-xs mt-1 ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  );
}
