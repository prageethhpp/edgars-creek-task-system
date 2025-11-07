import React from 'react';

interface PriorityBadgeProps {
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function PriorityBadge({ priority, size = 'md', showIcon = true }: PriorityBadgeProps) {
  const config = {
    Low: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-300 dark:border-gray-600',
      icon: 'trending_down'
    },
    Medium: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'remove'
    },
    High: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
      icon: 'trending_up'
    },
    Critical: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      icon: 'emergency'
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const iconSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const { bg, text, border, icon } = config[priority];

  return (
    <span 
      className={`inline-flex items-center gap-1 ${sizeClasses[size]} ${bg} ${text} ${border} border rounded-full font-medium`}
    >
      {showIcon && (
        <span className={`material-symbols-outlined ${iconSize[size]}`}>{icon}</span>
      )}
      <span>{priority}</span>
    </span>
  );
}

// Assigned To Badge Component
interface AssignedBadgeProps {
  assignedToName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AssignedBadge({ assignedToName, size = 'md' }: AssignedBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const iconSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (!assignedToName) {
    return (
      <span className={`inline-flex items-center gap-1 ${sizeClasses[size]} bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-full font-medium`}>
        <span className={`material-symbols-outlined ${iconSize[size]}`}>person_off</span>
        <span>Unassigned</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses[size]} bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-full font-medium`}>
      <span className={`material-symbols-outlined ${iconSize[size]}`}>person</span>
      <span>{assignedToName}</span>
    </span>
  );
}
