// src/api/citizenApi.js
import { apiFetch } from './client';

export const apiGetServices = () => apiFetch('/services');

export const apiGetServiceById = (id) => apiFetch(`/services/${id}`);

export const apiGetMyApplications = (page = 1, limit = 50) =>
  apiFetch(`/applications/my?page=${page}&limit=${limit}`);

export const apiSubmitApplication = (data) => {
  const body = data instanceof FormData ? data : JSON.stringify(data);
  return apiFetch('/applications', {
    method: 'POST',
    body,
  });
};

export const apiTrackApplication = (refCode) =>
  apiFetch(`/applications/track/${refCode}`);

export const apiGetMyGrievances = () => apiFetch('/grievances/my');

export const apiRaiseGrievance = (data) => {
  const body = data instanceof FormData ? data : JSON.stringify(data);
  return apiFetch('/grievances', {
    method: 'POST',
    body,
  });
};
