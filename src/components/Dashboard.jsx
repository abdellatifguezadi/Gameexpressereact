import React from 'react'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de Bord</h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Bienvenue, {user?.name}</h2>
            <p className="text-gray-600">Email: {user?.email}</p>
            <p className="text-gray-600">Rôles: {user?.roles?.join(', ') || 'Aucun rôle'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Votre Compte</h3>
              <p className="text-blue-600">Gérez vos informations personnelles</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Paramètres</h3>
              <p className="text-green-600">Configurez vos préférences</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 