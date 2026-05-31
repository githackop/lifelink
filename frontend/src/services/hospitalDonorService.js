import api from './api';

export const getHospitalDonors = () =>
  api.get('/hospital-donors');

export const addManualHospitalDonor = (data) =>
  api.post('/hospital-donors/manual', data);