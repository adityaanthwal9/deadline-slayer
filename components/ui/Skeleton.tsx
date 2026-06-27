'use client';

export function SkeletonCard({ rows = 2 }: { rows?: number }) {
  return (
    <div className="ds-card p-4 space-y-3">
      <div className="skeleton h-4 w-3/4 rounded" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-3 rounded" style={{ width: `${60 + i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonBrief() {
  return (
    <div className="ds-card p-6 border-amber-500/10 space-y-4">
      <div className="flex items-start gap-4">
        <div className="skeleton w-9 h-9 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-5 w-2/3 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-4/5 rounded" />
          <div className="skeleton h-16 rounded-lg mt-2" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTaskRow() {
  return (
    <div className="ds-card p-4 flex items-center gap-4">
      <div className="skeleton w-5 h-5 rounded flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-2/3 rounded" />
        <div className="skeleton h-2.5 w-1/3 rounded" />
      </div>
      <div className="skeleton w-20 h-4 rounded flex-shrink-0" />
      <div className="skeleton w-16 h-5 rounded flex-shrink-0" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-3 w-32 rounded" />
          <div className="skeleton h-7 w-48 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-9 w-28 rounded-lg" />
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>
      </div>
      <SkeletonBrief />
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="ds-card p-4 space-y-2">
            <div className="skeleton h-7 w-8 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <SkeletonTaskRow key={i} />
        ))}
      </div>
    </div>
  );
}
