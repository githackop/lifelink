import {
  LayoutDashboard,
  Search,
  ClipboardList,
  User,
  Inbox,
  ToggleLeft,
  History,
  AlertTriangle,
  Database,
  Users,
  Droplets,
  Building2,
  ShieldCheck,
} from 'lucide-react';

export const roleLabels = {
  user: {
    label: 'Community Member',
    color: 'bg-sky-500/15 text-sky-700 border-sky-200',
  },
  donor: {
    label: 'Blood Donor',
    color: 'bg-rose-500/15 text-rose-700 border-rose-200',
  },
  hospital: {
    label: 'Hospital',
    color: 'bg-emerald-500/15 text-emerald-700 border-emerald-200',
  },
  admin: {
    label: 'Administrator',
    color: 'bg-violet-500/15 text-violet-700 border-violet-200',
  },
};

export const sidebarMenus = {
  user: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Search Donors', icon: Search, path: '/search-donors' },
    { label: 'My Requests', icon: ClipboardList, path: '/my-requests' },
    { label: 'Profile', icon: User, path: '/profile' },
  ],

  donor: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Requests Received', icon: Inbox, path: '/requests-received' },
    { label: 'Availability Status', icon: ToggleLeft, path: '/availability' },
    { label: 'Donation History', icon: History, path: '/donation-history' },
    { label: 'Profile', icon: User, path: '/profile' },
  ],

  hospital: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },

    {
      label: 'Emergency Requests',
      icon: AlertTriangle,
      path: '/emergency-requests',
    },

    // ✅ FIXED: correct feature page
    {
      label: 'Hospital Donors',
      icon: Database,
      path: '/hospital-donors',
    },

    { label: 'Search Donors', icon: Search, path: '/search-donors' },
    { label: 'Sent Requests', icon: ClipboardList, path: '/my-requests' },
    { label: 'Profile', icon: User, path: '/profile' },
  ],

  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Users', icon: Users, path: '/users' },
    { label: 'Donors', icon: Droplets, path: '/donors' },
    { label: 'Hospitals', icon: Building2, path: '/hospitals' },
    { label: 'Verifications', icon: ShieldCheck, path: '/verifications' },
  ],
};

export const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'LL';