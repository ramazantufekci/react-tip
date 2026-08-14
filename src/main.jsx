import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import { AuthProvider } from './context/AuthContext';
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // 🌟 Tailwind direktiflerini barındıran dosyanın import edildiğinden emin olun

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    
  </React.StrictMode>,
)
