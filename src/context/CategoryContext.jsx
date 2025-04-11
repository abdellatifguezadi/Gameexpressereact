import React, { createContext, useState, useContext, useEffect } from 'react'
import axiosInstance from '../utils/axios'
import { useAuth } from './AuthContext'
import { useNavigate } from 'react-router-dom'

const CategoryContext = createContext()

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, hasRole, logout } = useAuth()
  const navigate = useNavigate()

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!hasRole('super_admin')) {
        setError('Accès refusé: Rôle super_admin requis')
        setLoading(false)
        return
      }

      const response = await axiosInstance.get('/admin/categories')
      setCategories(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching categories:', err)
      
      if (err.response && (err.response.status === 401 || err.response.status === 419)) {
        setError('Session expirée. Veuillez vous reconnecter.')
        logout()
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la récupération des catégories')
      }
      setLoading(false)
    }
  }

  const createCategory = async (categoryData) => {
    try {
      setLoading(true)
      setError(null)
      
      if (!hasRole('super_admin')) {
        setError('Accès refusé: Rôle super_admin requis')
        setLoading(false)
        return null
      }

      const response = await axiosInstance.post('/admin/categories', categoryData)
      
      // Mettre à jour la liste des catégories
      await fetchCategories()
      
      return response.data
    } catch (err) {
      console.error('Error creating category:', err)
      
      if (err.response && (err.response.status === 401 || err.response.status === 419)) {
        setError('Session expirée. Veuillez vous reconnecter.')
        logout()
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la création de la catégorie')
      }
      setLoading(false)
      return null
    }
  }

  const updateCategory = async (id, categoryData) => {
    try {
      setLoading(true)
      setError(null)
      
      if (!hasRole('super_admin')) {
        setError('Accès refusé: Rôle super_admin requis')
        setLoading(false)
        return null
      }

      const response = await axiosInstance.put(`/admin/categories/${id}`, categoryData)
      
      // Mettre à jour la liste des catégories
      await fetchCategories()
      
      return response.data
    } catch (err) {
      console.error(`Error updating category ${id}:`, err)
      
      if (err.response && (err.response.status === 401 || err.response.status === 419)) {
        setError('Session expirée. Veuillez vous reconnecter.')
        logout()
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour de la catégorie')
      }
      setLoading(false)
      return null
    }
  }

  const deleteCategory = async (id) => {
    try {
      setLoading(true)
      setError(null)
      
      if (!hasRole('super_admin')) {
        setError('Accès refusé: Rôle super_admin requis')
        setLoading(false)
        return false
      }

      await axiosInstance.delete(`/admin/categories/${id}`)
      
      // Mettre à jour la liste des catégories
      await fetchCategories()
      
      return true
    } catch (err) {
      console.error(`Error deleting category ${id}:`, err)
      
      if (err.response && (err.response.status === 401 || err.response.status === 419)) {
        setError('Session expirée. Veuillez vous reconnecter.')
        logout()
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la suppression de la catégorie')
      }
      setLoading(false)
      return false
    }
  }

  useEffect(() => {
    if (user && hasRole('super_admin')) {
      fetchCategories()
    } else {
      setLoading(false)
    }
  }, [user])

  return (
    <CategoryContext.Provider value={{
      categories,
      loading,
      error,
      fetchCategories,
      createCategory,
      updateCategory,
      deleteCategory
    }}>
      {children}
    </CategoryContext.Provider>
  )
}

export const useCategory = () => {
  const context = useContext(CategoryContext)
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider')
  }
  return context
} 