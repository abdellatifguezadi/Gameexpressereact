import React, { createContext, useState, useContext, useEffect } from 'react'
import axiosInstance from '../utils/axios'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/admin/login', {
        email,
        password
      }, {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (response.data && response.data.token) {
        const userData = {
          id: response.data.user?.id,
          name: response.data.user?.name,
          email: response.data.user?.email,
          roles: response.data.user?.roles || [],
          permissions: response.data.user?.permissions || []
        }

        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        setError(null)
        return userData
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      throw err
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axiosInstance.post('/admin/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        console.log('Logout successful')
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      navigate('/login')
      console.log('Logout successful from context')
    }
  }

  const register = async (name, email, password, password_confirmation) => {
    try {
      const response = await axiosInstance.post('/admin/register', {
        name,
        email,
        password,
        password_confirmation
      }, {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token)
        
        const userData = {
          id: response.data.user?.id,
          name: response.data.user?.name,
          email: response.data.user?.email,
          roles: response.data.user?.roles || [],
          permissions: response.data.user?.permissions || []
        }
        
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        
        // Configure axios instance with the new token
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        
        setError(null)
        return userData
      } else {
        throw new Error('Registration response missing token')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
      throw err
    }
  }

  // Add interceptor to set token for all requests
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    
    return () => {
      delete axiosInstance.defaults.headers.common['Authorization']
    }
  }, [])

  const isAdmin = () => {
    if (!user) return false
    return user.role === 'super_admin' || 
           user.role === 'user_manager' ||
           user.role === 'product_manager' ||
           user.roles?.includes('super_admin') ||
           user.roles?.includes('user_manager') ||
           user.roles?.includes('product_manager') ||
           user.roles?.some(role => 
             role.name === 'super_admin' || 
             role.name === 'user_manager' || 
             role.name === 'product_manager'
           )
  }

  const hasPermission = (permission) => {
    if (!user) return false
    return user.permissions?.includes(permission) ||
           user.permissions?.some(p => p.name === permission)
  }

  const hasRole = (role) => {
    if (!user) return false
    return user.role === role ||
           user.roles?.includes(role) ||
           user.roles?.some(r => r.name === role)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      register,
      isAdmin,
      hasPermission,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 