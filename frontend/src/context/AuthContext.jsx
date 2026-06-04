import { createContext, useContext, useState } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('edumind_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await authAPI.login(email, password)
      localStorage.setItem('edumind_token', data.token)
      localStorage.setItem('edumind_user', JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('edumind_token')
    localStorage.removeItem('edumind_user')
    setUser(null)
  }

  const getRedirectPath = (u) => {
    const role = u?.role ?? u?.type ?? ''
    if (role === 'admin' || role === 'ADMIN') return '/admin/dashboard'
    if (role === 'responsable' || role === 'RESPONSABLE_FORMATION') return '/responsable/dashboard'
    if (role === 'formateur' || role === 'FORMATEUR') return '/formateur/planning'
    return '/participant/planning'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getRedirectPath }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
