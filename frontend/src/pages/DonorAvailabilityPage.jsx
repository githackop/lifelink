import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateAvailability } from '../services/donorService';
import { getErrorMessage } from '../services/api';
import AvailabilityToggle from '../components/dashboard/AvailabilityToggle';
import { Droplets } from 'lucide-react';

const DonorAvailabilityPage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const available = user?.availability ?? false;

  const handleChange = async (nextValue) => {
    setLoading(true);
    try {
      const { data: res } = await updateAvailability(nextValue);
      updateUser(res.user);
      toast.success(res.message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Availability Status</h1>
        <p className="text-slate-500 text-sm mt-1">
          Control whether you appear as an available donor on LifeLink.
        </p>
      </div>

      <AvailabilityToggle available={available} onChange={handleChange} loading={loading} />

      <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-100">
            <Droplets className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{user?.bloodGroup}</p>
            <p className="text-sm text-slate-500">{user?.city}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DonorAvailabilityPage;
