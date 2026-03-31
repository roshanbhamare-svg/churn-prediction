const API_BASE = 'http://localhost:8000'

export const api = {
  health: () => fetch(`${API_BASE}/health`).then(r => r.json()),
  getModels: () => fetch(`${API_BASE}/models`).then(r => r.json()),
  getRevenueAtRisk: () => fetch(`${API_BASE}/revenue-at-risk`).then(r => r.json()),
  predict: (payload) =>
    fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => {
      if (!r.ok) return r.json().then(e => Promise.reject(e))
      return r.json()
    }),
  triggerTraining: () =>
    fetch(`${API_BASE}/train`, { method: 'POST' }).then(r => r.json()),
  getPredictions: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return fetch(`${API_BASE}/predictions?${query}`).then(r => r.json())
  },
  getPredictionDetail: (id) => fetch(`${API_BASE}/predictions/${id}`).then(r => r.json()),
  deletePrediction: (id) => fetch(`${API_BASE}/predictions/${id}`, { method: 'DELETE' }).then(r => r.json()),
}
