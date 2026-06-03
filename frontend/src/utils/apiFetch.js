/**
 * apiFetch — Centralized API fetch utility
 *
 * Features:
 * - Automatically attaches Authorization header from sessionStorage
 * - On 401 (token expired/invalid): clears session and redirects to /signin
 * - On network error: throws a user-friendly error message
 * - Supports all HTTP methods with JSON body
 *
 * Usage:
 *   import apiFetch from '../utils/apiFetch'
 *   const data = await apiFetch('/api/students')
 *   const data = await apiFetch('/api/students', { method: 'POST', body: { name: 'Ali' } })
 */

import API_BASE_URL from '../config/api';

const apiFetch = async (endpoint, options = {}) => {
  const token = sessionStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // If body is an object, serialize it
  const body = options.body && typeof options.body === 'object'
    ? JSON.stringify(options.body)
    : options.body;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body,
    });
  } catch (networkError) {
    // Network failure (no internet, server down, etc.)
    throw new Error('Network error. Please check your connection and try again.');
  }

  // Global 401 handler: token expired or invalid
  if (response.status === 401) {
    localStorage.clear();
    sessionStorage.clear();
    // Use window.location so it works outside React component trees too
    window.location.href = '/signin';
    return;
  }

  // For non-JSON responses (e.g. file downloads), return raw response
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return response;
  }

  const data = await response.json();
  return data;
};

export default apiFetch;
