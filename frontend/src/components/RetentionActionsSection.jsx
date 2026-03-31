import React from 'react'
import { Rocket, PhoneCall, Gift, ShieldCheck, HeadphonesIcon } from 'lucide-react'

export default function RetentionActionsSection({ customer, result }) {
  if (!customer || !result) return null

  const actions = []


  if (result.risk_level === 'High') {
    actions.push({
      title: 'Immediate Retention Outreach',
      description: 'Assign to a senior retention specialist for a personalized check-in call within 24 hours.',
      priority: 'High',
      icon: PhoneCall,
      color: '#ef4444'
    })
  }


  if (customer.Contract === 'Month-to-month') {
    actions.push({
      title: 'Offer Annual Contract Discount',
      description: 'Incentivize long-term commitment by offering a 10-15% discount for switching to an annual plan.',
      priority: 'High',
      icon: Gift,
      color: '#8b5cf6'
    })
  }


  if (customer.MonthlyCharges > 70) {
    actions.push({
      title: 'Review Pricing & Options',
      description: 'Proactively review their usage. If overpaying, downgrade plan or offer a loyalty loyalty discount to increase satisfaction.',
      priority: 'Medium',
      icon: Rocket,
      color: '#f59e0b'
    })
  }

  if (customer.TechSupport === 'No' || customer.OnlineSecurity === 'No') {
    actions.push({
      title: 'Bundle Value-Add Services',
      description: 'Offer a free 3-month trial of Tech Support and Online Security to increase the perceived stickiness of the service.',
      priority: 'Medium',
      icon: ShieldCheck,
      color: '#3b82f6'
    })
  }


  if (customer.tenure < 12) {
    actions.push({
      title: 'Personalized Onboarding Check-in',
      description: 'Send a "How are we doing?" survey and offer a dedicated onboarding wrap-up session to ensure they are fully set up.',
      priority: 'Low',
      icon: HeadphonesIcon,
      color: '#10b981'
    })
  }

  if (actions.length === 0) {
    actions.push({
      title: 'Maintain Regular Engagement',
      description: 'Continue sending regular newsletter updates and feature announcements to keep brand awareness high.',
      priority: 'Low',
      icon: Rocket,
      color: '#10b981'
    })
  }

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Rocket size={20} color="var(--accent-blue)" />
        Recommended Retention Actions
      </h2>
      
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {actions.slice(0, 4).map((action, idx) => {
          const Icon = action.icon
          return (
            <div key={idx} style={{
              background: 'var(--bg-secondary)', 
              borderRadius: '12px',
              border: `1px solid ${action.color}30`,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }} className="hover:-translate-y-1 hover:shadow-lg">
              
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: action.color }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ background: `${action.color}15`, padding: '10px', borderRadius: '10px', color: action.color }}>
                  <Icon size={22} />
                </div>
                <div style={{ 
                  fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
                  background: action.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : action.priority === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: action.priority === 'High' ? '#ef4444' : action.priority === 'Medium' ? '#f59e0b' : '#10b981',
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  {action.priority} Priority
                </div>
              </div>
              
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {action.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1 }}>
                {action.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
