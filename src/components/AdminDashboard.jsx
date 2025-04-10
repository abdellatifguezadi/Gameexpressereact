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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchDashboardData()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord Administrateur</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Informations de l'utilisateur</h2>
            <p className="text-gray-600">Nom: {user?.name}</p>
            <p className="text-gray-600">Email: {user?.email}</p>
            <p className="text-gray-600">Rôles: {user?.roles?.join(', ') || 'Aucun rôle'}</p>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Produits</h3>
              <p className="text-3xl font-bold text-blue-600">{dashboardData.total_products}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Catégories</h3>
              <p className="text-3xl font-bold text-green-600">{dashboardData.total_categories}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Utilisateurs</h3>
              <p className="text-3xl font-bold text-purple-600">{dashboardData.total_users}</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Rupture de Stock</h3>
              <p className="text-3xl font-bold text-red-600">{dashboardData.out_of_stock_products}</p>
            </div>
          </div>

          {/* Latest Products */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Derniers Produits</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-gray-600 font-semibold">ID</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-semibold">Nom</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-semibold">Prix</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-semibold">Stock</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.latest_products.map(product => (
                    <tr key={product.id} className="border-t">
                      <td className="py-3 px-4 text-gray-700">{product.id}</td>
                      <td className="py-3 px-4 text-gray-700">{product.name}</td>
                      <td className="py-3 px-4 text-gray-700">${product.price}</td>
                      <td className="py-3 px-4 text-gray-700">{product.stock}</td>
                      <td className="py-3 px-4">
                        <span 
                          className={`py-1 px-2 rounded-full text-xs ${
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {/* Section Super Admin */}
            {hasRole('super_admin') && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Super Admin</h3>
                <p className="text-blue-600">Accès complet au système</p>
              </div>
            )}

            {/* Section User Manager */}
            {hasRole('user_manager') && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Gestion des Utilisateurs</h3>
                <p className="text-green-600">Gérer les utilisateurs et leurs rôles</p>
              </div>
            )}

            {/* Section Product Manager */}
            {hasRole('product_manager') && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Gestion des Produits</h3>
                <p className="text-purple-600">Gérer les produits et les catégories</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 