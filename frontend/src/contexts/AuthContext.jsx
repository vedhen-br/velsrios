import React, { useState, useEffect, createContext, useContext } from 'react'
import axios from 'axios'
import { useSocket } from '../hooks/useSocket'
import { getApiUrl } from '../utils/env'

const AuthContext = createContext(null)
const API_URL = getApiUrl()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const { socket, isConnected } = useSocket(user?.id)

  // Initialize token from localStorage after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token')
      setToken(storedToken)
    }
  }, [])

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  async function fetchUser() {
    try {
      const res = await axios.get(`${API_URL}/me`)
      setUser(res.data)
    } catch (e) {
      logout()
    }
    setLoading(false)
  }

  async function login(email, password) {
    const res = await axios.post(`${API_URL}/login`, { email, password })
    const { token, user } = res.data
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setToken(token)
    setUser(user)
  }

  function logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    
    delete axios.defaults.headers.common['Authorization']
    if (socket) {
      socket.disconnect()
    }
    setToken(null)
    setUser(null)
  }

  function updateUser(updatedData) {
    setUser(prev => ({ ...prev, ...updatedData }))
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      loading, 
      updateUser,
      socket,
      isConnected 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
