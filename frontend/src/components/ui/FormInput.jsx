import { motion } from 'framer-motion';

const FormInput = ({
  label,
  icon: Icon,
  error,
  className = '',
  ...props
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className={`space-y-1.5 ${className}`}
  >
    {label && (
      <label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
    )}
    <div className="relative group">
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors pointer-events-none" />
      )}
      <input
        className={`w-full rounded-xl border bg-white/80 backdrop-blur-sm px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-200
          ${Icon ? 'pl-11' : ''}
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 hover:border-slate-300'}
          focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed`}
        {...props}
      />
    </div>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </motion.div>
);

export default FormInput;
