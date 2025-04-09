import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function login() {
  const navigate = useNavigate()
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
      const response = await axios.post('http://127.0.0.1:8000/api/v1/admin/login', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log('Login successful:', response.data)
      localStorage.setItem('token', response.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black'>
      <div className='bg-gray-800 p-8 rounded-lg shadow-lg w-96 border border-blue-500'>
        <h2 className='text-2xl font-bold mb-6 text-center text-blue-400'>Login</h2>
        {error && <div className='text-red-500 mb-4 text-center'>{error}</div>}
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
      </div>
    </div>
  )
}

export default login