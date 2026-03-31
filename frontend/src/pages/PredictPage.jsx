import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Zap, User, Wifi, CreditCard, Shield, AlertTriangle, CheckCircle, XCircle, Lightbulb, TrendingUp } from 'lucide-react'

const MODELS = [
  { key: 'logistic_regression', label: 'Logistic Regression' },
  { key: 'random_forest', label: 'Random Forest' },
  { key: 'xgboost', label: 'XGBoost' },
]

const DEFAULTS = {
  customer_id: '',
  customer_name: '',
  gender: 'Male',
  SeniorCitizen: 0,
  Partner: 'Yes',
  Dependents: 'No',
  tenure: 12,
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'Fiber optic',
  OnlineSecurity: 'No',
  OnlineBackup: 'Yes',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'Yes',
  StreamingMovies: 'Yes',
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
  MonthlyCharges: 65.5,
  TotalCharges: 786.0,
  model_name: 'logistic_regression',
}

export default function PredictPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload = {
        ...form,
        tenure: Number(form.tenure),
        MonthlyCharges: Number(form.MonthlyCharges),
        TotalCharges: Number(form.TotalCharges),
        SeniorCitizen: Number(form.SeniorCitizen),
      }
      const res = await api.predict(payload)
      setResult(res)

     
      localStorage.setItem('last_prediction', JSON.stringify({
        result: res,
        customer: form
      }))
    } catch (e) {
      setError(e?.detail || 'Prediction failed. Make sure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  const prob = result ? Math.round(result.probability * 100) : 0
  const circumference = 2 * Math.PI * 58

  return (
    <div>
      <div className="mb-8 fade-in-up">
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
          Predict <span className="gradient-text">Customer Churn</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          Enter customer details to predict churn probability with your chosen ML model
        </p>
      </div>

      <div className="grid gap-6 fade-in-up-2" style={{ gridTemplateColumns: '1fr 360px' }}>
        
        <form onSubmit={handleSubmit}>
          
          <div className="glass-card mb-5" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 14 }}>
              Select Model
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {MODELS.map(m => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => set('model_name', m.key)}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid',
                    borderColor: form.model_name === m.key ? 'var(--accent-blue)' : 'var(--border-card)',
                    background: form.model_name === m.key ? 'rgba(79,142,247,0.12)' : 'var(--bg-card)',
                    color: form.model_name === m.key ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

   
           <FormSection title="Personal Information" icon={<User size={15} />}>
            <div className="row g-3">
              <TextField label="Customer ID" value={form.customer_id} onChange={v => set('customer_id', v)} placeholder="E.g. CUST-1234" />
              <TextField label="Customer Name" value={form.customer_name} onChange={v => set('customer_name', v)} placeholder="E.g. John Doe" />
              <SelectField label="Gender" value={form.gender} onChange={v => set('gender', v)} options={['Male', 'Female']} />
              <SelectField label="Senior Citizen" value={form.SeniorCitizen} onChange={v => set('SeniorCitizen', Number(v))} options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
              <SelectField label="Partner" value={form.Partner} onChange={v => set('Partner', v)} options={['Yes', 'No']} />
              <SelectField label="Dependents" value={form.Dependents} onChange={v => set('Dependents', v)} options={['Yes', 'No']} />
            </div>
          </FormSection>

      
          <FormSection title="Services" icon={<Wifi size={15} />}>
            <div className="row g-3">
              <SelectField label="Phone Service" value={form.PhoneService} onChange={v => set('PhoneService', v)} options={['Yes', 'No']} />
              <SelectField label="Multiple Lines" value={form.MultipleLines} onChange={v => set('MultipleLines', v)} options={['Yes', 'No', 'No phone service']} />
              <SelectField label="Internet Service" value={form.InternetService} onChange={v => set('InternetService', v)} options={['DSL', 'Fiber optic', 'No']} />
              <SelectField label="Online Security" value={form.OnlineSecurity} onChange={v => set('OnlineSecurity', v)} options={['Yes', 'No', 'No internet service']} />
              <SelectField label="Online Backup" value={form.OnlineBackup} onChange={v => set('OnlineBackup', v)} options={['Yes', 'No', 'No internet service']} />
              <SelectField label="Device Protection" value={form.DeviceProtection} onChange={v => set('DeviceProtection', v)} options={['Yes', 'No', 'No internet service']} />
              <SelectField label="Tech Support" value={form.TechSupport} onChange={v => set('TechSupport', v)} options={['Yes', 'No', 'No internet service']} />
              <SelectField label="Streaming TV" value={form.StreamingTV} onChange={v => set('StreamingTV', v)} options={['Yes', 'No', 'No internet service']} />
              <SelectField label="Streaming Movies" value={form.StreamingMovies} onChange={v => set('StreamingMovies', v)} options={['Yes', 'No', 'No internet service']} />
            </div>
          </FormSection>

         
          <FormSection title="Account & Billing" icon={<CreditCard size={15} />}>
            <div className="row g-3">
              <NumberField label="Tenure (months)" value={form.tenure} onChange={v => set('tenure', v)} min={0} max={72} />
              <NumberField label="Monthly Charges ($)" value={form.MonthlyCharges} onChange={v => set('MonthlyCharges', v)} min={0} step={0.01} />
              <NumberField label="Total Charges ($)" value={form.TotalCharges} onChange={v => set('TotalCharges', v)} min={0} step={0.01} />
              <SelectField label="Contract" value={form.Contract} onChange={v => set('Contract', v)} options={['Month-to-month', 'One year', 'Two year']} />
              <SelectField label="Paperless Billing" value={form.PaperlessBilling} onChange={v => set('PaperlessBilling', v)} options={['Yes', 'No']} />
              <SelectField label="Payment Method" value={form.PaymentMethod} onChange={v => set('PaymentMethod', v)} options={['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)']} />
            </div>
          </FormSection>

          <button type="submit" className="btn-primary-custom w-full flex items-center justify-center gap-2 mt-4"
            disabled={loading} style={{ width: '100%' }}>
            <Zap size={16} />
            {loading ? 'Analyzing…' : 'Predict Churn'}
          </button>
        </form>

      
        <div>
          <div className="glass-card" style={{ padding: 28, position: 'sticky', top: 24 }}>
            {!result && !error && !loading && (
              <EmptyState />
            )}
            {loading && <LoadingState />}
            {error && (
              <div style={{ textAlign: 'center' }}>
                <AlertTriangle size={40} color="var(--accent-orange)" />
                <div style={{ color: 'var(--accent-orange)', fontWeight: 600, marginTop: 12, fontSize: 14 }}>Error</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 6 }}>{error}</div>
              </div>
            )}
            {result && (
              <ResultPanel result={result} prob={prob} circumference={circumference} form={form} navigate={navigate} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultPanel({ result, prob, circumference, form, navigate }) {
  const offset = circumference - (prob / 100) * circumference
  const isChurn = result.churn
  const riskClass = result.risk_level === 'High' ? 'risk-high' : result.risk_level === 'Medium' ? 'risk-medium' : 'risk-low'
  const gaugeColor = prob > 60 ? '#ef4444' : prob > 35 ? '#f97316' : '#22c55e'

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 20 }}>
        Prediction Result
      </div>

   
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle cx={70} cy={70} r={58} fill="none" stroke="rgba(79,142,247,0.1)" strokeWidth={12} />
          <circle
            cx={70} cy={70} r={58} fill="none"
            stroke={gaugeColor}
            strokeWidth={12}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
          <text x={70} y={66} textAnchor="middle" fill="white" fontSize={22} fontWeight={800} fontFamily="Outfit">
            {prob}%
          </text>
          <text x={70} y={84} textAnchor="middle" fill="#64748b" fontSize={10} fontFamily="Inter">
            Churn Probability
          </text>
        </svg>
      </div>

    
      <div style={{ marginBottom: 16 }}>
        {isChurn ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <XCircle size={20} color="#ef4444" />
            <span style={{ fontWeight: 700, fontSize: 18, color: '#ef4444' }}>Will Churn</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <CheckCircle size={20} color="#22c55e" />
            <span style={{ fontWeight: 700, fontSize: 18, color: '#22c55e' }}>Will Stay</span>
          </div>
        )}
      </div>

   
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <span className={`badge-pill ${riskClass}`}>
          <Shield size={11} />
          {result.risk_level} Risk
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
        <DetailRow label="Model Used" value={result.model_used.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} />
        <DetailRow label="Probability" value={`${(result.probability * 100).toFixed(2)}%`} />
        <DetailRow label="Decision" value={result.churn ? 'Churn' : 'No Churn'} />
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px 0 0 0', borderTop: '1px solid var(--border-card)' }}>
        <button
          onClick={() => navigate('/solution', { state: { result, customer: form } })}
          style={{ width: '100%', padding: '12px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(79,142,247,0.3)', transition: 'transform 0.2s, boxShadow 0.2s' }}
          className="hover:-translate-y-1 hover:shadow-lg"
        >
          <Lightbulb size={18} />
          View Solution & Recommended Actions
        </button>

        <button
          onClick={() => navigate('/revenue', { state: { result, customer: form } })}
          style={{ width: '100%', padding: '12px', background: 'var(--accent-blue)', color: 'var(--text-primary)', border: '1px solid var(--border-card)', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'transform 0.2s, background 0.2s' }}
          className="hover:bg-slate-50 hover:-translate-y-1"
        >
          <TrendingUp size={18} className="text-blue-500" />
          View Revenue Impact Analysis
        </button>
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-card)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
      <Zap size={44} style={{ marginBottom: 12, opacity: 0.3 }} />
      <div style={{ fontWeight: 600, fontSize: 14 }}>No prediction yet</div>
      <div style={{ fontSize: 12, marginTop: 4 }}>Fill in the form and click Predict</div>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <div style={{ width: 44, height: 44, border: '3px solid var(--border-card)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', margin: '0 auto 12px' }} className="loading-spin" />
      <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Analyzing customer…</div>
    </div>
  )
}

function FormSection({ title, icon, children }) {
  return (
    <div className="glass-card mb-4" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: 'var(--accent-blue)' }}>
        {icon}
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="col-md-6 col-6">
      <label className="form-label">{label}</label>
      <select
        className="form-select form-input-custom"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o =>
          typeof o === 'object'
            ? <option key={o.value} value={o.value}>{o.label}</option>
            : <option key={o} value={o}>{o}</option>
        )}
      </select>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div className="col-md-6 col-6">
      <label className="form-label">{label}</label>
      <input
        type="text"
        className="form-control form-input-custom"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function NumberField({ label, value, onChange, min, max, step }) {
  return (
    <div className="col-md-6 col-6">
      <label className="form-label">{label}</label>
      <input
        type="number"
        className="form-control form-input-custom"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min}
        max={max}
        step={step ?? 1}
      />
    </div>
  )
}
