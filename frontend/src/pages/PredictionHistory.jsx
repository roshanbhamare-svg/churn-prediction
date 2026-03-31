import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../services/api'
import { 
  Search, Filter, RotateCcw, Eye, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, 
  CheckCircle2, XCircle, Info, Calendar,
  User, Database, BarChart3, Clock
} from 'lucide-react'

const MODEL_LABELS = {
  logistic_regression: 'Logistic Regression',
  random_forest: 'Random Forest',
  xgboost: 'XGBoost',
}

const RISK_COLORS = {
  'Low': 'bg-success',
  'Medium': 'bg-warning text-dark',
  'High': 'bg-danger',
  'Critical': 'bg-dark'
}

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  

  const [filters, setFilters] = useState({
    customer_id: '',
    customer_name: '',
    model_used: '',
    risk_level: '',
    prediction: '',
    sort_by: 'created_at',
    order: 'desc',
    page: 1,
    page_size: 10
  })


  const [selectedId, setSelectedId] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  

  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getPredictions(filters)
      setPredictions(data.items || [])
      setTotal(data.total || 0)
    } catch (e) {
      setError('Failed to load prediction history from server.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }))
  }

  const resetFilters = () => {
    setFilters({
      customer_id: '',
      customer_name: '',
      model_used: '',
      risk_level: '',
      prediction: '',
      sort_by: 'created_at',
      order: 'desc',
      page: 1,
      page_size: 10
    })
  }

  const handleViewDetails = async (id) => {
    setSelectedId(id)
    setShowModal(true)
    setDetailLoading(true)
    try {
      const data = await api.getPredictionDetail(id)
      setDetailData(data)
    } catch (e) {
      console.error(e)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.deletePrediction(deleteId)
      setDeleteId(null)
      fetchHistory()
    } catch (e) {
      alert('Failed to delete record.')
    } finally {
      setDeleting(false)
    }
  }


  const stats = {
    total: total,
    highRisk: predictions.filter(p => p.risk_level === 'High' || p.risk_level === 'Critical').length,
    avgProb: predictions.length > 0 ? (predictions.reduce((acc, p) => acc + p.churn_probability, 0) / predictions.length * 100).toFixed(1) : 0,
    latestDate: predictions.length > 0 ? new Date(predictions[0].created_at).toLocaleDateString() : 'N/A'
  }

  if (error) return <ErrorScreen error={error} onRetry={fetchHistory} />

  return (
    <div className="container-fluid p-0">
  
      <div className="mb-4">
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
          Prediction <span className="gradient-text">History</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          View and manage all customer churn predictions stored in the database
        </p>
      </div>

   
      <div className="row g-4 mb-5">
        <StatCard 
          icon={<Database size={20} />} 
          label="Total Predictions" 
          value={stats.total} 
          color="var(--accent-blue)" 
        />
        <StatCard 
          icon={<AlertCircle size={20} />} 
          label="High Risk Customers" 
          value={stats.highRisk} 
          color="var(--accent-red)" 
        />
        <StatCard 
          icon={<BarChart3 size={20} />} 
          label="Avg. Churn Prob." 
          value={`${stats.avgProb}%`} 
          color="var(--accent-purple)" 
        />
        <StatCard 
          icon={<Clock size={20} />} 
          label="Latest Prediction" 
          value={stats.latestDate} 
          color="var(--accent-teal)" 
        />
      </div>

     
      <div className="glass-card mb-4" style={{ padding: '20px' }}>
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label small fw-bold text-muted">Search Customer</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--border-card)' }}>
                <Search size={14} className="text-muted" />
              </span>
              <input 
                type="text" 
                name="customer_name"
                className="form-control border-start-0" 
                placeholder="Name or ID..." 
                style={{ borderColor: 'var(--border-card)', background: 'transparent', color: 'var(--text-primary)' }}
                value={filters.customer_name}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-bold text-muted">Model Used</label>
            <select 
              name="model_used"
              className="form-select" 
              style={{ borderColor: 'var(--border-card)', background: 'transparent', color: 'var(--text-primary)' }}
              value={filters.model_used}
              onChange={handleFilterChange}
            >
              <option value="">All Models</option>
              {Object.entries(MODEL_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-bold text-muted">Risk Level</label>
            <select 
              name="risk_level"
              className="form-select" 
              style={{ borderColor: 'var(--border-card)', background: 'transparent', color: 'var(--text-primary)' }}
              value={filters.risk_level}
              onChange={handleFilterChange}
            >
              <option value="">All Risks</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-bold text-muted">Sort By</label>
            <select 
              name="sort_by"
              className="form-select" 
              style={{ borderColor: 'var(--border-card)', background: 'transparent', color: 'var(--text-primary)' }}
              value={filters.sort_by}
              onChange={handleFilterChange}
            >
              <option value="created_at">Latest</option>
              <option value="churn_probability">Highest Prob.</option>
              <option value="monthly_charges">Monthly Charges</option>
            </select>
          </div>
          <div className="col-md-3 d-flex gap-2">
            <button className="btn btn-outline-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-2" onClick={resetFilters}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

     
      <div className="glass-card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th className="ps-4">Customer</th>
                <th>Model</th>
                <th>Result</th>
                <th>Probability</th>
                <th>Risk Level</th>
                <th>Charges</th>
                <th>Date</th>
                <th className="pe-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    <span className="text-muted">Fetching records...</span>
                  </td>
                </tr>
              ) : predictions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="text-muted mb-2">No prediction history found.</div>
                    <div className="small">Try making a churn prediction first.</div>
                  </td>
                </tr>
              ) : (
                predictions.map((p) => (
                  <tr key={p.id}>
                    <td className="ps-4">
                      <div className="fw-bold text-primary">{p.customer_name || 'Unnamed Customer'}</div>
                      <div className="small text-muted">{p.customer_id || `ID: ${p.id}`}</div>
                    </td>
                    <td>
                      <span className="small text-secondary">{MODEL_LABELS[p.model_used] || p.model_used}</span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${p.prediction === 'Churn' ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success'}`} style={{ fontSize: '11px', padding: '6px 12px' }}>
                        {p.prediction}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="flex-grow-1" style={{ width: '60px' }}>
                          <div className="progress" style={{ height: '4px' }}>
                            <div 
                              className={`progress-bar ${p.churn_probability > 0.7 ? 'bg-danger' : p.churn_probability > 0.4 ? 'bg-warning' : 'bg-success'}`}
                              style={{ width: `${p.churn_probability * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="small fw-bold">{(p.churn_probability * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${RISK_COLORS[p.risk_level] || 'bg-secondary'}`} style={{ fontSize: '10px' }}>
                        {p.risk_level}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold">${p.monthly_charges.toFixed(2)}</span>
                    </td>
                    <td className="small text-muted">
                      {new Date(p.created_at).toLocaleDateString()}<br/>
                      {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="pe-4 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button 
                          className="btn btn-icon-custom" 
                          title="View Details"
                          onClick={() => handleViewDetails(p.id)}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn btn-icon-custom text-danger" 
                          title="Delete"
                          onClick={() => setDeleteId(p.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        
        {total > filters.page_size && (
          <div className="p-4 border-top border-card d-flex justify-content-between align-items-center">
            <div className="small text-muted">
              Showing {((filters.page - 1) * filters.page_size) + 1} to {Math.min(filters.page * filters.page_size, total)} of {total} records
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-secondary btn-sm" 
                disabled={filters.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm"
                disabled={filters.page * filters.page_size >= total}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

     
      {showModal && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="glass-card w-100" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="p-4 border-bottom border-card d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Prediction Details</h5>
              <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="p-4">
              {detailLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : detailData ? (
                <div className="row g-4">
                  
                  <div className="col-md-5">
                    <div className="p-3 bg-dark-soft rounded-3 mb-3 border border-card">
                      <div className="small text-muted text-uppercase fw-bold mb-3 ls-1">Record Info</div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-secondary small">Prediction ID</span>
                        <span className="fw-bold">#{detailData.id}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-secondary small">Model Used</span>
                        <span className="fw-bold">{MODEL_LABELS[detailData.model_used] || detailData.model_used}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-secondary small">Prediction</span>
                        <span className={`fw-bold ${detailData.prediction === 'Churn' ? 'text-danger' : 'text-success'}`}>{detailData.prediction}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-secondary small">Probability</span>
                        <span className="fw-bold">{(detailData.churn_probability * 100).toFixed(2)}%</span>
                      </div>
                    </div>

                    <div className="p-3 bg-dark-soft rounded-3 border border-card">
                      <div className="small text-muted text-uppercase fw-bold mb-3 ls-1">Customer Profile</div>
                      <div className="mb-3">
                        <div className="small text-muted">Name</div>
                        <div className="fw-bold">{detailData.customer_name || 'N/A'}</div>
                      </div>
                      <div className="mb-3">
                        <div className="small text-muted">Customer ID</div>
                        <div className="fw-bold">{detailData.customer_id || 'N/A'}</div>
                      </div>
                      <div className="mb-0">
                        <div className="small text-muted">Monthly Charges</div>
                        <div className="fw-bold text-success">${detailData.monthly_charges.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-7">
                    <div className="p-3 bg-dark-soft rounded-3 border border-card h-100">
                      <div className="small text-muted text-uppercase fw-bold mb-3 ls-1">Input Features</div>
                      <div className="row g-2">
                        {Object.entries(detailData.input_features).map(([key, value]) => (
                          <div key={key} className="col-6 mb-2">
                            <div className="small text-muted" style={{ fontSize: '10px' }}>{key}</div>
                            <div className="fw-semibold small">{String(value)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-danger">Failed to load details.</div>
              )}
            </div>
            <div className="p-4 border-top border-card text-end">
              <button className="btn btn-primary-custom px-4" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
          <div className="glass-card p-4 text-center" style={{ maxWidth: '400px' }}>
            <div className="mb-3 text-danger">
              <AlertCircle size={48} />
            </div>
            <h5 className="fw-bold mb-2">Delete Prediction?</h5>
            <p className="text-secondary mb-4 small">
              Are you sure you want to remove this prediction record? This action cannot be undone.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-outline-secondary px-4" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger px-4" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="col-md-3">
      <div className="metric-card h-100">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ 
            width: 40, height: 40, borderRadius: 10, background: `${color}22`, 
            border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color 
          }}>
            {icon}
          </div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  )
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh', flexDirection: 'column', gap: 16, textAlign: 'center', padding: 32 }}>
      <Info size={48} color="var(--accent-orange)" />
      <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>Data Unreachable</div>
      <div style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>{error}</div>
      <button className="btn-primary-custom" onClick={onRetry}>Retry</button>
    </div>
  )
}
