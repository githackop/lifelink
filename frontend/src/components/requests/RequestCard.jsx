import { motion } from 'framer-motion';
import {
  Building2,
  Droplets,
  Mail,
  Phone,
  User,
  Check,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import Button from '../ui/Button';

const RequestCard = ({
  request,
  view = 'sent',
  index = 0,
  onAccept,
  onReject,
  onComplete, // ✅ ADDED
  actionLoadingId,
}) => {
  const isReceived = view === 'received';
  const person = isReceived ? request.requester : request.donor;

  const isPending = request.status === 'pending';
  const isAccepted = request.status === 'accepted';
  const isCompleted = request.completed === true;

  const loading = actionLoadingId === request._id;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-5 shadow-soft"
    >
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shadow-md
              ${
                isReceived
                  ? 'bg-gradient-to-br from-sky-500 to-blue-600'
                  : 'bg-gradient-to-br from-rose-500 to-red-600'
              }`}
          >
            {person?.hospitalName ? (
              <Building2 className="w-5 h-5" />
            ) : (
              person?.name?.charAt(0)?.toUpperCase()
            )}
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              {person?.hospitalName || person?.name}
            </h3>
            <p className="text-xs text-slate-500 capitalize">
              {isReceived ? `Requester · ${person?.role}` : 'Donor'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {request.emergency && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-bold uppercase border border-amber-200">
              <AlertTriangle className="w-3 h-3" />
              Emergency
            </span>
          )}

          <StatusBadge status={request.status} />

          {/* ✅ Completed badge */}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              Completed
            </span>
          )}
        </div>
      </div>

      {/* HOSPITAL NAME */}
      {request.hospitalName && (
        <p className="mt-2 text-xs text-emerald-700 font-medium">
          {request.hospitalName}
        </p>
      )}

      {/* DETAILS */}
      <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 text-slate-600">
          <Droplets className="w-4 h-4 text-rose-500" />
          Blood group:{' '}
          <strong className="text-slate-900">{request.bloodGroup}</strong>
        </span>

        <span className="text-slate-400 text-xs sm:text-right">
          {new Date(request.createdAt).toLocaleString()}
        </span>
      </div>

      {/* MESSAGE */}
      {request.message && (
        <p className="mt-3 text-sm text-slate-600 bg-slate-50/80 rounded-xl p-3 border border-slate-100">
          {request.message}
        </p>
      )}

      {/* ACTIONS (DONOR RECEIVED) */}
      {isReceived && isPending && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            className="flex-1 sm:flex-none !py-2"
            loading={loading}
            onClick={() => onAccept(request._id)}
          >
            <Check className="w-4 h-4" />
            Accept
          </Button>

          <Button
            variant="secondary"
            className="flex-1 sm:flex-none !py-2 !text-red-600 hover:!bg-red-50"
            disabled={loading}
            onClick={() => onReject(request._id)}
          >
            <X className="w-4 h-4" />
            Reject
          </Button>
        </div>
      )}

      {/* ✅ COMPLETE BUTTON (ONLY AFTER ACCEPTED) */}
      {isReceived && isAccepted && !isCompleted && (
        <div className="mt-4 flex">
          <Button
            className="w-full sm:w-auto !py-2"
            loading={loading}
            onClick={() => onComplete(request._id)}
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark as Completed
          </Button>
        </div>
      )}

      {/* SENT VIEW FOOTER */}
      {view === 'sent' && person && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-3 text-xs text-slate-500">
          {person.email && (
            <span className="inline-flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              {person.email}
            </span>
          )}

          {person.phoneNumber && request.status === 'accepted' && (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <Phone className="w-3.5 h-3.5" />
              {person.phoneNumber}
            </span>
          )}

          {!person.hospitalName && person.city && (
            <span className="inline-flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {person.city}
            </span>
          )}
        </div>
      )}
    </motion.article>
  );
};

export default RequestCard;