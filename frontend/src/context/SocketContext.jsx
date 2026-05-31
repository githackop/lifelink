import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { connectSocket, disconnectSocket } from '../services/socket';

const SocketContext = createContext(null);

const createNotification = (type, data) => ({
  id: `${type}-${data.requestId || data.request?._id}-${Date.now()}`,
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
});

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const requestListenersRef = useRef(new Set());

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 50));
    setUnreadCount((count) => count + 1);
  }, []);

  const subscribeToRequests = useCallback((handler) => {
    requestListenersRef.current.add(handler);
    return () => requestListenersRef.current.delete(handler);
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
        toast.success(
          `New blood request from ${data.requesterName} (${data.bloodGroup})`,
          { duration: 5000 }
        );
      }
    };

    const onRequestUpdated = (data) => {
      const notification = createNotification('request_updated', data);
      addNotification(notification);
      notifyRequestListeners({ type: 'request_updated', ...data });

      if (user.role === 'user' || user.role === 'hospital') {
        const label = data.status === 'accepted' ? 'accepted' : 'rejected';
        toast(
          data.status === 'accepted'
            ? `Your request was accepted!`
            : `Your request was ${label}.`,
          {
            icon: data.status === 'accepted' ? '✅' : 'ℹ️',
            duration: 5000,
          }
        );
      }
    };

    const onOnlineStatus = (list) => {
      setOnlineUsers(Array.isArray(list) ? list : []);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_request', onNewRequest);
    socket.on('request_updated', onRequestUpdated);
    socket.on('user_online_status', onOnlineStatus);

    if (socket.connected) {
      setConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_request', onNewRequest);
      socket.off('request_updated', onRequestUpdated);
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
  ]);

  const value = useMemo(
    () => ({
      connected,
      onlineUsers,
      notifications,
      unreadCount,
      subscribeToRequests,
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
