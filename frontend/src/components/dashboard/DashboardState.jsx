import LoadingSpinner from '../ui/LoadingSpinner';
import Button from '../ui/Button';
import { AlertCircle } from 'lucide-react';

export const DashboardLoading = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-3">
    <LoadingSpinner size="lg" />
    <p className="text-sm text-slate-500">Loading dashboard...</p>
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
