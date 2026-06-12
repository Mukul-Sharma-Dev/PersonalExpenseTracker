import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('expense_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('expense_token') || null
  })

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('expense_user')
    localStorage.removeItem('expense_token')
    navigate('/login', { replace: true })
  }, [navigate])

  useEffect(() => {
    if (token && !user) {
      api.get('/auth/me')
        .then((res) => {
          const userData = res.data?.user || res.data
          setUser(userData)
          localStorage.setItem('expense_user', JSON.stringify(userData))
        })
        .catch(() => {
          logout()
        })
    }
  }, [token, user, logout])

  const login = useCallback((userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('expense_user', JSON.stringify(userData))
    localStorage.setItem('expense_token', authToken)
  }, [])

  const updateUser = useCallback((updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields }
      localStorage.setItem('expense_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const isAuthenticated = Boolean(token)

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
