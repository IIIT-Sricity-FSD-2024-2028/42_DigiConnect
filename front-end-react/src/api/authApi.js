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

export const apiGetUsers = () => apiFetch('/users');
export const apiGetUserById = (id) => apiFetch(`/users/${id}`);
export const apiUpdateProfile = (id, data) =>
  apiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
