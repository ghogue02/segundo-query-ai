'use client';

import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface TimelineItemProps {
  date: string;
  time?: string;
  status: 'present' | 'late' | 'absent' | 'excused' | 'completed';
  label: string;
  description?: string;
  lateMinutes?: number;
}

export default function TimelineItem({ date, time, status, label, description, lateMinutes }: TimelineItemProps) {
  const statusConfig = {
    present: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'On Time'
    },
    late: {
      icon: <Clock className="w-5 h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: lateMinutes ? `${lateMinutes} min late` : 'Late'
    },
    absent: {
      icon: <XCircle className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Absent'
    },
    excused: {
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      label: 'Excused'
    },
    completed: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Completed'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}>
      <div className={`${config.color} mt-0.5`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-gray-900 text-sm">{label}</p>
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-0.5">
          {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          {time && ` • ${time}`}
        </p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
