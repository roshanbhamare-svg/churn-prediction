import React from 'react'
import { Info, HelpCircle } from 'lucide-react'

export default function ChurnReasonsSection({ customer }) {
  if (!customer) return null

  const reasons = []

  if (customer.tenure < 12) {
    reasons.push({
      title: 'Low Tenure',
      description: 'Customer is relatively new and may not have formed strong loyalty to the service.',
      severity: 'Medium'
    })
  }

  if (customer.Contract === 'Month-to-month') {
    reasons.push({
      title: 'Short-term Contract',
      description: 'Month-to-month flexibility significantly increases the risk of unexpected cancellation.',
      severity: 'High'
    })
  }

  if (customer.MonthlyCharges > 70) {
    reasons.push({
      title: 'High Monthly Charges',
      description: 'Above average monthly billing may lead to cost-related dissatisfaction.',
      severity: 'Medium'
    })
  }

  if (customer.TechSupport === 'No') {
    reasons.push({
      title: 'No Tech Support',
      description: 'Lack of dedicated technical support may frustrate the customer during service issues.',
      severity: 'Medium'
    })
  }

  if (customer.OnlineSecurity === 'No') {
    reasons.push({
      title: 'Missing Online Security',
      description: 'Absence of security add-ons may reduce the perceived holistic value of the service.',
      severity: 'Low'
    })
  }

  if (customer.PaymentMethod === 'Electronic check') {
    reasons.push({
      title: 'Payment Method',
      description: 'Electronic check users historically show higher churn volatility compared to automatic billing.',
      severity: 'Low'
    })
  }

  if (reasons.length === 0) {
    reasons.push({
      title: 'Stable Profile',
      description: 'No major risk factors detected in the core billing and service configuration.',
      severity: 'Low'
    })
  }

  return (
    <div className="glass-card mb-6" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <HelpCircle size={20} color="var(--accent-orange)" />
        Why This Customer May Churn
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reasons.slice(0, 5).map((reason, idx) => (
          <div key={idx} style={{
            display: 'flex', gap: '16px', padding: '16px', 
            background: 'var(--bg-secondary)', borderRadius: '10px',
            border: '1px solid var(--border-card)',
            alignItems: 'flex-start',
            transition: 'transform 0.2s, boxShadow 0.2s',
            cursor: 'default'
          }} className="hover:-translate-y-1 hover:shadow-lg">
            <div style={{
              background: 
                reason.severity === 'High' ? 'rgba(239, 68, 68, 0.1)' : 
                reason.severity === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(56, 189, 248, 0.1)',
              padding: '10px', borderRadius: '8px',
              color: 
                reason.severity === 'High' ? '#ef4444' : 
                reason.severity === 'Medium' ? '#f59e0b' : '#38bdf8'
            }}>
              <Info size={20} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                  {reason.title}
                </div>
                {reason.severity === 'High' && (
                  <span style={{ fontSize: '10px', fontWeight: 800, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '4px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                    Key Driver
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {reason.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
