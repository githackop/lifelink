import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

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

const logEmit = (event, target, payload) => {
  console.log('SOCKET EVENT EMITTED:', event, { target, payload });
};

const emitToRoom = (room, event, payload) => {
  if (!io) {
    console.warn('Socket.io not initialized — skipped emit:', event);
    return;
  }
  logEmit(event, room, payload);
  io.to(room).emit(event, payload);
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
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userName = user.name;

      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.userId, {
      socketId: socket.id,
      role: socket.userRole,
      name: socket.userName,
    });

    socket.join(`user:${socket.userId}`);
    socket.join(`role:${socket.userRole}`);

    broadcastOnlineUsers();

    socket.on('disconnect', () => {
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
  if (!userId) return;
  emitToRoom(`user:${userId.toString()}`, event, payload);
};

export const emitToAdmins = (event, payload) => {
  emitToRoom('role:admin', event, payload);
};

export const emitBroadcastRequest = (payload) => {
  const body = {
    requestId: payload.requestId?.toString(),
    requesterId: payload.requesterId?.toString(),
    requesterName: payload.requesterName,
    bloodGroup: payload.bloodGroup,
    city: payload.city,
    message: payload.message ?? null,
    emergencyLevel: payload.emergencyLevel,
    createdAt: payload.createdAt || new Date().toISOString(),
  };

  emitToRoom('role:donor', 'broadcast_request', body);
  emitToRoom('role:hospital', 'broadcast_request', body);
  emitToRoom('role:admin', 'broadcast_request', body);
};

/** Blood request created — notify donor only */
export const emitNewRequest = async (donorId, payload) => {
  try {
    const notification = await Notification.create({
      recipientId: donorId,
      type: 'new_request',
      title: `New request from ${payload.requesterName || 'someone'}`,
      message: payload.message || `Blood group: ${payload.bloodGroup} needed`,
      metadata: {
        requestId: payload.requestId?.toString(),
        requesterId: payload.requesterId?.toString(),
        requesterName: payload.requesterName,
        donorId: payload.donorId?.toString(),
        bloodGroup: payload.bloodGroup,
        message: payload.message ?? null,
        emergency: Boolean(payload.emergency),
        request: payload.request,
      },
    });

    const body = {
      _id: notification._id.toString(),
      type: 'new_request',
      read: false,
      createdAt: notification.createdAt.toISOString(),
      requestId: payload.requestId?.toString(),
      requesterId: payload.requesterId?.toString(),
      requesterName: payload.requesterName,
      donorId: payload.donorId?.toString(),
      bloodGroup: payload.bloodGroup,
      message: payload.message ?? null,
      emergency: Boolean(payload.emergency),
      request: payload.request,
    };

    emitToUser(donorId, 'new_request', body);
  } catch (err) {
    console.error('Error in emitNewRequest:', err);
  }
};

/** Donor accepted/rejected — notify requester (user/hospital) only */
export const emitRequestResponse = async (requesterId, payload) => {
  try {
    const notification = await Notification.create({
      recipientId: requesterId,
      type: 'request_response',
      title: `Request ${payload.status}`,
      message: payload.donorName
        ? `${payload.donorName} ${payload.status} your request`
        : `Your blood request was ${payload.status}`,
      metadata: {
        requestId: payload.requestId?.toString(),
        donorId: payload.donorId?.toString(),
        donorName: payload.donorName,
        requesterId: payload.requesterId?.toString(),
        status: payload.status,
        bloodGroup: payload.bloodGroup,
        request: payload.request,
      },
    });

    const body = {
      _id: notification._id.toString(),
      type: 'request_response',
      read: false,
      createdAt: notification.createdAt.toISOString(),
      requestId: payload.requestId?.toString(),
      donorId: payload.donorId?.toString(),
      donorName: payload.donorName,
      requesterId: payload.requesterId?.toString(),
      status: payload.status,
      bloodGroup: payload.bloodGroup,
      request: payload.request,
    };

    emitToUser(requesterId, 'request_response', body);

    // UI list refresh only (no duplicate notification on frontend)
    emitToUser(requesterId, 'request_updated', { ...body, request: payload.request });
  } catch (err) {
    console.error('Error in emitRequestResponse:', err);
  }
};

/** @deprecated alias */
export const emitRequestUpdated = emitRequestResponse;

const ADMIN_MESSAGES = {
  user_blocked: 'A user account was blocked',
  user_unblocked: 'A user account was unblocked',
  user_deleted: 'A user account was removed',
  donor_deleted: 'A donor account was removed',
  hospital_verified: 'A hospital was verified',
  hospital_unverified: 'Hospital verification was removed',
  hospital_blocked: 'A hospital was blocked',
  hospital_unblocked: 'A hospital was unblocked',
  request_created: 'A new blood request was created',
  request_status_changed: 'A blood request status was updated',
};

/** Platform admin actions — admins only */
export const emitAdminUpdate = async (payload) => {
  try {
    const admins = await User.find({ role: 'admin' });

    const notificationPromises = admins.map((admin) =>
      Notification.create({
        recipientId: admin._id,
        type: 'admin_update',
        title: payload.message || ADMIN_MESSAGES[payload.action] || 'Platform update',
        message: payload.action?.replace(/_/g, ' ') || 'Platform action',
        metadata: {
          action: payload.action,
          targetUserId: payload.targetUserId?.toString() || null,
          message: payload.message || ADMIN_MESSAGES[payload.action] || 'Platform update',
          user: payload.user,
          request: payload.request,
        },
      })
    );

    const notifications = await Promise.all(notificationPromises);
    const sampleNotification = notifications[0];

    const body = {
      _id: sampleNotification?._id?.toString() || new Date().getTime().toString(),
      type: 'admin_update',
      read: false,
      createdAt: sampleNotification?.createdAt?.toISOString() || new Date().toISOString(),
      action: payload.action,
      targetUserId: payload.targetUserId?.toString() || null,
      message: payload.message || ADMIN_MESSAGES[payload.action] || 'Platform update',
      user: payload.user,
      request: payload.request,
    };

    emitToAdmins('admin_update', body);
  } catch (err) {
    console.error('Error in emitAdminUpdate:', err);
  }
};

/** Account status change for affected user (not shown in admin feed) */
export const emitAccountUpdate = (userId, payload) => {
  emitToUser(userId, 'account_update', {
    action: payload.action,
    message: payload.message || 'Your account was updated by an administrator',
    createdAt: payload.createdAt || new Date().toISOString(),
  });
};
