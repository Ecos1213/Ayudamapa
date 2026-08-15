import { apiClient } from './apiClient'

export async function login(email, password) {
  const data = await apiClient.post('/auth/login', { email, password })
  localStorage.setItem('accessToken', data.access_token)
  return data.user
}

export async function register(email, password, displayName) {
  return apiClient.post('/auth/signup', { email, password, displayName })
}

export async function logout() {
  try { await apiClient.post('/auth/logout', {}) } finally { localStorage.removeItem('accessToken') }
}

export async function getCurrentUser() {
  if (!localStorage.getItem('accessToken')) return null
  const data = await apiClient.get('/api/profile')
  return data.user
}
