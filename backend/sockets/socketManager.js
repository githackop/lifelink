import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io = null;

/** @type {Map<string, { socketId: string, role: string, name: string }>} */
export const onlineUsers = new Map();

const broadcastOnlineUsers = () => {
  if (!io) return;

  const list = Array.from(onlineUsers.entries()).map(([userId, data]) => ({
    userId,
    role: data.role,
    name: data.name,
  }));

  io.emit('user_online_status', list);
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      console.log('Socket auth attempt');

      const token = socket.handshake.auth?.token;

      if (!token) {
        console.log('No token received');
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);

      if (!user) {
        console.log('User not found for socket auth');
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userName = user.name;

      console.log(`Socket authenticated: ${user.name} (${user.role})`);

      next();
    } catch (error) {
      console.error('Socket auth error:', error.message);
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    onlineUsers.set(socket.userId, {
      socketId: socket.id,
      role: socket.userRole,
      name: socket.userName,
    });

    socket.join(`user:${socket.userId}`);

    broadcastOnlineUsers();

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);

      const current = onlineUsers.get(socket.userId);

      if (current?.socketId === socket.id) {
        onlineUsers.delete(socket.userId);
      }

      broadcastOnlineUsers();
    });
  });

  console.log('Socket.io initialized');
  return io;
};

export const getIO = () => io;

export const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(`user:${userId.toString()}`).emit(event, payload);
};

export const emitNewRequest = (donorId, payload) => {
  emitToUser(donorId, 'new_request', payload);
};

export const emitRequestUpdated = (requesterId, payload) => {
  emitToUser(requesterId, 'request_updated', payload);
};