import { motion } from 'framer-motion';

const accentStyles = {
  rose: 'from-rose-500 to-red-600 shadow-rose-500/20',
  sky: 'from-sky-500 to-blue-600 shadow-sky-500/20',
  emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
  violet: 'from-violet-500 to-purple-600 shadow-violet-500/20',
  amber: 'from-amber-500 to-orange-600 shadow-amber-500/20',
  slate: 'from-slate-600 to-slate-800 shadow-slate-500/20',
};

const StatCard = ({ title, value, subtitle, icon: Icon, accent = 'rose', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-5 shadow-soft hover:shadow-lg transition-shadow duration-300"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {Icon && (
        <div
          className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${accentStyles[accent]} text-white shadow-lg`}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  </motion.div>
);

export default StatCard;
