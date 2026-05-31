import { Loader2 } from 'lucide-react';

const sizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const LoadingSpinner = ({ size = 'md', className = '' }) => (
  <Loader2
    className={`animate-spin text-brand-600 ${sizes[size]} ${className}`}
    aria-label="Loading"
  />
);

export default LoadingSpinner;
