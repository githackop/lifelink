import { motion } from 'framer-motion';
import { Building2, Droplets, Mail, Phone, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';

const DonationHistoryCard = ({ donation, index = 0 }) => {
  const requester = donation.requester;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl border border-emerald-200/60 bg-white/70 backdrop-blur-xl p-5 shadow-soft"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
            {requester?.hospitalName ? (
              <Building2 className="w-5 h-5" />
            ) : (
              requester?.name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              {requester?.hospitalName || requester?.name}
            </h3>
            <p className="text-xs text-slate-500 capitalize">Completed donation</p>
          </div>
        </div>
        <StatusBadge status="accepted" />
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <Droplets className="w-4 h-4 text-rose-500" />
          <strong className="text-slate-900">{donation.bloodGroup}</strong>
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(donation.updatedAt || donation.createdAt).toLocaleString()}
        </span>
      </div>

      {donation.message && (
        <p className="mt-3 text-sm text-slate-600 bg-slate-50/80 rounded-xl p-3 border border-slate-100">
          {donation.message}
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-3 text-xs">
        {requester?.email && (
          <span className="inline-flex items-center gap-1 text-slate-500">
            <Mail className="w-3.5 h-3.5" />
            {requester.email}
          </span>
        )}
        {requester?.phoneNumber && (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
            <Phone className="w-3.5 h-3.5" />
            {requester.phoneNumber}
          </span>
        )}
      </div>
    </motion.article>
  );
};

export default DonationHistoryCard;
