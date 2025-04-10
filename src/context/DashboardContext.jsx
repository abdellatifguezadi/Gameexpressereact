import React, { createContext, useState, useContext, useEffect } from 'react'
import axiosInstance from '../utils/axios'
import { useAuth } from './AuthContext'
import { useNavigate } from 'react-router-dom'

const DashboardContext = createContext()

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState({
    total_products: 0,
    total_categories: 0,
    total_users: 0,
    out_of_stock_products: 0,
    latest_products: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, hasRole, logout } = useAuth()
  const navigate = useNavigate()

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!user || !hasRole('super_admin') && !hasRole('user_manager') && !hasRole('product_manager')) {
        setLoading(false)
        return
      }

      // Vérifier si le token est disponible
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Vous n\'êtes pas connecté. Veuillez vous connecter.')
        setLoading(false)
        return
      }

      const response = await axiosInstance.get('/admin/dashboard')

      // Vérifier si la réponse contient un message d'erreur malgré un status 200
      if (response.data && (
        response.data.message === "Please login" || 
        response.data.message === "Unauthenticated" ||
        response.data.message === "Token has expired"
      )) {
        setError('Session expirée. Veuillez vous reconnecter.')
        // Déconnecter l'utilisateur car le token n'est plus valide
        logout()
        setLoading(false)
        return
      }

      setDashboardData(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Dashboard data fetch error:', err)
      
      // Gérer les erreurs d'authentification
      if (err.response && (err.response.status === 401 || err.response.status === 419)) {
        setError('Session expirée ou non autorisé. Veuillez vous reconnecter.')
        // Déconnecter l'utilisateur car le token n'est plus valide
        logout()
      } else {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data')
      }
      setLoading(false)
    }
  }

  // Fetch dashboard data when the user loads or changes
  useEffect(() => {
    if (user && (hasRole('super_admin') || hasRole('user_manager') || hasRole('product_manager'))) {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [user])

  return (
    <DashboardContext.Provider value={{
      dashboardData,
      loading,
      error,
      fetchDashboardData
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
} 