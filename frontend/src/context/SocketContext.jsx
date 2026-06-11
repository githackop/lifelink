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
const MAX_NOTIFICATIONS = 50;

const buildNotificationId = (type, data) => {
  const key =
    data.requestId ||
    data.action ||
    data.targetUserId ||
    `${type}-${data.createdAt}`;
  return `${type}-${key}-${data.createdAt || ''}`;
};

const buildNotification = (type, data) => {
  const createdAt = data.createdAt || new Date().toISOString();

  return {
    id: buildNotificationId(type, data),
    type,
    read: false,
    createdAt,
    requestId: data.requestId,
    requesterId: data.requesterId,
    requesterName: data.requesterName,
    donorId: data.donorId,
    donorName: data.donorName,
    status: data.status,
    bloodGroup: data.bloodGroup,
    message: data.message,
    emergency: data.emergency,
    action: data.action,
    targetUserId: data.targetUserId,
    title: data.title,
    body: data.body,
    request: data.request,
  };
};

const getNotificationCopy = (notification) => {
  switch (notification.type) {
    case 'new_request':
      return {
        title: `New request from ${notification.requesterName || 'someone'}`,
        body: [
          notification.bloodGroup && `Blood group: ${notification.bloodGroup}`,
          notification.emergency && 'Emergency',
          notification.message,
        ]
          .filter(Boolean)
          .join(' · '),
      };
    case 'broadcast_request':
      return {
        title: `🚨 Emergency Blood Request`,
        body: `${notification.bloodGroup} blood urgently needed in ${notification.city}`,
      };
    case 'request_response':
      return {
        title: `Request ${notification.status}`,
        body: notification.donorName
          ? `${notification.donorName} · ${notification.bloodGroup || ''}`
          : notification.bloodGroup || '',
      };
    case 'admin_update':
      return {
        title: notification.body || notification.message || 'Platform update',
        body: notification.action?.replace(/_/g, ' ') || '',
      };
    case 'account_update':
      return {
        title: notification.body || notification.message || 'Account update',
        body: '',
      };
    default:
      return { title: 'Notification', body: '' };
  }
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const userRef = useRef(user);
  const seenNotificationIdsRef = useRef(new Set());
  const requestListenersRef = useRef(new Set());
  const adminStatsListenersRef = useRef(new Set());

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      seenNotificationIdsRef.current.clear();
      setNotifications([]);
    }
  }, [isAuthenticated]);

  const pushNotification = useCallback((notification) => {
    if (seenNotificationIdsRef.current.has(notification.id)) {
      return false;
    }
    seenNotificationIdsRef.current.add(notification.id);

    const enriched = {
      ...notification,
      ...getNotificationCopy(notification),
    };

    setNotifications((prev) => [enriched, ...prev].slice(0, MAX_NOTIFICATIONS));
    return true;
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
    setNotifications((prev) => {
      const hasUnread = prev.some((n) => !n.read);
      if (!hasUnread) return prev;
      return prev.map((n) => ({ ...n, read: true }));
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (!target || target.read) return prev;
      return prev.map((n) => (n.id === id ? { ...n, read: true } : n));
    });
  }, []);

  const clearNotifications = useCallback(() => {
    seenNotificationIdsRef.current.clear();
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
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
      console.log('SOCKET EVENT RECEIVED:', 'new_request', data);

      notifyRequestListeners({ type: 'new_request', ...data });

      if (userRef.current?.role !== 'donor') return;

      const notification = buildNotification('new_request', data);
      if (pushNotification(notification)) {
        showSuccess(
          `New request from ${data.requesterName} (${data.bloodGroup})`
        );
      }
    };

    const onRequestResponse = (data) => {
      console.log('SOCKET EVENT RECEIVED:', 'request_response', data);

      notifyRequestListeners({ type: 'request_response', ...data });

      const role = userRef.current?.role;
      if (role !== 'user' && role !== 'hospital') return;

      const notification = buildNotification('request_response', data);
      if (pushNotification(notification)) {
        showRequestResponse(data.status, data.donorName);
      }
    };

    const onRequestUpdated = (data) => {
      console.log('SOCKET EVENT RECEIVED:', 'request_updated', data);
      notifyRequestListeners({ type: 'request_updated', ...data });
    };

    const onBroadcastRequest = (data) => {
      console.log('SOCKET EVENT RECEIVED:', 'broadcast_request', data);

      notifyRequestListeners({ type: 'broadcast_request', ...data });

      const role = userRef.current?.role;
      if (role !== 'donor' && role !== 'hospital' && role !== 'admin') return;

      const notification = buildNotification('broadcast_request', data);
      if (pushNotification(notification)) {
        showSuccess(
          `🚨 Emergency: ${data.bloodGroup} needed in ${data.city}`
        );
      }
    };

    const onAdminUpdate = (data) => {
      console.log('SOCKET EVENT RECEIVED:', 'admin_update', data);

      notifyAdminStatsListeners({ type: 'admin_update', ...data });

      if (userRef.current?.role !== 'admin') return;

      const notification = buildNotification('admin_update', {
        ...data,
        body: data.message,
      });
      if (pushNotification(notification)) {
        showInfo(data.message || 'Platform update');
      }
    };

    const onAccountUpdate = (data) => {
      console.log('SOCKET EVENT RECEIVED:', 'account_update', data);
      showInfo(data.message || 'Your account was updated');
    };

    const onOnlineStatus = (list) => {
      setOnlineUsers(Array.isArray(list) ? list : []);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_request', onNewRequest);
    socket.on('broadcast_request', onBroadcastRequest);
    socket.on('request_response', onRequestResponse);
    socket.on('request_updated', onRequestUpdated);
    socket.on('admin_update', onAdminUpdate);
    socket.on('account_update', onAccountUpdate);
    socket.on('user_online_status', onOnlineStatus);

    if (socket.connected) {
      setConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_request', onNewRequest);
      socket.off('broadcast_request', onBroadcastRequest);
      socket.off('request_response', onRequestResponse);
      socket.off('request_updated', onRequestUpdated);
      socket.off('admin_update', onAdminUpdate);
      socket.off('account_update', onAccountUpdate);
      socket.off('user_online_status', onOnlineStatus);
      disconnectSocket();
      setConnected(false);
    };
  }, [
    loading,
    isAuthenticated,
    user?._id,
    pushNotification,
    notifyRequestListeners,
    notifyAdminStatsListeners,
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
