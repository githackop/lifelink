import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Activity, Users, User } from 'lucide-react';
import { getUserDashboard } from '../services/dashboardService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import { DashboardError, DashboardLoading } from '../components/dashboard/DashboardState';

const UserDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await getUserDashboard();
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
  const profile = data?.user || user;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-rose-600 to-rose-700 p-6 sm:p-8 text-white shadow-xl shadow-rose-500/25"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-rose-100 text-sm font-medium">Welcome back</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            Hello, {profile?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-rose-100/90 mt-2 max-w-lg text-sm sm:text-base">
            Coordinate blood requests and find available donors in your area.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur">
              <User className="w-4 h-4" />
              {profile?.email}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          title="Total Requests"
          value={stats.totalRequestsMade ?? 0}
          subtitle="All time"
          icon={ClipboardList}
          accent="sky"
          delay={0.05}
        />
        <StatCard
          title="Active Requests"
          value={stats.activeRequests ?? 0}
          subtitle="In progress"
          icon={Activity}
          accent="rose"
          delay={0.1}
        />
        <StatCard
          title="Donors Nearby"
          value={stats.availableDonorsNearby ?? 0}
          subtitle="Available now"
          icon={Users}
          accent="emerald"
          delay={0.15}
        />
      </div>

      <RecentActivity items={data?.recentActivity || []} />
    </div>
  );
};

export default UserDashboard;
