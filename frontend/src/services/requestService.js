import api from './api';

export const createRequest = (data) => api.post('/requests/create', data);

export const getReceivedRequests = () => api.get('/requests/received');

export const getSentRequests = () => api.get('/requests/sent');

export const getDonationHistory = () => api.get('/requests/history');

export const getRequestStats = () => api.get('/requests/stats');

export const getEmergencyRequests = () => api.get('/requests/emergency');

export const updateRequestStatus = (id, status) =>
  api.patch(`/requests/${id}/status`, { status });

export const completeRequest = (id) =>
  api.patch(`/requests/${id}/complete`);