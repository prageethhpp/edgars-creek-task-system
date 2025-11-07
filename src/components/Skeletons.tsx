// Loading Skeleton Components for better perceived performance

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 space-y-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
      <div className="flex justify-end pt-4">
        <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-3"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Content Block */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTicketDetails() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <SkeletonList />
        </div>
      </div>
    </div>
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonButton({ className = '' }: { className?: string }) {
  return (
    <div className={`h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`}></div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`${sizes[size]} bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0`}></div>
  );
}
