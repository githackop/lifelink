import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Droplets, Building2, ShieldCheck, ClipboardList, Clock } from 'lucide-react';
import { getAdminDashboard } from '../services/dashboardService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import { DashboardError, DashboardLoading } from '../components/dashboard/DashboardState';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await getAdminDashboard();
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} onRetry={fetchDashboard} />;

  const stats = data?.stats || {};

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-violet-500/25"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),_transparent_50%)]" />
        <div className="relative z-10">
          <p className="text-violet-200 text-sm font-medium">Admin control center</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            Platform overview
          </h1>
          <p className="text-violet-100/90 mt-2 text-sm">
            Signed in as {user?.name} · Real-time counts from MongoDB
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers ?? 0}
          icon={Users}
          accent="sky"
          delay={0.05}
        />
        <StatCard
          title="Total Donors"
          value={stats.totalDonors ?? 0}
          icon={Droplets}
          accent="rose"
          delay={0.1}
        />
        <StatCard
          title="Total Hospitals"
          value={stats.totalHospitals ?? 0}
          icon={Building2}
          accent="emerald"
          delay={0.15}
        />
        <StatCard
          title="Blood Requests"
          value={stats.totalRequests ?? 0}
          icon={ClipboardList}
          accent="slate"
          delay={0.2}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests ?? 0}
          icon={Clock}
          accent="amber"
          delay={0.25}
        />
        <StatCard
          title="Pending Verifications"
          value={stats.pendingVerifications ?? 0}
          subtitle="Verification module not active"
          icon={ShieldCheck}
          accent="violet"
          delay={0.3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-white/70 backdrop-blur-xl p-6 shadow-soft"
      >
        <h3 className="font-semibold text-slate-900">Analytics snapshot</h3>
        <p className="text-sm text-slate-500 mt-2">
          User counts reflect live data from your database. Request tracking and verification
          workflows will add more metrics when those modules are enabled.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Users', value: stats.totalUsers ?? 0 },
            { label: 'Donors', value: stats.totalDonors ?? 0 },
            { label: 'Hospitals', value: stats.totalHospitals ?? 0 },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-xl bg-white/80 border border-slate-100">
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{item.value}</p>
              <p className="text-xs text-slate-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
