import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'

// Layouts
import AdminLayout from './components/layout/AdminLayout'
import ParticipantLayout from './components/layout/ParticipantLayout'
import FormateurLayout from './components/layout/FormateurLayout'
import ResponsableLayout from './components/layout/ResponsableLayout'

// Auth
import LoginPage from './pages/Login'

// Admin pages (reused by responsable)
import AdminDashboard from './pages/admin/AdminDashboard'
import Formations from './pages/admin/Formations'
import NouvelleFormation from './pages/admin/NouvelleFormation'
import Sessions from './pages/admin/Sessions'
import AnalyseIA from './pages/admin/AnalyseIA'
import Finances from './pages/admin/Finances'
import Utilisateurs from './pages/admin/Utilisateurs'
import Profile from './pages/admin/Profile'
import AdminNotifications from './pages/admin/Notifications'

// Participant
import ParticipantPlanning from './pages/participant/ParticipantPlanning'
import MesFormations from './pages/participant/MesFormations'
import Documents from './pages/participant/Documents'
import Attestations from './pages/participant/Attestations'
import Evaluation from './pages/participant/Evaluation'

// Formateur
import FormateurPlanning from './pages/formateur/FormateurPlanning'
import MesSessions from './pages/formateur/MesSessions'
import MesApprenants from './pages/formateur/MesApprenants'
import EvaluationsFormateur from './pages/formateur/EvaluationsFormateur'
import FormateurRessources from './pages/formateur/FormateurRessources'

// Responsable
import ResponsableDashboard from './pages/responsable/ResponsableDashboard'
import GestionDemandes from './pages/responsable/GestionDemandes'

import './index.css'

function RequireAuth({ children, allowedRoles }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userRole = user.role?.toUpperCase()

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />
  }

  return children
}

function ComingSoon({ name }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12, fontFamily: 'var(--font-display)' }}>
      <span style={{ fontSize: 48 }}>🚧</span>
      <h2 style={{ fontSize: 18, color: 'var(--gray-600)' }}>{name}</h2>
      <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>Page en cours de développement</p>
    </div>
  )
}

// ─── COMPOSANT ADAPTÉ ET MODIFIÉ POUR LA MODIFICATION ───────────────────
function ReadOnlyFormations() {
  const [view, setView] = useState('list')
  const [formationToEdit, setFormationToEdit] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const handleNew = () => {
    setFormationToEdit(null)
    setView('form')
  }

  const handleEdit = (formation) => {
    setFormationToEdit(formation)
    setView('form')
  }

  const handleBack = () => {
    setFormationToEdit(null)
    setView('list')
  }

  return (
    <>
      {toast && (
        <div className={`util-toast util-toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
      {view === 'form'
        ? <NouvelleFormation formationToEdit={formationToEdit} onBack={handleBack} onToast={setToast} />
        : <Formations onNew={handleNew} onEdit={handleEdit} onToast={setToast} />
      }
    </>
  )
}
// ─────────────────────────────────────────────────────────────────────────

// Participants view-only for responsable (no create button)
function ParticipantsReadOnly() {
  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>Tableau de bord › <span style={{ color: 'var(--orange)' }}>Participants</span></div>
          <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Liste des Participants</h1>
        </div>
      </div>
      <ComingSoon name="Liste Participants (lecture seule)" />
    </div>
  )
}

function FormateursReadOnly() {
  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>Tableau de bord › <span style={{ color: 'var(--orange)' }}>Formateurs</span></div>
          <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Liste des Formateurs</h1>
        </div>
      </div>
      <ComingSoon name="Liste Formateurs (lecture seule)" />
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ── Admin ── */}
      <Route path="/admin" element={<RequireAuth allowedRoles={['ADMIN']}><AdminLayout /></RequireAuth>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="formations" element={<ReadOnlyFormations />} />
        <Route path="demandes" element={<GestionDemandes />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="participants" element={<ComingSoon name="Participants" />} />
        <Route path="formateurs" element={<ComingSoon name="Formateurs" />} />
        <Route path="utilisateurs" element={<Utilisateurs />} />
        <Route path="finances" element={<Finances />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="ia" element={<AnalyseIA />} />
        <Route path="support" element={<ComingSoon name="Support" />} />
        <Route path="settings" element={<ComingSoon name="Paramètres" />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ── Participant ── */}
      <Route path="/participant" element={<RequireAuth allowedRoles={['PARTICIPANT']}><ParticipantLayout /></RequireAuth>}>
        <Route index element={<Navigate to="planning" replace />} />
        <Route path="planning" element={<ParticipantPlanning />} />
        <Route path="formations" element={<MesFormations />} />
        <Route path="documents" element={<Documents />} />
        <Route path="attestations" element={<Attestations />} />
        <Route path="evaluations" element={<Evaluation />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ── Formateur ── */}
      <Route path="/formateur" element={<RequireAuth allowedRoles={['FORMATEUR']}><FormateurLayout /></RequireAuth>}>
        <Route index element={<Navigate to="planning" replace />} />
        <Route path="planning" element={<FormateurPlanning />} />
        <Route path="sessions" element={<MesSessions />} />
        <Route path="apprenants" element={<MesApprenants />} />
        <Route path="ressources" element={<FormateurRessources />} />
        <Route path="evaluations" element={<EvaluationsFormateur />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ── Responsable Formation ── */}
      <Route path="/responsable" element={<RequireAuth allowedRoles={['RESPONSABLE_FORMATION']}><ResponsableLayout /></RequireAuth>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ResponsableDashboard />} />
        <Route path="formations" element={<ReadOnlyFormations />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="participants" element={<ParticipantsReadOnly />} />
        <Route path="formateurs" element={<FormateursReadOnly />} />
        <Route path="finances" element={<Finances />} />
        <Route path="demandes" element={<GestionDemandes />} />
        <Route path="ia" element={<AnalyseIA />} />
        <Route path="notifications" element={<ComingSoon name="Notifications" />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}