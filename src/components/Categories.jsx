import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axiosInstance from '../utils/axios'
import { useNavigate } from 'react-router-dom'

function Categories() {
  const { user, hasRole } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useTestData, setUseTestData] = useState(false)
  const navigate = useNavigate()

  // Données de test pour afficher quelque chose si l'API échoue
  const testCategories = [
    { id: 1, name: 'Action', slug: 'action', created_at: new Date().toISOString() },
    { id: 2, name: 'Sport', slug: 'sport', created_at: new Date().toISOString() },
    { id: 3, name: 'Aventure', slug: 'aventure', created_at: new Date().toISOString() }
  ]

  useEffect(() => {
    // Vérifier si l'utilisateur est un super admin
    if (!user) {
      navigate('/login')
      return
    }
    
    if (!hasRole('super_admin')) {
      navigate('/403')
      return
    }

    if (!useTestData) {
      fetchCategories()
    } else {
      setCategories(testCategories)
      setLoading(false)
    }
  }, [user, useTestData])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      
      // Vérifier si le token est disponible
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Vous n\'êtes pas connecté. Veuillez vous connecter.')
        setLoading(false)
        return
      }
      
      // Configuration avec token explicite
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
      
      const response = await axiosInstance.get('/admin/categories', config)
      
      // Si la réponse contient un message d'erreur même avec un status 200
      if (response.data && response.data.message === "Please login") {
        setError('Session expirée. Veuillez vous reconnecter.')
        setLoading(false)
        return
      }
      
      setCategories(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching categories:', err)
      
      // Erreur d'authentification
      if (err.response && err.response.status === 401) {
        setError('Session expirée ou non autorisé. Veuillez vous reconnecter.')
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la récupération des catégories')
      }
      setLoading(false)
    }
  }

  const handleUseTestData = () => {
    setUseTestData(true)
  }

  const handleUseApi = () => {
    setUseTestData(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des catégories...</p>
        </div>
      </div>
    )
  }

  if (error && !useTestData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button 
              onClick={() => fetchCategories()} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Réessayer
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Retour au tableau de bord
            </button>
            <button 
              onClick={handleUseTestData} 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Utiliser données de test
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Catégories</h1>
            <div className="flex items-center space-x-3">
              {useTestData && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Mode démo (données fictives)
                </span>
              )}
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Retour au Tableau de Bord
              </button>
            </div>
          </div>

          {useTestData && (
            <div className="mb-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex justify-between items-center">
                <p className="text-yellow-800">
                  Vous utilisez des données de test. Ces données ne sont pas réelles et ne sont pas sauvegardées.
                </p>
                <button
                  onClick={handleUseApi}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Utiliser l'API
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">ID</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Nom</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Slug</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Date de création</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(categories) && categories.length > 0 ? (
                  categories.map(category => (
                    <tr key={category.id} className="border-t">
                      <td className="py-3 px-4 text-gray-700">{category.id}</td>
                      <td className="py-3 px-4 text-gray-700">{category.name}</td>
                      <td className="py-3 px-4 text-gray-700">{category.slug}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <button className="bg-yellow-500 text-white px-2 py-1 rounded text-xs mr-2">
                          Modifier
                        </button>
                        <button className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                      Aucune catégorie trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Categories 