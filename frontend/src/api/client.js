import axios from 'axios'

export const BACKEND = 'http://localhost:8000'

const api = axios.create({
  baseURL: `${BACKEND}/api`,
})

// Attach token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Token ${token}`
  return cfg
})

// On 401, clear token and redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
