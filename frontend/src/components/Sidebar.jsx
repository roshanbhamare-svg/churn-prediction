import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Zap, Activity, Brain, Lightbulb, DollarSign, History
} from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/predict', label: 'Predict Churn', icon: Zap },
  { to: '/solution', label: 'Retention Solution', icon: Lightbulb },
  { to: '/revenue', label: 'Revenue at Risk', icon: DollarSign },
  { to: '/history', label: 'Prediction History', icon: History },
]

export default function Sidebar() {
  return (
    <div className="sidebar">
      
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border-card)' }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--glow-blue)',
          }}>
            <Brain size={20} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              ChurnIQ
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>ML Prediction</div>
          </div>
        </div>
      </div>

      
      <nav style={{ padding: '16px 0', flex: 1 }}>
        <div style={{ padding: '0 12px 8px 20px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Navigation
        </div>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

    </div>
  )
}
