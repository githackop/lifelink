import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, RefreshCw, Heart } from 'lucide-react';
import { getDonationHistory } from '../services/requestService';
import { getErrorMessage } from '../services/api';
import DonationHistoryCard from '../components/requests/DonationHistoryCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getDonationHistory();
      setDonations(data.donations || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Donation History</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Accepted blood requests you have fulfilled.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchHistory}
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
          <Button variant="secondary" className="mt-4" onClick={fetchHistory}>
            Try again
          </Button>
        </div>
      ) : donations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-2xl border border-dashed border-slate-200 bg-white/50"
        >
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-700">No completed donations yet</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            When you accept a blood request, it will appear here as part of your donation history.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" />
            {donations.length} completed donation{donations.length !== 1 ? 's' : ''}
          </p>
          {donations.map((donation, index) => (
            <DonationHistoryCard key={donation._id} donation={donation} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationHistory;
