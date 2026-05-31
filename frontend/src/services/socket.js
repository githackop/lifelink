import { io } from 'socket.io-client';
import { getToken } from '../utils/storage';

let socket = null;

export const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return apiUrl.replace(/\/api\/?$/, '') || 'http://localhost:5000';
};

export const connectSocket = () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(getSocketUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
