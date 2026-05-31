const pulse = 'animate-pulse bg-slate-200/80 rounded-lg';

export const SkeletonLine = ({ className = '' }) => (
  <div className={`${pulse} h-3 ${className}`} />
);

export const SkeletonBlock = ({ className = '' }) => (
  <div className={`${pulse} ${className}`} />
);

export const SkeletonStatGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="rounded-2xl border border-white/60 bg-white/70 p-5 space-y-3"
      >
        <SkeletonLine className="w-24 h-2" />
        <SkeletonBlock className="h-8 w-16" />
      </div>
    ))}
  </div>
);

export const SkeletonCardList = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="rounded-2xl border border-white/60 bg-white/70 p-5 space-y-3"
      >
        <div className="flex gap-3">
          <SkeletonBlock className="w-11 h-11 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="w-40" />
            <SkeletonLine className="w-24" />
          </div>
        </div>
        <SkeletonBlock className="h-10 w-full" />
      </div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="rounded-2xl border border-white/60 bg-white/70 overflow-hidden p-4 space-y-3">
    <SkeletonLine className="w-48 h-4" />
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-3">
        {Array.from({ length: cols }).map((_, c) => (
          <SkeletonLine key={c} className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonDonorGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-white/60 bg-white/70 p-5 space-y-3">
        <div className="flex gap-3">
          <SkeletonBlock className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="w-32" />
            <SkeletonLine className="w-20" />
          </div>
        </div>
        <SkeletonBlock className="h-8 w-full" />
      </div>
    ))}
  </div>
);
