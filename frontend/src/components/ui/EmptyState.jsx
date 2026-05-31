import { motion } from 'framer-motion';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className={`text-center py-16 px-6 rounded-2xl border border-dashed border-slate-200 bg-white/50 ${className}`}
  >
    {Icon && <Icon className="w-12 h-12 text-slate-300 mx-auto mb-3" />}
    <p className="font-semibold text-slate-800">{title}</p>
    {description && (
      <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </motion.div>
);

export default EmptyState;
