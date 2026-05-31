import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { formatRequest } from './requestController.js';

const getPublicUser = (user) => user.toPublicJSON();

const formatActivity = (request, perspective) => {
  const donorName = request.donorId?.name || 'Donor';
  const requesterName = request.requesterId?.hospitalName || request.requesterId?.name || 'Requester';
  const emergencyTag = request.emergency ? ' [Emergency]' : '';

  if (perspective === 'sent') {
    return {
      id: request._id.toString(),
      message: `Request to ${donorName} — ${request.status}${emergencyTag}`,
      time: request.createdAt,
    };
  }

  return {
    id: request._id.toString(),
    message: `Request from ${requesterName} — ${request.status}${emergencyTag}`,
    time: request.createdAt,
  };
};

export const getUserDashboard = asyncHandler(async (req, res) => {
  if (req.user.role !== 'user') {
    throw new AppError('Not authorized to access this dashboard', 403);
  }

  const donorQuery = { role: 'donor', availability: true };
  if (req.user.city?.trim()) {
    donorQuery.city = { $regex: new RegExp(`^${req.user.city.trim()}$`, 'i') };
  }

  const requesterFilter = { requesterId: req.user._id };

  const [availableDonorsNearby, totalRequestsMade, activeRequests, pendingRequests, acceptedRequests, recent] =
    await Promise.all([
      User.countDocuments(donorQuery),
      BloodRequest.countDocuments(requesterFilter),
      BloodRequest.countDocuments({ ...requesterFilter, status: { $in: ['pending', 'accepted'] } }),
      BloodRequest.countDocuments({ ...requesterFilter, status: 'pending' }),
      BloodRequest.countDocuments({ ...requesterFilter, status: 'accepted' }),
      BloodRequest.find(requesterFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('donorId', 'name'),
    ]);

  res.status(200).json({
    success: true,
    data: {
      user: getPublicUser(req.user),
      stats: {
        totalRequestsMade,
        activeRequests,
        pendingRequests,
        acceptedRequests,
        availableDonorsNearby,
      },
      recentActivity: recent.map((r) => formatActivity(r, 'sent')),
    },
  });
});

export const getDonorDashboard = asyncHandler(async (req, res) => {
  if (req.user.role !== 'donor') {
    throw new AppError('Not authorized to access this dashboard', 403);
  }

  const donorFilter = { donorId: req.user._id };

  const [totalRequestsReceived, requestsAccepted, pendingRequests, rejectedRequests, recent] =
    await Promise.all([
      BloodRequest.countDocuments(donorFilter),
      BloodRequest.countDocuments({ ...donorFilter, status: 'accepted' }),
      BloodRequest.countDocuments({ ...donorFilter, status: 'pending' }),
      BloodRequest.countDocuments({ ...donorFilter, status: 'rejected' }),
      BloodRequest.find(donorFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('requesterId', 'name hospitalName role'),
    ]);

  res.status(200).json({
    success: true,
    data: {
      user: getPublicUser(req.user),
      stats: {
        totalRequestsReceived,
        requestsAccepted,
        pendingRequests,
        rejectedRequests,
      },
      recentActivity: recent.map((r) => formatActivity(r, 'received')),
    },
  });
});

export const getHospitalDashboard = asyncHandler(async (req, res) => {
  if (req.user.role !== 'hospital') {
    throw new AppError('Not authorized to access this dashboard', 403);
  }

  const requesterFilter = { requesterId: req.user._id };

  const [
    totalDonors,
    emergencyRequests,
    activeRequests,
    pendingRequests,
    acceptedRequests,
    donors,
    emergencyRequestsList,
    recent,
  ] = await Promise.all([
    User.countDocuments({ role: 'donor' }),
    BloodRequest.countDocuments({ ...requesterFilter, emergency: true }),
    BloodRequest.countDocuments({ ...requesterFilter, status: { $in: ['pending', 'accepted'] } }),
    BloodRequest.countDocuments({ ...requesterFilter, status: 'pending' }),
    BloodRequest.countDocuments({ ...requesterFilter, status: 'accepted' }),
    User.find({ role: 'donor' })
      .select('name email phoneNumber bloodGroup city availability')
      .sort({ availability: -1, name: 1 })
      .limit(8),
    BloodRequest.find({ ...requesterFilter, emergency: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('donorId', 'name bloodGroup city availability phoneNumber')
      .populate('requesterId', 'name hospitalName'),
    BloodRequest.find(requesterFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('donorId', 'name'),
  ]);

  res.status(200).json({
    success: true,
    data: {
      user: getPublicUser(req.user),
      hospitalName: req.user.hospitalName,
      stats: {
        hospitalName: req.user.hospitalName,
        totalDonors,
        emergencyRequests,
        activeRequests,
        pendingRequests,
        acceptedRequests,
        connectedDonors: totalDonors,
        emergencyRequestsCount: emergencyRequests,
      },
      donors: donors.map((d) => d.toPublicJSON()),
      emergencyRequests: emergencyRequestsList.map(formatRequest),
      recentActivity: recent.map((r) => formatActivity(r, 'sent')),
    },
  });
});

export const getAdminDashboard = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Not authorized to access this dashboard', 403);
  }

  const [totalUsers, totalDonors, totalHospitals, totalRequests, pendingRequests] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'donor' }),
    User.countDocuments({ role: 'hospital' }),
    BloodRequest.countDocuments(),
    BloodRequest.countDocuments({ status: 'pending' }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      user: getPublicUser(req.user),
      stats: {
        totalUsers,
        totalDonors,
        totalHospitals,
        pendingVerifications: 0,
        totalRequests,
        pendingRequests,
      },
    },
  });
});
