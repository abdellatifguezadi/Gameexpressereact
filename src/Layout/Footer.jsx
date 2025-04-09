import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Footer() {
  const { user, hasRole } = useAuth()

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-xl font-semibold mb-4">À propos</h3>
            <p className="text-gray-400">
              GameExpress est votre plateforme de gestion de jeux vidéo. Gérez vos produits,
              vos utilisateurs et vos transactions en toute simplicité.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              {user ? (
                hasRole('super_admin') || hasRole('user_manager') || hasRole('product_manager') ? (
                  <li>
                    <Link to="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
                      Admin Dashboard
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                      Dashboard
                    </Link>
                  </li>
                )
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                      Connexion
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-gray-400 hover:text-white transition-colors">
                      Inscription
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: contact@gameexpress.com</li>
              <li>Téléphone: +212 6XX-XXXXXX</li>
              <li>Adresse: Casablanca, Maroc</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} GameExpress. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer