import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('srms_user')
    if (stored) {
      const parsed = JSON.parse(stored)
      setUser(parsed)
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('srms_user', JSON.stringify(userData))
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('srms_user')
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
