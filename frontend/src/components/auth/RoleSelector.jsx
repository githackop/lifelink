import { motion } from 'framer-motion';
import { Building2, Droplets, User } from 'lucide-react';

const roles = [
  {
    id: 'user',
    label: 'Community Member',
    description: 'Request blood & emergency help',
    icon: User,
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    id: 'donor',
    label: 'Blood Donor',
    description: 'Save lives in your city',
    icon: Droplets,
    gradient: 'from-rose-500 to-red-600',
  },
  {
    id: 'hospital',
    label: 'Hospital',
    description: 'Coordinate donations & emergencies',
    icon: Building2,
    gradient: 'from-emerald-500 to-teal-600',
  },
];

const RoleSelector = ({ value, onChange }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {roles.map((role) => {
      const Icon = role.icon;
      const selected = value === role.id;
      return (
        <motion.button
          key={role.id}
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(role.id)}
          className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 overflow-hidden
            ${selected ? 'border-brand-500 bg-brand-50/80 shadow-md shadow-brand-500/10' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'}`}
        >
          <div
            className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${role.gradient} text-white mb-3 shadow-lg`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <p className="font-semibold text-slate-900 text-sm">{role.label}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{role.description}</p>
          {selected && (
            <motion.div
              layoutId="role-ring"
              className="absolute inset-0 rounded-2xl ring-2 ring-brand-500 ring-offset-2 pointer-events-none"
            />
          )}
        </motion.button>
      );
    })}
  </div>
);

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default RoleSelector;
