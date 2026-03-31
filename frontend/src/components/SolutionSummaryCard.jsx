import React from 'react'
import { Shield, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

export default function SolutionSummaryCard({ result }) {
  if (!result) return null

  const isChurn = result.churn
  const prob = Math.round(result.probability * 100)
  
  const riskColor = 
    result.risk_level === 'High' ? 'var(--accent-orange)' :
    result.risk_level === 'Medium' ? '#f59e0b' : '#10b981'

  const statusColor = isChurn ? 'var(--accent-orange)' : '#10b981'
  const StatusIcon = isChurn ? AlertCircle : CheckCircle

  return (
    <div className="glass-card mb-6" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-50px', right: '-50px',
        width: '150px', height: '150px', borderRadius: '50%',
        background: `radial-gradient(circle, ${riskColor} 0%, transparent 70%)`,
        opacity: 0.1, zIndex: 0
      }} />

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
        <TrendingUp size={20} color="var(--accent-blue)" />
        Prediction Overview
      </h2>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', position: 'relative', zIndex: 1 }}>
        
        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Predicted Outcome
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <StatusIcon size={24} color={statusColor} />
            <span style={{ fontSize: '20px', fontWeight: 800, color: statusColor }}>
              {isChurn ? 'Likely to Churn' : 'Expected to Stay'}
            </span>
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Churn Probability
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{prob}%</span>
            <div style={{ flex: 1, height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${prob}%`,
                background: `linear-gradient(90deg, ${isChurn ? 'var(--accent-orange)' : '#10b981'}, ${riskColor})`,
                borderRadius: '4px',
                transition: 'width 1s ease-in-out'
              }} />
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Assessed Risk Level
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={24} color={riskColor} />
            <span style={{ fontSize: '20px', fontWeight: 800, color: riskColor }}>
              {result.risk_level} Risk
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
