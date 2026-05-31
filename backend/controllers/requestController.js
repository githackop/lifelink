import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import HospitalDonor from '../models/HospitalDonor.js';
import { BLOOD_GROUPS } from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { emitNewRequest, emitRequestResponse, emitToAdmins } from '../sockets/socketManager.js';

const requesterFields = 'name email role phoneNumber hospitalName city';
const donorFields = 'name email bloodGroup city availability phoneNumber';

const populateRequest = (query) =>
  query
    .populate('requesterId', requesterFields)
    .populate('donorId', donorFields);

export const formatRequest = (request) => {
  const doc = request.toObject ? request.toObject() : request;
  return {
    _id: doc._id,
    bloodGroup: doc.bloodGroup,
    message: doc.message,
    status: doc.status,
    emergency: doc.emergency ?? false,
    completed: doc.completed ?? false, 
    hospitalName: doc.hospitalName,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    requester: doc.requesterId,
    donor: doc.donorId,
  };
};

export const createRequest = asyncHandler(async (req, res) => {
  const { donorId, bloodGroup, message, emergency: emergencyBody } = req.body;

  if (!donorId) {
    throw new AppError('Donor ID is required', 400);
  }

  const donor = await User.findOne({ _id: donorId, role: 'donor' });

  if (!donor) {
    throw new AppError('Donor not found', 404);
  }

  if (!donor.availability) {
    throw new AppError('This donor is currently unavailable', 400);
  }

  if (donor._id.equals(req.user._id)) {
    throw new AppError('You cannot send a request to yourself', 400);
  }

  const resolvedBloodGroup = bloodGroup || donor.bloodGroup;

  if (!resolvedBloodGroup || !BLOOD_GROUPS.includes(resolvedBloodGroup)) {
    throw new AppError('Valid blood group is required', 400);
  }

  const existingActive = await BloodRequest.findOne({
    requesterId: req.user._id,
    donorId: donor._id,
    status: { $in: ['pending', 'accepted'] },
    completed: { $ne: true },
  });

  if (existingActive) {
    throw new AppError(
      `You already have an active ${existingActive.status} request with this donor`,
      400
    );
  }

  const isHospital = req.user.role === 'hospital';
  const emergency = isHospital ? true : Boolean(emergencyBody);

  const bloodRequest = await BloodRequest.create({
    requesterId: req.user._id,
    donorId: donor._id,
    bloodGroup: resolvedBloodGroup,
    message: message?.trim() || undefined,
    emergency,
    hospitalName: isHospital ? req.user.hospitalName : undefined,
  });

  const populated = await populateRequest(BloodRequest.findById(bloodRequest._id));
  const formatted = formatRequest(populated);

  emitNewRequest(donor._id, {
    requestId: formatted._id,
    requesterName: formatted.requester?.hospitalName || formatted.requester?.name,
    bloodGroup: formatted.bloodGroup,
    message: formatted.message,
    emergency: formatted.emergency,
    hospitalName: formatted.hospitalName,
    requester: formatted.requester,
    request: formatted,
  });

  emitToAdmins('admin_update', {
    action: 'request_created',
    request: formatted,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    message: emergency ? 'Emergency blood request sent successfully' : 'Blood request sent successfully',
    request: formatted,
  });
});

export const getReceivedRequests = asyncHandler(async (req, res) => {
  const requests = await populateRequest(
    BloodRequest.find({ donorId: req.user._id }).sort({ createdAt: -1 })
  );

  res.status(200).json({
    success: true,
    count: requests.length,
    requests: requests.map(formatRequest),
  });
});

export const getSentRequests = asyncHandler(async (req, res) => {
  const requests = await populateRequest(
    BloodRequest.find({ requesterId: req.user._id }).sort({ createdAt: -1 })
  );

  res.status(200).json({
    success: true,
    count: requests.length,
    requests: requests.map(formatRequest),
  });
});

export const getDonationHistory = asyncHandler(async (req, res) => {
  const requests = await populateRequest(
    BloodRequest.find({ donorId: req.user._id, status: 'accepted' }).sort({ updatedAt: -1 })
  );

  res.status(200).json({
    success: true,
    count: requests.length,
    donations: requests.map(formatRequest),
  });
});

export const getRequestStats = asyncHandler(async (req, res) => {
  const { role } = req.user;

  if (role === 'donor') {
    const donorFilter = { donorId: req.user._id };
    const [totalRequestsReceived, pendingRequests, acceptedRequests, rejectedRequests] =
      await Promise.all([
        BloodRequest.countDocuments(donorFilter),
        BloodRequest.countDocuments({ ...donorFilter, status: 'pending' }),
        BloodRequest.countDocuments({ ...donorFilter, status: 'accepted' }),
        BloodRequest.countDocuments({ ...donorFilter, status: 'rejected' }),
      ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalRequestsReceived,
        pendingRequests,
        acceptedRequests,
        rejectedRequests,
      },
    });
  }

  if (role === 'user' || role === 'hospital') {
    const requesterFilter = { requesterId: req.user._id };
    const [totalSent, pendingRequests, acceptedRequests, rejectedRequests, emergencyRequests] =
      await Promise.all([
        BloodRequest.countDocuments(requesterFilter),
        BloodRequest.countDocuments({ ...requesterFilter, status: 'pending' }),
        BloodRequest.countDocuments({ ...requesterFilter, status: 'accepted' }),
        BloodRequest.countDocuments({ ...requesterFilter, status: 'rejected' }),
        BloodRequest.countDocuments({ ...requesterFilter, emergency: true }),
      ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalSent,
        pendingRequests,
        acceptedRequests,
        rejectedRequests,
        emergencyRequests,
        activeRequests: pendingRequests + acceptedRequests,
      },
    });
  }

  throw new AppError('Stats not available for this role', 403);
});

export const getEmergencyRequests = asyncHandler(async (req, res) => {
  const requests = await populateRequest(
    BloodRequest.find({ requesterId: req.user._id, emergency: true }).sort({ createdAt: -1 })
  );

  res.status(200).json({
    success: true,
    count: requests.length,
    requests: requests.map(formatRequest),
  });
});

export const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    throw new AppError('Status must be accepted or rejected', 400);
  }

  const bloodRequest = await BloodRequest.findById(req.params.id);

  if (!bloodRequest) {
    throw new AppError('Request not found', 404);
  }

  if (!bloodRequest.donorId.equals(req.user._id)) {
    throw new AppError('Only the donor can update this request', 403);
  }

  if (bloodRequest.status !== 'pending') {
    throw new AppError(`Request has already been ${bloodRequest.status}`, 400);
  }

  bloodRequest.status = status;
  await bloodRequest.save();

  const populated = await populateRequest(BloodRequest.findById(bloodRequest._id));
  const formatted = formatRequest(populated);

  emitRequestResponse(bloodRequest.requesterId.toString(), {
    requestId: formatted._id,
    status: formatted.status,
    request: formatted,
    donorName: formatted.donor?.name,
    bloodGroup: formatted.bloodGroup,
  });

  emitToAdmins('admin_update', {
    action: 'request_status_changed',
    request: formatted,
    timestamp: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: `Request ${status}`,
    request: formatted,
  });
});
export const completeRequest = asyncHandler(async (req, res) => {
  const bloodRequest = await BloodRequest.findById(req.params.id)
    .populate('requesterId')
    .populate('donorId');

  if (!bloodRequest) {
    throw new AppError('Request not found', 404);
  }

  if (!bloodRequest.donorId._id.equals(req.user._id)) {
    throw new AppError('Only the donor can complete this request', 403);
  }

  if (bloodRequest.status !== 'accepted') {
    throw new AppError('Only accepted requests can be completed', 400);
  }

  if (bloodRequest.completed) {
    throw new AppError('Request already completed', 400);
  }

  // ✅ mark completed
  bloodRequest.completed = true;
  bloodRequest.completedAt = new Date();

  await bloodRequest.save();

  // 🏥 HOSPITAL DONOR DATABASE UPDATE (FIXED VERSION)
  const hospitalId =
    bloodRequest.requesterId.role === 'hospital'
      ? bloodRequest.requesterId._id
      : null;

  if (hospitalId) {
    const donor = bloodRequest.donorId;

    const existing = await HospitalDonor.findOne({
      hospitalId,
      donorId: donor._id,
    });

    if (existing) {
      existing.totalDonations += 1;
      existing.lastDonationDate = new Date();

      // ✅ update snapshot info (IMPORTANT FIX)
      existing.name = donor.name;
      existing.phoneNumber = donor.phoneNumber;
      existing.email = donor.email;
      existing.city = donor.city;

      await existing.save();
    } else {
      await HospitalDonor.create({
        hospitalId,
        donorId: donor._id,

        // ✅ snapshot data for emergency contact
        name: donor.name,
        phoneNumber: donor.phoneNumber,
        email: donor.email,

        bloodGroup: bloodRequest.bloodGroup,
        city: donor.city,

        totalDonations: 1,
        lastDonationDate: new Date(),
      });
    }
  }

  // return updated request
  const updated = await BloodRequest.findById(req.params.id)
    .populate('requesterId', requesterFields)
    .populate('donorId', donorFields);

  const formatted = formatRequest(updated);

  res.status(200).json({
    success: true,
    message: 'Donation marked as completed',
    request: formatted,
  });
});