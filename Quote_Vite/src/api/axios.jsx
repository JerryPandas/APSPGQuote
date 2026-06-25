import axios from 'axios'
import { store } from '../store'
import { setCredentials, logout } from '../store'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = store.getState().auth.refreshToken
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', null, {
            params: { refresh_token: refreshToken },
          })
          store.dispatch(setCredentials({
            access_token: res.data.access_token,
            refresh_token: res.data.refresh_token,
          }))
          originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`
          return api(originalRequest)
        } catch {
          store.dispatch(logout())
          window.location.href = '/login'
        }
      } else {
        store.dispatch(logout())
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

export const authApi = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  refresh: (refreshToken) =>
    api.post('/auth/refresh', null, { params: { refresh_token: refreshToken } }),
  me: () => api.get('/auth/me'),
}

export const quoteApi = {
  search: (params) => api.post('/quotes/search', params),
  recent: (page = 1, pageSize = 20) =>
    api.get('/quotes/recent', { params: { page, page_size: pageSize } }),
}

export const dashboardApi = {
  stats: (params) => api.get('/dashboard/stats', { params }),
  productTypes: () => api.get('/dashboard/product-types'),
}

export const lookupApi = {
  productTypes: () => api.get('/lookup/product-types'),
  typeDesigns: (id) => api.get(`/lookup/type-designs/${id}`),
  ratings: () => api.get('/lookup/ratings'),
  designCodes: () => api.get('/lookup/design-codes'),
  pipeSizes: () => api.get('/lookup/pipe-sizes'),
  bodyMaterials: () => api.get('/lookup/body-materials'),
}

export const exportApi = {
  csv: () => api.get('/export/csv', { responseType: 'blob' }),
}

export const adminApi = {
  users: () => api.get('/admin/users'),
  updateRole: (userId, role) => api.put(`/admin/users/${userId}/role`, null, { params: { role } }),
  toggleStatus: (userId, isActive) => api.put(`/admin/users/${userId}/status`, null, { params: { is_active: isActive } }),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, null, { params: data }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
}

export const createApi = {
  record: (data) => api.post('/create/record', data),
  getRecord: (ref) => api.get(`/create/record/${ref}`),
  product: (ref, data) => api.post(`/create/record/${ref}/product`, data),
  updateProduct: (id, data) => api.put(`/create/product/${id}`, data),
  deleteProduct: (id) => api.delete(`/create/product/${id}`),
  listProducts: (ref) => api.get(`/create/record/${ref}/products`),
  child: (productId, data) => api.post(`/create/product/${productId}/child`, data),
  updateChild: (id, data) => api.put(`/create/child/${id}`, data),
  deleteChild: (id) => api.delete(`/create/child/${id}`),
  listChildren: (productId) => api.get(`/create/product/${productId}/children`),
}
