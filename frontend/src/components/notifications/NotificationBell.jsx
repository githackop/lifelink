import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Droplets,
  CheckCircle2,
  XCircle,
  Inbox,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const formatTime = (iso) => {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const NotificationBell = () => {
  const { user } = useAuth();
  const {
    connected,
    notifications,
    unreadCount,
    markAllRead,
    markAsRead,
    onlineUsers,
  } = useSocket();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const requestsPath =
    user?.role === 'donor' ? '/requests-received' : '/my-requests';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => {
      if (!prev) markAllRead();
      return !prev;
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold ring-2 ring-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
        <span
          className={`absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white
            ${connected ? 'bg-emerald-500' : 'bg-slate-400'}`}
          title={connected ? 'Live connected' : 'Reconnecting...'}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="absolute right-0 mt-2 w-[min(100vw-2rem,380px)] rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-200/50 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 text-sm">Notifications</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  {connected ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-500" />
                      Live · {onlineUsers.length} online
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
                      Connecting...
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="max-h-[min(60vh,400px)] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center px-4">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">No notifications yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time alerts appear here when requests are sent or updated.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notifications.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => markAsRead(item.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50/80 transition-colors
                          ${!item.read ? 'bg-brand-50/40' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
                              ${item.type === 'new_request' ? 'bg-rose-100 text-rose-600' : item.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}
                          >
                            {item.type === 'new_request' ? (
                              <Droplets className="w-4 h-4" />
                            ) : item.status === 'accepted' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 leading-snug">
                              {item.type === 'new_request'
                                ? `New request from ${item.requesterName}`
                                : `Request ${item.status}`}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              {item.bloodGroup && `Blood group: ${item.bloodGroup}`}
                              {item.message && ` · ${item.message}`}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {formatTime(item.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
              <Link
                to={requestsPath}
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-semibold text-brand-600 hover:text-brand-500 py-1"
              >
                View all requests →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
