import api from './api';

export const updateAvailability = (availability) =>
  api.patch('/donor/availability', { availability });
