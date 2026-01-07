'use client';

import React from 'react';
import { Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  id: string;
  name: string;
  masteryScore?: number;
  onClick?: () => void;
  className?: string;
}

export function TopicCard({ 
  id, 
  name, 
  masteryScore = 0, 
  onClick, 
  className 
}: TopicCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50',
        'border border-indigo-100 shadow-md hover:shadow-xl transition-all duration-300',
        'p-6 flex flex-col items-center gap-4 min-h-[180px]',
        'hover:scale-105 hover:border-indigo-300',
        className
      )}
    >
      {/* Icon */}
      <div className="rounded-full bg-indigo-100 p-3 group-hover:bg-indigo-200 transition-colors">
        <Calculator className="w-8 h-8 text-indigo-600" />
      </div>

      {/* Topic Name */}
      <h3 className="text-lg font-bold text-gray-800 text-center line-clamp-2">
        {name}
      </h3>

      {/* Mastery Badge */}
      <div className="mt-auto">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-gray-600 font-medium">Mastery</span>
          <div className="flex items-center gap-2">
            {/* Progress Bar */}
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${masteryScore}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-indigo-600">
              {masteryScore}%
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
