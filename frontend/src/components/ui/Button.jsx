import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const variants = {
  primary:
    'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:from-brand-500 hover:to-rose-500',
  secondary:
    'bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300',
  ghost: 'bg-transparent text-brand-600 hover:bg-brand-50',
};

const Button = ({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  type = 'button',
  ...props
}) => (
  <motion.button
    type={type}
    whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
    whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    {...props}
  >
    {loading ? <LoadingSpinner size="sm" className="text-white" /> : children}
  </motion.button>
);

export default Button;
