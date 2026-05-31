import api from './api';

export const getUserDashboard = () => api.get('/dashboard/user');

export const getDonorDashboard = () => api.get('/dashboard/donor');

export const getHospitalDashboard = () => api.get('/dashboard/hospital');

export const getAdminDashboard = () => api.get('/dashboard/admin');
