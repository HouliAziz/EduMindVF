import axios from 'axios'

// ─── Axios instance ──────────────────────────────────────────────────────────
// baseURL matches the Vite proxy: /api → http://localhost:8000
const api = axios.create({
  baseURL: '/api/v1',
})

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('edumind_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 → clear session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('edumind_token')
      localStorage.removeItem('edumind_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/login', { email, password }),
  me: () => api.get('/auth/me'),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.post('/auth/profile', data),
  updatePassword: (data) => api.post('/auth/password', data),
}

// ─── Utilisateurs ─────────────────────────────────────────────────────────────
export const utilisateursAPI = {
  list: () => api.get('/utilisateurs'),
  get: (id) => api.get(`/utilisateurs/${id}`),
  create: (data) => api.post('/utilisateurs', data),
  update: (id, data) => api.put(`/utilisateurs/${id}`, data),
  delete: (id) => api.delete(`/utilisateurs/${id}`),
}

// ─── Formations ──────────────────────────────────────────────────────────────
export const formationsAPI = {
  list: () => api.get('/formations'),
  get: (id) => api.get(`/formations/${id}`),
  create: (data) => api.post('/formations', data),
  update: (id, data) => api.put(`/formations/${id}`, data),
  delete: (id) => api.delete(`/formations/${id}`),
  archive: (id) => api.patch(`/formations/${id}/archive`, {}),
  unarchive: (id) => api.patch(`/formations/${id}/unarchive`, {}),
  approve: (id) => api.patch(`/formations/${id}/approve`, {}),
  reject: (id) => api.patch(`/formations/${id}/reject`, {}),
  reconsider: (id) => api.patch(`/formations/${id}/reconsider`, {}),
}

// ─── Sessions ────────────────────────────────────────────────────────────────
export const sessionsAPI = {
  list: () => api.get('/sessions'),
  get: (id) => api.get(`/sessions/${id}`),
  dashboardActive: () => api.get('/sessions/dashboard/active'),
  dashboardKpis: () => api.get('/sessions/dashboard/kpis'),
  create: (data) => api.post('/sessions', data),
  update: (id, data) => api.put(`/sessions/${id}`, data),
  delete: (id) => api.delete(`/sessions/${id}`),
}

// ─── Participants ─────────────────────────────────────────────────────────────
export const participantsAPI = {
  eligible: (typeFormation) => api.get(`/participants/eligible?typeFormation=${typeFormation}`),
  byFormation: (id) => api.get(`/participants/formation/${id}`),
  planning: (weekStart) => api.get(`/participant/planning?weekStart=${weekStart}`),
  mesFormations: () => api.get('/participant/formations'),
  documents: () => api.get('/participant/documents'),
}

// ─── Inscriptions ─────────────────────────────────────────────────────────────
export const inscriptionsAPI = {
  ajouter: (data) => api.post('/inscriptions/ajouter', data),
  supprimer: (id) => api.delete(`/inscriptions/${id}`),
  bySession: (sessionId) => api.get(`/presences/session/${sessionId}`),
  batchPresence: (data) => api.post('/presences/batch', data),
}

// ─── Formateur ───────────────────────────────────────────────────────────────
export const formateurAPI = {
  planning: (params) => api.get('/formateur/planning', { params }),
  sessions: () => api.get('/formateur/sessions'),
  apprenants: () => api.get('/formateur/apprenants'),
  updateNote: (data) => api.patch('/formateur/apprenants/note', data),
  ressources: () => api.get('/formateur/ressources'),
  deleteRessource: (id) => api.delete(`/formateur/ressources/${id}`),
}

// ─── Demandes ─────────────────────────────────────────────────────────────────
// Fixed: now uses the configured `api` instance (with /api/v1 base + JWT header)
export const demandesAPI = {
  list: () => api.get('/demandes'),
  create: (data) => api.post('/demandes', data),
  updateStatus: (id, statut) => api.patch(`/demandes/${id}/status`, { statut }),
}

// ─── Finance ─────────────────────────────────────────────────────────────────
export const financeAPI = {
  dashboard: (params) => api.get('/finance/dashboard', { params }),
  sessionDashboard: (sessionId) => api.get(`/finance/session/${sessionId}/dashboard`),
  saisirDepense: (data) => api.post('/finance/depense', data),
  exportCsv: (params) => api.get('/finance/export/csv', { params, responseType: 'blob' }),
  exportJson: (params) => api.get('/finance/export/json', { params }),
}

// ─── Documents ───────────────────────────────────────────────────────────────
export const documentsAPI = {
  upload: (formData) => api.post('/documents', formData),
  byEntity: (entiteType, entiteId) => api.get(`/documents/entity/${entiteType}/${entiteId}`),
  delete: (id) => api.delete(`/documents/${id}`),
}

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
}

// ─── Responsable Dashboard ──────────────────────────────────────────────────
export const responsableAPI = {
  dashboard: () => api.get('/responsable/dashboard'),
}

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationsAPI = {
  historique: (userId) => api.get(`/notifications/historique/${userId}`),
}

// ─── IA ──────────────────────────────────────────────────────────────────────
export const iaAPI = {
  statut: () => api.get('/ia/statut'),
  chat: (data) => api.post('/ia/chat', data),
}

export default api
