import api from './api';

export const searchDonors = (params = {}) =>
  api.get('/donors/search', { params });

export const getAllDonors = () => api.get('/donors/all');
