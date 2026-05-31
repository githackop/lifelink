import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, RefreshCw, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllDonors } from '../services/donorsService';
import { getErrorMessage } from '../services/api';
import DonorListCard from '../components/requests/DonorListCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const DonorDatabase = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getAllDonors();
      setDonors(data.donors || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setDonors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const availableCount = donors.filter((d) => d.availability).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Donor Database</h1>
        <p className="text-slate-500 mt-1 text-sm">
          All registered donors on the LifeLink platform.
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500 flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          {loading ? 'Loading...' : `${donors.length} donors · ${availableCount} available`}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchDonors}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm text-brand-600 font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/search-donors"
            className="text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-rose-600 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            Send request
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-16 rounded-2xl bg-red-50 border border-red-100">
          <p className="text-red-600 font-medium">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={fetchDonors}>
            Try again
          </Button>
        </div>
      ) : donors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-2xl border border-dashed border-slate-200 bg-white/50"
        >
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-700">No donors registered</p>
          <p className="text-sm text-slate-500 mt-1">Donors will appear here once they join LifeLink.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {donors.map((donor, index) => (
            <DonorListCard key={donor._id} donor={donor} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DonorDatabase;
