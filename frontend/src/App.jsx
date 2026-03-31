import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import PredictPage from './pages/PredictPage'
import SolutionPage from './pages/SolutionPage'
import RevenueAtRisk from './pages/RevenueAtRisk'
import PredictionHistory from './pages/PredictionHistory'
import './index.css'

function App() {
  return (
    <Router>
      <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar />
        <div className="main-content bg-grid flex-1 flex flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/predict" element={<PredictPage />} />
              <Route path="/solution" element={<SolutionPage />} />
              <Route path="/revenue" element={<RevenueAtRisk />} />
              <Route path="/history" element={<PredictionHistory />} />
            </Routes>
          </div>
          
          <footer style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: '1px solid var(--border-card)',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 500,
          }}>
            Powered by FastAPI & React. © {new Date().getFullYear()} ChurnIQ ML.
          </footer>
        </div>
      </div>
    </Router>
  )
}

export default App
