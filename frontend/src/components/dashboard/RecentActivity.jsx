import { motion } from 'framer-motion';
import { Activity, Inbox } from 'lucide-react';

const RecentActivity = ({ items = [], title = 'Recent Activity' }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-soft"
  >
    <div className="flex items-center gap-2 mb-4">
      <Activity className="w-5 h-5 text-brand-600" />
      <h3 className="font-semibold text-slate-900">{title}</h3>
    </div>

    {items.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="p-4 rounded-2xl bg-slate-100 mb-3">
          <Inbox className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">No recent activity</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Activity will appear here once you start using LifeLink features.
        </p>
      </div>
    ) : (
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={item.id || index}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100"
          >
            <span className="text-sm text-slate-700">{item.message}</span>
            {item.time && (
              <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">
                {new Date(item.time).toLocaleDateString()}
              </span>
            )}
          </li>
        ))}
      </ul>
    )}
  </motion.div>
);

export default RecentActivity;
