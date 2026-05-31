import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Building2, Droplets } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roleLabels } from '../utils/roleConfig';

const ProfilePage = () => {
  const { user } = useAuth();
  const badge = roleLabels[user?.role] || roleLabels.user;

  const fields = [
    { label: 'Email', value: user?.email, icon: Mail },
    { label: 'Phone', value: user?.phoneNumber, icon: Phone },
  ];

  if (user?.city) {
    fields.push({ label: 'City', value: user.city, icon: MapPin });
  }
  if (user?.role === 'donor' && user?.bloodGroup) {
    fields.push({ label: 'Blood group', value: user.bloodGroup, icon: Droplets });
  }
  if (user?.role === 'hospital' && user?.hospitalName) {
    fields.push({ label: 'Hospital', value: user.hospitalName, icon: Building2 });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <p className="text-slate-500 mt-1 text-sm">Your account information</p>

      <div className="mt-6 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-rose-600 flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {fields.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/80 border border-slate-100"
            >
              <Icon className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-slate-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
