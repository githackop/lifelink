import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const AvailabilityToggle = ({ available, onChange, loading = false }) => (
  <div className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-soft">
    <div>
      <p className="font-semibold text-slate-900">Donation availability</p>
      <p className="text-sm text-slate-500 mt-0.5">
        {available
          ? 'Hospitals and users can see you as available'
          : 'You are hidden from availability searches'}
      </p>
    </div>

    <button
      type="button"
      disabled={loading}
      onClick={() => onChange(!available)}
      className={`relative inline-flex h-11 w-[4.5rem] items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:opacity-60
        ${available ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-300'}`}
      aria-pressed={available}
      aria-label="Toggle availability"
    >
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" className={available ? 'text-white' : 'text-slate-600'} />
        </span>
      ) : (
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md
            ${available ? 'left-[calc(100%-2.375rem)]' : 'left-1'}`}
        >
          {available ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <X className="w-4 h-4 text-slate-500" />
          )}
        </motion.span>
      )}
    </button>
  </div>
);

export default AvailabilityToggle;
