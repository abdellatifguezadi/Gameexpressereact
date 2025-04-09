import React from 'react'
import { useAuth } from '../context/AuthContext'

function AdminDashboard() {
  const { user, hasRole } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de Bord Administrateur</h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Informations de l'utilisateur</h2>
            <p className="text-gray-600">Nom: {user?.name}</p>
            <p className="text-gray-600">Email: {user?.email}</p>
            <p className="text-gray-600">Rôles: {user?.roles?.join(', ') || 'Aucun rôle'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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