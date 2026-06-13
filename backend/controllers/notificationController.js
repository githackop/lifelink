import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// @desc    Get latest notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    count: notifications.length,
    notifications,
  });
});

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipientId: req.user._id,
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    success: true,
    notification,
  });
});

// @desc    Mark all user's notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipientId: req.user._id, read: false },
    { $set: { read: true } }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

// @desc    Get unread count for user
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipientId: req.user._id,
    read: false,
  });

  res.status(200).json({
    success: true,
    count,
  });
});
