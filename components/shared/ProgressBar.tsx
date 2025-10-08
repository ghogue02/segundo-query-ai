'use client';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  colorScheme?: 'blue' | 'green' | 'yellow' | 'red';
}

export default function ProgressBar({
  value,
  max,
  label,
  showPercentage = true,
  colorScheme = 'blue'
}: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100);

  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  };

  const getColorByPercentage = () => {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'blue';
    if (percentage >= 40) return 'yellow';
    return 'red';
  };

  const finalColor = colorScheme === 'blue' ? getColorByPercentage() : colorScheme;

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1 text-sm">
          {label && <span className="text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="font-medium text-gray-900">
              {value}/{max} ({percentage}%)
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${colors[finalColor]} transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
