import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login, error: authError } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const userData = await login(formData.email, formData.password)

      if (userData) {
        if (userData.roles?.includes('super_admin') || 
            userData.roles?.includes('user_manager') || 
            userData.roles?.includes('product_manager') ||
            userData.roles?.some(role => 
              role.name === 'super_admin' || 
              role.name === 'user_manager' || 
              role.name === 'product_manager'
            )) {
          navigate('/admin/dashboard')
        } else {
          navigate('/dashboard')
        }
      }
      console.log(userData)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
    
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black'>
      <div className='bg-gray-800 p-8 rounded-lg shadow-lg w-96 border border-blue-500'>
        <h2 className='text-2xl font-bold mb-6 text-center text-blue-400'>Login</h2>
        {(error || authError) && (
          <div className='text-red-500 mb-4 text-center'>{error || authError}</div>
        )}
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <label className='block text-sm font-medium text-blue-300'>Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className='mt-1 block w-full px-3 py-2 border border-blue-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white'
              placeholder='Enter your email'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-blue-300'>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className='mt-1 block w-full px-3 py-2 border border-blue-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white'
              placeholder='Enter your password'
              required
            />
          </div>
          <button 
            type="submit"
            className='w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 px-4 rounded-md hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105'
          >
            Login
          </button>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous n'avez pas de compte ?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login