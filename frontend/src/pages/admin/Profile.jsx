import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import { User, Mail, Phone, Globe, Calendar, Shield, CheckCircle, AlertCircle, Loader2, Save, Eye, EyeOff } from 'lucide-react'
import './Profile.css'

const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  RESPONSABLE_FORMATION: 'Responsable Formation',
  FORMATEUR: 'Formateur',
  PARTICIPANT: 'Participant',
}

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [showPwd, setShowPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)

  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', langue: 'fr' })
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '' })

  useEffect(() => {
    if (!user) return
    authAPI.profile()
      .then(({ data }) => {
        if (data?.user) {
          setProfile(data.user)
          setForm({
            nom: data.user.nom || '',
            prenom: data.user.prenom || '',
            telephone: data.user.telephone || '',
            langue: data.user.langue || 'fr',
          })
        }
      })
      .catch(() => setToast({ type: 'error', message: 'Erreur lors du chargement du profil' }))
      .finally(() => setLoading(false))
  }, [user])

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await authAPI.updateProfile(form)
      if (data?.user) {
        setProfile(prev => ({ ...prev, ...data.user }))
        showToast('success', 'Profil mis à jour')
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Erreur lors de la mise à jour'
      showToast('error', msg)
    } finally {
      setSaving(false)
    }
  }

  const handlePassword = async () => {
    if (!pwdForm.current_password || !pwdForm.new_password) {
      showToast('error', 'Les deux champs sont requis')
      return
    }
    if (pwdForm.new_password.length < 6) {
      showToast('error', 'Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    setPwdSaving(true)
    try {
      await authAPI.updatePassword(pwdForm)
      setPwdForm({ current_password: '', new_password: '' })
      showToast('success', 'Mot de passe mis à jour')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Erreur lors du changement de mot de passe'
      showToast('error', msg)
    } finally {
      setPwdSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <Loader2 size={24} className="spin" />
        <span>Chargement du profil...</span>
      </div>
    )
  }

  if (!profile) {
    return <div className="profile-loading">Impossible de charger le profil.</div>
  }

  const roleLabel = ROLE_LABELS[profile.role] || profile.role || 'Utilisateur'

  return (
    <div className="profile-page">
      {toast && (
        <div className={`profile-toast profile-toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar-large">
          {(profile.prenom?.[0] ?? '') + (profile.nom?.[0] ?? '')}
        </div>
        <div className="profile-header-info">
          <h1>{profile.prenom} {profile.nom}</h1>
          <span className="profile-role-badge">{roleLabel}</span>
        </div>
      </div>

      <div className="profile-grid">
        {/* Informations générales */}
        <div className="card profile-card">
          <div className="profile-card-header">
            <User size={18} />
            <h3>Informations générales</h3>
          </div>
          <div className="profile-card-body">
            <div className="profile-field">
              <label>Nom</label>
              <input
                type="text"
                value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
              />
            </div>
            <div className="profile-field">
              <label>Prénom</label>
              <input
                type="text"
                value={form.prenom}
                onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
              />
            </div>
            <div className="profile-field">
              <label>Téléphone</label>
              <input
                type="text"
                value={form.telephone}
                onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                placeholder="+216 XX XXX XXX"
              />
            </div>
            <div className="profile-field">
              <label>Langue</label>
              <select
                value={form.langue}
                onChange={e => setForm(f => ({ ...f, langue: e.target.value }))}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <button className="btn btn-primary profile-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
              Enregistrer
            </button>
          </div>
        </div>

        {/* Informations du compte */}
        <div className="card profile-card">
          <div className="profile-card-header">
            <Shield size={18} />
            <h3>Informations du compte</h3>
          </div>
          <div className="profile-card-body profile-info-list">
            <div className="profile-info-row">
              <Mail size={16} />
              <div>
                <span className="info-label">Email</span>
                <span className="info-value">{profile.email}</span>
              </div>
            </div>
            <div className="profile-info-row">
              <Shield size={16} />
              <div>
                <span className="info-label">Rôle</span>
                <span className="info-value">{roleLabel}</span>
              </div>
            </div>
            <div className="profile-info-row">
              <Phone size={16} />
              <div>
                <span className="info-label">Téléphone</span>
                <span className="info-value">{profile.telephone || 'Non renseigné'}</span>
              </div>
            </div>
            <div className="profile-info-row">
              <Globe size={16} />
              <div>
                <span className="info-label">Langue</span>
                <span className="info-value">{profile.langue === 'en' ? 'English' : 'Français'}</span>
              </div>
            </div>
            <div className="profile-info-row">
              <Calendar size={16} />
              <div>
                <span className="info-label">Membre depuis</span>
                <span className="info-value">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mot de passe */}
        <div className="card profile-card profile-card-full">
          <div className="profile-card-header">
            <Eye size={18} />
            <h3>Changer le mot de passe</h3>
          </div>
          <div className="profile-card-body profile-pwd-form">
            <div className="profile-field">
              <label>Mot de passe actuel</label>
              <div className="pwd-input-wrap">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={pwdForm.current_password}
                  onChange={e => setPwdForm(f => ({ ...f, current_password: e.target.value }))}
                />
                <button className="pwd-toggle" onClick={() => setShowPwd(s => !s)} type="button">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="profile-field">
              <label>Nouveau mot de passe</label>
              <div className="pwd-input-wrap">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  value={pwdForm.new_password}
                  onChange={e => setPwdForm(f => ({ ...f, new_password: e.target.value }))}
                />
                <button className="pwd-toggle" onClick={() => setShowNewPwd(s => !s)} type="button">
                  {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary profile-save-btn" onClick={handlePassword} disabled={pwdSaving}>
              {pwdSaving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
              Mettre à jour le mot de passe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
