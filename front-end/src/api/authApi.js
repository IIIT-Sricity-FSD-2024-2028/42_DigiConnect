// src/api/authApi.js
import { apiFetch } from './client';

export const apiLogin = (email, password) =>
  apiFetch('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const apiRegister = (userData) =>
  apiFetch('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const apiRequestOtp = (phone, aadhaar) =>
  apiFetch('/users/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, aadhaar }),
  });

export const apiGetUsers = () => apiFetch('/users');
export const apiGetUserById = (id) => apiFetch(`/users/${id}`);
export const apiUpdateProfile = (id, data) =>
  apiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const apiChangePassword = (id, currentPassword, newPassword) =>
  apiFetch(`/users/${id}/password`, {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
