const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, options = {}, retry = true) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = localStorage.getItem('accessToken')
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.')
  }

  if (response.status === 401 && retry && path !== '/auth/login' && path !== '/auth/refresh') {
    try {
      const refreshed = await request('/auth/refresh', { method: 'POST', body: '{}' }, false)
      if (refreshed.access_token) {
        localStorage.setItem('accessToken', refreshed.access_token)
        return request(path, options, false)
      }
    } catch {
      localStorage.removeItem('accessToken')
    }
  }

  const text = await response.text()
  let data = {}
  try { data = text ? JSON.parse(text) : {} } catch { data = { message: text } }

  if (!response.ok) {
    const error = new Error(data.message || 'La solicitud no pudo completarse.')
    error.status = response.status
    error.code = data.error
    throw error
  }

  return data
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export { API_URL }
