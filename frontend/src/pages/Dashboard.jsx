import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import { 
  Users, TrendingDown, Award, Activity, RefreshCw, 
  CheckCircle, XCircle, AlertTriangle
} from 'lucide-react'
import {
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const MODEL_LABELS = {
  logistic_regression: 'Logistic Regression',
  random_forest: 'Random Forest',
  xgboost: 'XGBoost',
}

const MODEL_COLORS = {
  logistic_regression: '#4f8ef7',
  random_forest: '#a855f7',
  xgboost: '#14b8a6',
}

export default function Dashboard() {
  const [modelsData, setModelsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [training, setTraining] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getModels()
      setModelsData(data)
    } catch (e) {
      setError('Backend not reachable. Make sure the FastAPI server is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleRetrain = async () => {
    setTraining(true)
    try {
      await api.triggerTraining()
      setTimeout(loadData, 5000)
    } finally {
      setTimeout(() => setTraining(false), 5500)
    }
  }

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen error={error} onRetry={loadData} />

  const { metrics, dataset_stats } = modelsData
  const churnRate = dataset_stats?.churn_rate ?? 0
  const nSamples = dataset_stats?.n_samples ?? 0



  const bestModel = Object.entries(metrics).sort((a, b) => b[1].auc_roc - a[1].auc_roc)[0]
  const bestModelName = bestModel ? (MODEL_LABELS[bestModel[0]] || bestModel[0]) : '-'
  const bestModelAuc = bestModel ? (bestModel[1].auc_roc * 100).toFixed(1) : '-'


  const pieData = [
    { name: 'Churned', value: Math.round(churnRate * nSamples), fill: '#ef4444' },
    { name: 'Retained', value: Math.round((1 - churnRate) * nSamples), fill: '#22c55e' },
  ]

  return (
    <div>

      <div className="flex items-center justify-between mb-8 fade-in-up">
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
            Dashboard <span className="gradient-text">Overview</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Model performance & churn analytics at a glance
          </p>
        </div>
        <button className="btn-secondary-custom flex items-center gap-2" onClick={handleRetrain} disabled={training}>
          <RefreshCw size={14} className={training ? 'loading-spin' : ''} />
          {training ? 'Training…' : 'Retrain Models'}
        </button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 fade-in-up-2">
        <StatCard
          icon={<Users size={20} />}
          label="Dataset Size"
          value={nSamples.toLocaleString()}
          color="var(--accent-blue)"
          sub="training samples"
        />
        <StatCard
          icon={<TrendingDown size={20} />}
          label="Churn Rate"
          value={`${(churnRate * 100).toFixed(1)}%`}
          color="var(--accent-red)"
          sub="dataset average"
        />
        <StatCard
          icon={<Award size={20} />}
          label="Best Model"
          value={bestModelName}
          color="var(--accent-purple)"
          sub={`AUC-ROC: ${bestModelAuc}%`}
          small
        />
        <StatCard
          icon={<Activity size={20} />}
          label="Models Trained"
          value="3"
          color="var(--accent-teal)"
          sub="LR · RF · XGB"
        />
      </div>


      <div className="fade-in-up-3" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(79, 142, 247, 0.3), transparent)', margin: '24px 0 24px 0' }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 fade-in-up-4">

        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
            Churn Distribution
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Dataset breakdown</div>
          <div style={{ flex: 1, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  dataKey="value" paddingAngle={4}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 10, color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card lg:col-span-2 overflow-x-auto" style={{ padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 16 }}>
            Detailed Metrics Comparison
          </div>
          <div className="table-responsive">
            <table className="table table-custom mb-0 w-full">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Accuracy</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1 Score</th>
                  <th>AUC-ROC</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics).map(([key, m]) => (
                  <tr key={key}>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: MODEL_COLORS[key], display: 'inline-block',
                        }} />
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {MODEL_LABELS[key] || key}
                        </span>
                      </span>
                    </td>
                    <td><MetricPct val={m.accuracy} /></td>
                    <td><MetricPct val={m.precision} /></td>
                    <td><MetricPct val={m.recall} /></td>
                    <td><MetricPct val={m.f1} /></td>
                    <td>
                      <span style={{ color: m.auc_roc >= 0.8 ? 'var(--accent-green)' : m.auc_roc >= 0.7 ? 'var(--accent-orange)' : 'var(--accent-red)', fontWeight: 700 }}>
                        {(m.auc_roc * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricPct({ val }) {
  return <span style={{ color: 'var(--text-primary)' }}>{(val * 100).toFixed(1)}%</span>
}

function StatCard({ icon, label, value, color, sub, small }) {
  return (
    <div className="metric-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: `${color}22`,
          border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: small ? 16 : 28, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '3px solid var(--border-card)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%' }} className="loading-spin" />
      <div style={{ color: 'var(--text-secondary)' }}>Loading dashboard…</div>
    </div>
  )
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh', flexDirection: 'column', gap: 16, textAlign: 'center', padding: 32 }}>
      <AlertTriangle size={48} color="var(--accent-orange)" />
      <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>Connection Error</div>
      <div style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>{error}</div>
      <button className="btn-primary-custom" onClick={onRetry}>Retry</button>
    </div>
  )
}
