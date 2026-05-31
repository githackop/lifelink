import { AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { SkeletonStatGrid, SkeletonBlock, SkeletonLine } from '../ui/Skeleton';

export const DashboardLoading = () => (
  <div className="space-y-8">
    <SkeletonBlock className="h-36 w-full rounded-3xl" />
    <SkeletonStatGrid count={4} />
    <div className="rounded-2xl border border-white/60 bg-white/70 p-6 space-y-4">
      <SkeletonLine className="w-40 h-4" />
      <SkeletonBlock className="h-32 w-full" />
    </div>
  </div>
);

export const DashboardError = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4 text-center max-w-md mx-auto">
    <div className="p-4 rounded-2xl bg-red-50">
      <AlertCircle className="w-8 h-8 text-red-500" />
    </div>
    <p className="text-slate-700 font-medium">{message || 'Failed to load dashboard'}</p>
    {onRetry && (
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
