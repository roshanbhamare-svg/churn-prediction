import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import SolutionSummaryCard from '../components/SolutionSummaryCard'
import ChurnReasonsSection from '../components/ChurnReasonsSection'
import RetentionActionsSection from '../components/RetentionActionsSection'

export default function SolutionPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [data, setData] = React.useState(null)
  
  React.useEffect(() => {
    if (location.state && location.state.result) {
      setData(location.state)
    } else {
      const saved = localStorage.getItem('last_prediction')
      if (saved) {
        try {
          setData(JSON.parse(saved))
        } catch (e) {
          console.error("Failed to parse saved prediction", e)
        }
      }
    }
  }, [location])

  if (!data || !data.result || !data.customer) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>No Prediction Data Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Please generate a prediction first.</p>
        <Link to="/predict" className="btn-primary-custom" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
           Go to Predict Page
        </Link>
      </div>
    )
  }

  const { result, customer } = data

  return (
    <div className="fade-in-up" style={{ paddingBottom: '40px' }}>
      
 
      <div className="mb-8" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, marginBottom: '12px', padding: 0 }} className="hover:text-primary">
            <ArrowLeft size={16} /> Back to Prediction
          </button>
          
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lightbulb className="gradient-text" size={28} />
            Customer Retention <span className="gradient-text">Solution</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            AI-generated churn analysis and recommended retention strategy
          </p>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        
        <div className="fade-in-up-2">
           <SolutionSummaryCard result={result} />
        </div>

        <div className="grid gap-6 fade-in-up-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <div>
            <ChurnReasonsSection customer={customer} />
          </div>
          <div>
             <RetentionActionsSection customer={customer} result={result} />
          </div>
        </div>

      </div>
      
    </div>
  )
}
