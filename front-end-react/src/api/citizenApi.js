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

export const apiGetStates = () => apiFetch('/central/states').catch(() => null);

export const apiGetGeographyTree = (stateId = 'state_ap') =>
  apiFetch(`/geography/tree?stateId=${stateId}`);

export const apiGetNodeChildren = (nodeId, stateId) =>
  apiFetch(`/geography/nodes/${nodeId}/children${stateId ? `?stateId=${stateId}` : ''}`);

export const apiWithdrawApplication = (id) =>
  apiFetch(`/applications/${id}`, { method: 'DELETE' });

export const apiRespondToQuery = (id, response, files = []) => {
  if (files && files.length > 0) {
    const fd = new FormData();
    fd.append('response', response || '');
    files.forEach((f) => fd.append('documents', f));
    return apiFetch(`/applications/${id}/query-response`, {
      method: 'PATCH',
      body: fd,
    });
  }
  return apiFetch(`/applications/${id}/query-response`, {
    method: 'PATCH',
    body: JSON.stringify({ response: response || '' }),
  });
};

export const apiSimulatePayment = (serviceId, citizenId, amount) =>
  apiFetch('/applications/simulate-payment', {
    method: 'POST',
    body: JSON.stringify({ serviceId, citizenId, amount }),
  });


