import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Inbox, RefreshCw, Radio } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  getReceivedRequests,
  getSentRequests,
  updateRequestStatus,
  completeRequest as completeRequestAPI, // ✅ ADDED
} from '../services/requestService';
import { getErrorMessage } from '../services/api';
import RequestCard from '../components/requests/RequestCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const Requests = () => {
  const { user } = useAuth();
  const { connected, subscribeToRequests } = useSocket();
  const isDonor = user?.role === 'donor';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    setError('');

    try {
      const { data } = isDonor
        ? await getReceivedRequests()
        : await getSentRequests();

      setRequests(data.requests || []);
    } catch (err) {
      setError(getErrorMessage(err));
      if (!silent) setRequests([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [isDonor]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const unsubscribe = subscribeToRequests((event) => {
      if (event.type === 'new_request' && isDonor && event.request) {
        setRequests((prev) => {
          const exists = prev.some((r) => r._id === event.request._id);
          if (exists) return prev;
          return [event.request, ...prev];
        });
      }

      if (event.type === 'request_updated' && event.request) {
        setRequests((prev) =>
          prev.map((r) =>
            r._id === event.request._id ? event.request : r
          )
        );
      }
    });

    return unsubscribe;
  }, [subscribeToRequests, isDonor]);

  const handleStatusUpdate = async (id, status) => {
    setActionLoadingId(id);
    try {
      const { data } = await updateRequestStatus(id, status);
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? data.request : r))
      );
      toast.success(data.message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  // 🔥 NEW: Complete donation handler
  const handleComplete = async (id) => {
    setActionLoadingId(id);
    try {
      const { data } = await completeRequestAPI(id);

      setRequests((prev) =>
        prev.map((r) => (r._id === id ? data.request : r))
      );

      toast.success(data.message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const acceptedCount = requests.filter((r) => r.status === 'accepted').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const title = isDonor ? 'Requests Received' : 'My Requests';
  const subtitle = isDonor
    ? 'Review and respond to incoming blood requests.'
    : 'Track blood requests you have sent to donors.';
  const EmptyIcon = isDonor ? Inbox : ClipboardList;

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {title}
            </h1>

            {connected && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                <Radio className="w-3 h-3" />
                Live
              </span>
            )}
          </div>

          <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>

          {!loading && requests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                {pendingCount} pending
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                {acceptedCount} accepted
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-100 text-red-800 border border-red-200">
                {rejectedCount} rejected
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => fetchRequests()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-500 font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-16 rounded-2xl bg-red-50 border border-red-100">
          <p className="text-red-600 font-medium">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={() => fetchRequests()}>
            Try again
          </Button>
        </div>
      ) : requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-2xl border border-dashed border-slate-200 bg-white/50"
        >
          <EmptyIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-700">No requests yet</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {isDonor
              ? 'When someone sends you a blood request, it will appear here instantly.'
              : 'Search for donors and send a request to get started.'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {requests.map((request, index) => (
            <RequestCard
              key={request._id}
              request={request}
              view={isDonor ? 'received' : 'sent'}
              index={index}
              onAccept={(id) => handleStatusUpdate(id, 'accepted')}
              onReject={(id) => handleStatusUpdate(id, 'rejected')}
              onComplete={handleComplete}   // ✅ ADDED
              actionLoadingId={actionLoadingId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;