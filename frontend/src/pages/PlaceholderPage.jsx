import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4"
  >
    <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-soft mb-6">
      <Construction className="w-12 h-12 text-brand-500" />
    </div>
    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
    <p className="text-slate-500 mt-2 max-w-md text-sm">
      {description || 'This feature is coming soon. Stay tuned for updates.'}
    </p>
  </motion.div>
);

export default PlaceholderPage;
