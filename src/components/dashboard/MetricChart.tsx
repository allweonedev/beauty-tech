import React from 'react';

interface MetricChartProps {
  title: string;
  value: string;
  change: string;
  data: number[];
}

export function MetricChart({ title, value, change, data }: MetricChartProps) {
  const max = Math.max(...data);
  return (
    <div className="bg-white p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <div className="mt-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="ml-2 text-sm text-green-600">{change}</span>
      </div>
      <div className="mt-4 flex items-end space-x-1 h-16">
        {data.map((value, i) => (
          <div
            key={i}
            className="flex-1 bg-indigo-100 rounded-t"
            style={{ height: `${(value / max) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}