import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
  trend?: 'up' | 'down';
}

export function DashboardCard({ icon: Icon, title, value, description, trend }: DashboardCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-50 rounded-lg">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            {trend && (
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {trend === 'up' ? '↑ 12%' : '↓ 8%'}
              </span>
            )}
          </div>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}