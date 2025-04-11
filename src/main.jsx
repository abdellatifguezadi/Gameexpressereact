import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
// import './index.css'
import { AuthProvider } from './context/AuthContext'
import { DashboardProvider } from './context/DashboardContext'
import { CategoryProvider } from './context/CategoryContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DashboardProvider>
          <CategoryProvider>
            <App />
          </CategoryProvider>
        </DashboardProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)