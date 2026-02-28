import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.get('/user/profile/')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token')
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password })
    const { token: t } = res.data
    localStorage.setItem('token', t)
    setToken(t)
    const profile = await api.get('/user/profile/')
    setUser(profile.data)
    return res.data
  }

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register/', { username, email, password })
    const { token: t } = res.data
    localStorage.setItem('token', t)
    setToken(t)
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    try { await api.post('/auth/logout/') } catch {}
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
