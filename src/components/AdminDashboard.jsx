import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../context/DashboardContext'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const { user, hasRole } = useAuth()
  const { dashboardData, loading, error, fetchDashboardData } = useDashboard()
  const navigate = useNavigate()
  
  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 border-b-purple-500 border-opacity-50 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-xl max-w-lg w-full mx-4">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">Erreur</h2>
            <p className="text-red-600">{error}</p>
          </div>
          <button 
            onClick={() => fetchDashboardData()} 
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Tableau de Bord Administrateur
              </h1>
              <p className="text-gray-500 mt-1">Bienvenue, {user?.name}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user?.email}</p>
                  <p className="text-sm text-gray-500">{user?.roles?.join(', ') || 'Aucun rôle'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Produits</p>
                  <h3 className="text-3xl font-bold text-blue-600 mt-2">{dashboardData.total_products}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Catégories</p>
                  <h3 className="text-3xl font-bold text-green-600 mt-2">{dashboardData.total_categories}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Utilisateurs</p>
                  <h3 className="text-3xl font-bold text-purple-600 mt-2">{dashboardData.total_users}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Rupture de Stock</p>
                  <h3 className="text-3xl font-bold text-red-600 mt-2">{dashboardData.out_of_stock_products}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Products */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Derniers Produits</h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                Voir tout
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-gray-600 font-semibold">ID</th>
                    <th className="py-4 px-6 text-left text-gray-600 font-semibold">Nom</th>
                    <th className="py-4 px-6 text-left text-gray-600 font-semibold">Prix</th>
                    <th className="py-4 px-6 text-left text-gray-600 font-semibold">Stock</th>
                    <th className="py-4 px-6 text-left text-gray-600 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dashboardData.latest_products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-gray-700">{product.id}</td>
                      <td className="py-4 px-6 text-gray-700">{product.name}</td>
                      <td className="py-4 px-6 text-gray-700">${product.price}</td>
                      <td className="py-4 px-6 text-gray-700">{product.stock}</td>
                      <td className="py-4 px-6">
                        <span 
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            product.status === 'available' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.status === 'available' ? 'Disponible' : 'Rupture de stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role-based Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {hasRole('super_admin') && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">Super Admin</h3>
                    <p className="text-blue-600">Accès complet au système</p>
                  </div>
                </div>
              </div>
            )}

            {hasRole('user_manager') && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Gestion des Utilisateurs</h3>
                    <p className="text-green-600">Gérer les utilisateurs et leurs rôles</p>
                  </div>
                </div>
              </div>
            )}

            {hasRole('product_manager') && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-800">Gestion des Produits</h3>
                    <p className="text-purple-600">Gérer les produits et les catégories</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 