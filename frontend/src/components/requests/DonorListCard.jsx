import { motion } from 'framer-motion';
import { Droplets, MapPin, Phone, Mail } from 'lucide-react';

const DonorListCard = ({ donor, index = 0, compact = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03 }}
    className={`rounded-xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-soft
      ${compact ? 'p-3' : 'p-4'}`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {donor.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">{donor.name}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {donor.city || '—'}
          </p>
        </div>
      </div>
      <span
        className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase
          ${donor.availability ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
      >
        {donor.availability ? 'Available' : 'Busy'}
      </span>
    </div>
    <div className="mt-3 flex flex-wrap gap-2 text-xs">
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold">
        <Droplets className="w-3.5 h-3.5" />
        {donor.bloodGroup}
      </span>
      {!compact && donor.email && (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-600">
          <Mail className="w-3.5 h-3.5" />
          {donor.email}
        </span>
      )}
      {donor.phoneNumber && (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-600">
          <Phone className="w-3.5 h-3.5" />
          {donor.phoneNumber}
        </span>
      )}
    </div>
  </motion.div>
);

export default DonorListCard;
