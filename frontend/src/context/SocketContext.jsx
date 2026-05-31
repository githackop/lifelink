import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { connectSocket, disconnectSocket } from '../services/socket';
import { showInfo, showRequestResponse, showSuccess } from '../utils/toast';

const SocketContext = createContext(null);

const createNotification = (type, data) => ({
  id: `${type}-${data.requestId || data.request?._id || data.action}-${Date.now()}`,
  type,
  read: false,
  createdAt: new Date().toISOString(),
  requestId: data.requestId || data.request?._id,
  status: data.status,
  requesterName: data.requesterName,
  bloodGroup: data.bloodGroup,
  message: data.message,
  emergency: data.emergency,
  request: data.request,
  action: data.action,
});

const adminActionLabels = {
  user_blocked: 'User blocked',
  user_unblocked: 'User unblocked',
  user_deleted: 'User removed',
  donor_deleted: 'Donor removed',
  hospital_verified: 'Hospital verified',
  hospital_unverified: 'Hospital unverified',
  hospital_blocked: 'Hospital blocked',
  hospital_unblocked: 'Hospital unblocked',
  request_created: 'New blood request',
  request_status_changed: 'Request status updated',
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const requestListenersRef = useRef(new Set());
  const adminStatsListenersRef = useRef(new Set());

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 50));
    setUnreadCount((count) => count + 1);
  }, []);

  const subscribeToRequests = useCallback((handler) => {
    requestListenersRef.current.add(handler);
    return () => requestListenersRef.current.delete(handler);
  }, []);

  const subscribeToAdminStats = useCallback((handler) => {
    adminStatsListenersRef.current.add(handler);
    return () => adminStatsListenersRef.current.delete(handler);
  }, []);

  const notifyRequestListeners = useCallback((event) => {
    requestListenersRef.current.forEach((handler) => {
      try {
        handler(event);
      } catch (err) {
        console.error('Request listener error:', err);
      }
    });
  }, []);

  const notifyAdminStatsListeners = useCallback((event) => {
    adminStatsListenersRef.current.forEach((handler) => {
      try {
        handler(event);
      } catch (err) {
        console.error('Admin stats listener error:', err);
      }
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id && !n.read) {
          setUnreadCount((c) => Math.max(0, c - 1));
          return { ...n, read: true };
        }
        return n;
      })
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const handleRequestResponse = useCallback(
    (data, sourceEvent) => {
      const notification = createNotification(sourceEvent, data);
      addNotification(notification);
      notifyRequestListeners({ type: sourceEvent, ...data });

      if (user?.role === 'user' || user?.role === 'hospital') {
        showRequestResponse(data.status, data.donorName);
      }
    },
    [user?.role, addNotification, notifyRequestListeners]
  );

  useEffect(() => {
    if (loading || !isAuthenticated || !user) {
      disconnectSocket();
      setConnected(false);
      setOnlineUsers([]);
      return undefined;
    }

    const socket = connectSocket();
    if (!socket) return undefined;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onNewRequest = (data) => {
      const notification = createNotification('new_request', data);
      addNotification(notification);
      notifyRequestListeners({ type: 'new_request', ...data });

      if (user.role === 'donor') {
        showSuccess(
          `New request from ${data.requesterName} (${data.bloodGroup})`
        );
      }
    };

    const onRequestResponse = (data) => {
      handleRequestResponse(data, 'request_response');
    };

    const onAdminUpdate = (data) => {
      const notification = createNotification('admin_update', data);
      addNotification(notification);
      notifyAdminStatsListeners({ type: 'admin_update', ...data });

      if (user.role === 'admin') {
        const label = adminActionLabels[data.action] || 'Platform update';
        showInfo(label);
      } else if (data.action?.includes('block') && data.targetUserId === user._id) {
        showInfo('Your account status was updated by an administrator');
      }
    };

    const onOnlineStatus = (list) => {
      setOnlineUsers(Array.isArray(list) ? list : []);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_request', onNewRequest);
    socket.on('request_response', onRequestResponse);
    socket.on('admin_update', onAdminUpdate);
    socket.on('user_online_status', onOnlineStatus);

    if (socket.connected) {
      setConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_request', onNewRequest);
      socket.off('request_response', onRequestResponse);
      socket.off('admin_update', onAdminUpdate);
      socket.off('user_online_status', onOnlineStatus);
      disconnectSocket();
      setConnected(false);
    };
  }, [
    user,
    isAuthenticated,
    loading,
    addNotification,
    notifyRequestListeners,
    notifyAdminStatsListeners,
    handleRequestResponse,
  ]);

  const value = useMemo(
    () => ({
      connected,
      onlineUsers,
      notifications,
      unreadCount,
      subscribeToRequests,
      subscribeToAdminStats,
      markAllRead,
      markAsRead,
      clearNotifications,
    }),
    [
      connected,
      onlineUsers,
      notifications,
      unreadCount,
      subscribeToRequests,
      subscribeToAdminStats,
      markAllRead,
      markAsRead,
      clearNotifications,
    ]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const useSocketOptional = () => useContext(SocketContext);