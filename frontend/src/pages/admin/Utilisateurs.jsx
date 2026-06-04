import { useState, useEffect, useCallback } from 'react'
import { utilisateursAPI } from '../../services/api'
import {
  Users, Plus, X, Eye, EyeOff, Search, Save,
  CheckCircle, AlertCircle, Loader2, ShieldCheck,
  UserCog, GraduationCap, User, Pencil, Trash2
} from 'lucide-react'
import './Utilisateurs.css'

const ROLE_CONFIG = {
  ADMIN:                 { label: 'Administrateur',       color: '#dc2626', bg: '#fef2f2', icon: ShieldCheck },
  RESPONSABLE_FORMATION: { label: 'Responsable Formation', color: '#7c3aed', bg: '#f5f3ff', icon: UserCog },
  FORMATEUR:             { label: 'Formateur',             color: '#0891b2', bg: '#ecfeff', icon: GraduationCap },
  PARTICIPANT:           { label: 'Participant',            color: '#16a34a', bg: '#f0fdf4', icon: User },
  DIRECTION:             { label: 'Direction',              color: '#d97706', bg: '#fffbeb', icon: ShieldCheck },
}

const ROLES_OPTIONS = [
  { value: 'RESPONSABLE_FORMATION', label: 'Responsable Formation' },
  { value: 'FORMATEUR',             label: 'Formateur' },
  { value: 'PARTICIPANT',           label: 'Participant' },
]

const EMPTY_FORM = {
  nom: '', prenom: '', email: '', password: '', type: 'RESPONSABLE_FORMATION', cosapUserId: '', typeParticipant: 'INTERNE',
}

const TYPE_PARTICIPANT_OPTIONS = [
  { value: 'INTERNE', label: 'Interne (Employé)' },
  { value: 'EXTERNE', label: 'Externe (Client)' },
]

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`util-toast util-toast--${toast.type}`}>
      {toast.type === 'success'
        ? <CheckCircle size={16} />
        : <AlertCircle size={16} />}
      {toast.message}
    </div>
  )
}

function RoleBadge({ role, typeParticipant }) {
  const config = ROLE_CONFIG[role] || { label: role, color: '#6b7280', bg: '#f3f4f6', icon: User }
  const Icon = config.icon
  return (
    <span className="util-role-badge" style={{ color: config.color, background: config.bg }}>
      <Icon size={11} />
      {config.label}
      {role === 'PARTICIPANT' && typeParticipant && (
        <span className="util-role-sub" style={{ color: config.color, opacity: 0.65 }}>
          {typeParticipant === 'INTERNE' ? '(Interne)' : '(Externe)'}
        </span>
      )}
    </span>
  )
}

export default function Utilisateurs() {
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')
  const [filterRole, setFilterRole] = useState('ALL')

  const [showModal, setShowModal]   = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [showPwd, setShowPwd]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  const [toast, setToast]           = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await utilisateursAPI.list()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de charger les utilisateurs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch =
      u.nom?.toLowerCase().includes(q) ||
      u.prenom?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    const matchRole = filterRole === 'ALL' || u.type === filterRole
    return matchSearch && matchRole
  })

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (formErrors[name]) setFormErrors(fe => ({ ...fe, [name]: null }))
  }

  const validateForm = (isEdit) => {
    const errs = {}
    if (!form.nom.trim())    errs.nom    = 'Le nom est requis.'
    if (!form.prenom.trim()) errs.prenom = 'Le prénom est requis.'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email    = 'Adresse email invalide.'
    if (!isEdit && form.password.length < 8)
      errs.password = 'Minimum 8 caractères.'
    if (!form.type)          errs.type   = 'Le rôle est requis.'
    return errs
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setShowPwd(false)
    setShowModal(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setForm({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      password: '',
      type: user.type || 'RESPONSABLE_FORMATION',
      cosapUserId: user.cosapUserId || '',
      typeParticipant: user.typeParticipant || 'INTERNE',
    })
    setFormErrors({})
    setShowPwd(false)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    if (submitting) return
    setShowModal(false)
    setEditingUser(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isEdit = !!editingUser
    const errs = validateForm(isEdit)
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }

    setSubmitting(true)
    try {
      const payload = {
        nom:      form.nom.trim(),
        prenom:   form.prenom.trim(),
        email:    form.email.trim().toLowerCase(),
        type:     form.type,
      }
      if (form.cosapUserId.trim()) payload.cosapUserId = form.cosapUserId.trim()
      if (form.type === 'PARTICIPANT') payload.typeParticipant = form.typeParticipant
      if (form.password) payload.password = form.password

      if (isEdit) {
        await utilisateursAPI.update(editingUser.id, payload)
        setToast({ type: 'success', message: `✏️ ${payload.prenom} ${payload.nom} modifié avec succès !` })
      } else {
        payload.password = form.password
        await utilisateursAPI.create(payload)
        setToast({ type: 'success', message: `✅ ${payload.prenom} ${payload.nom} créé avec succès !` })
      }

      setShowModal(false)
      setEditingUser(null)
      fetchUsers()
    } catch (err) {
      const serverError =
        err.response?.data?.detail ||
        err.response?.data?.details ||
        err.response?.data?.error ||
        'Erreur lors de l\'enregistrement.'
      setToast({ type: 'error', message: serverError })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await utilisateursAPI.delete(deleteTarget.id)
      setToast({ type: 'success', message: `🗑️ ${deleteTarget.prenom} ${deleteTarget.nom} supprimé.` })
      setDeleteTarget(null)
      fetchUsers()
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Erreur lors de la suppression.' })
    } finally {
      setDeleting(false)
    }
  }

  const counts = users.reduce((acc, u) => {
    acc[u.type] = (acc[u.type] || 0) + 1
    return acc
  }, {})

  const isEdit = !!editingUser

  return (
    <div className="util-page">
      <Toast toast={toast} />

      <div className="util-header">
        <div className="util-header-left">
          <div className="util-breadcrumb">
            Administration › <span>Utilisateurs</span>
          </div>
          <h1 className="util-title">
            <Users size={22} />
            Gestion des Utilisateurs
          </h1>
          <p className="util-subtitle">
            {users.length} compte{users.length !== 1 ? 's' : ''} enregistré{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="util-btn-create" onClick={openCreateModal}>
          <Plus size={16} />
          Nouvel utilisateur
        </button>
      </div>

      <div className="util-stats">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
          counts[role] > 0 && (
            <div key={role} className="util-stat-chip" style={{ borderColor: cfg.color + '44', background: cfg.bg }}>
              <cfg.icon size={14} style={{ color: cfg.color }} />
              <span style={{ color: cfg.color, fontWeight: 700 }}>{counts[role]}</span>
              <span style={{ color: '#6b7280', fontSize: 12 }}>{cfg.label}</span>
            </div>
          )
        ))}
      </div>

      <div className="util-filters">
        <div className="util-search-wrap">
          <Search size={15} className="util-search-icon" />
          <input
            className="util-search"
            placeholder="Rechercher par nom, prénom ou email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="util-role-filters">
          <button
            className={`util-filter-btn ${filterRole === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterRole('ALL')}
          >Tous</button>
          {ROLES_OPTIONS.map(r => (
            <button
              key={r.value}
              className={`util-filter-btn ${filterRole === r.value ? 'active' : ''}`}
              onClick={() => setFilterRole(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="util-table-wrap">
        {loading ? (
          <div className="util-state">
            <Loader2 size={28} className="util-spinner" />
            <p>Chargement des utilisateurs…</p>
          </div>
        ) : error ? (
          <div className="util-state util-state--error">
            <AlertCircle size={28} />
            <p>{error}</p>
            <button className="util-btn-retry" onClick={fetchUsers}>Réessayer</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="util-state">
            <Users size={40} className="util-empty-icon" />
            <p>Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <table className="util-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nom complet</th>
                <th>Email</th>
                <th>Rôle</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => (
                <tr key={u.id}>
                  <td className="util-td-idx">{idx + 1}</td>
                  <td className="util-td-name">
                    <div className="util-avatar">
                      {(u.prenom?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <div className="util-fullname">{u.prenom} {u.nom}</div>
                    </div>
                  </td>
                  <td className="util-td-email">{u.email}</td>
                  <td><RoleBadge role={u.type} typeParticipant={u.typeParticipant} /></td>
                  <td>
                    <div className="util-actions">
                      <button className="util-action-btn" title="Modifier"
                        onClick={() => openEditModal(u)}>
                        <Pencil size={14} />
                      </button>
                      <button className="util-action-btn util-action-btn--danger" title="Supprimer"
                        onClick={() => setDeleteTarget({ id: u.id, prenom: u.prenom, nom: u.nom })}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="util-overlay" onClick={handleCloseModal}>
          <div className="util-modal" onClick={e => e.stopPropagation()}>
            <div className="util-modal-header">
              <h2>{isEdit ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}</h2>
              <button className="util-modal-close" onClick={handleCloseModal} disabled={submitting}>
                <X size={18} />
              </button>
            </div>

            <form className="util-modal-form" onSubmit={handleSubmit} noValidate>
              <div className="util-form-row">
                <div className={`util-field ${formErrors.prenom ? 'has-error' : ''}`}>
                  <label>Prénom <span className="req">*</span></label>
                  <input name="prenom" value={form.prenom} onChange={handleFormChange} placeholder="Leila" />
                  {formErrors.prenom && <span className="util-field-error">{formErrors.prenom}</span>}
                </div>
                <div className={`util-field ${formErrors.nom ? 'has-error' : ''}`}>
                  <label>Nom <span className="req">*</span></label>
                  <input name="nom" value={form.nom} onChange={handleFormChange} placeholder="GHARBI" />
                  {formErrors.nom && <span className="util-field-error">{formErrors.nom}</span>}
                </div>
              </div>

              <div className={`util-field ${formErrors.email ? 'has-error' : ''}`}>
                <label>Adresse email <span className="req">*</span></label>
                <input name="email" type="email" value={form.email}
                  onChange={handleFormChange} placeholder="leila.gharbi@cosap.tn" />
                {formErrors.email && <span className="util-field-error">{formErrors.email}</span>}
              </div>

              <div className={`util-field ${formErrors.password ? 'has-error' : ''}`}>
                <label>Mot de passe {!isEdit && <span className="req">*</span>}</label>
                <div className="util-pwd-wrap">
                  <input
                    name="password" type={showPwd ? 'text' : 'password'}
                    value={form.password} onChange={handleFormChange}
                    placeholder={isEdit ? 'Laisser vide pour conserver' : 'Minimum 8 caractères'}
                  />
                  <button type="button" className="util-pwd-toggle" onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {formErrors.password && <span className="util-field-error">{formErrors.password}</span>}
              </div>

              <div className={`util-field ${formErrors.type ? 'has-error' : ''}`}>
                <label>Rôle <span className="req">*</span></label>
                <select name="type" value={form.type} onChange={handleFormChange}>
                  {ROLES_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {formErrors.type && <span className="util-field-error">{formErrors.type}</span>}
              </div>

              {/* Participant type sub-option */}
              {form.type === 'PARTICIPANT' && (
                <div className="util-field">
                  <label>Type de participant <span className="req">*</span></label>
                  <div className="util-radio-group">
                    {TYPE_PARTICIPANT_OPTIONS.map(opt => (
                      <label key={opt.value}
                        className={`util-radio-label ${form.typeParticipant === opt.value ? 'selected' : ''}`}>
                        <input type="radio" name="typeParticipant" value={opt.value}
                          checked={form.typeParticipant === opt.value}
                          onChange={handleFormChange} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="util-field">
                <label>COSAP User ID <span className="util-optional">(optionnel)</span></label>
                <input name="cosapUserId" value={form.cosapUserId}
                  onChange={handleFormChange} placeholder="Ex: USR-20240001" />
              </div>

              <div className="util-modal-footer">
                <button type="button" className="util-btn-cancel" onClick={handleCloseModal} disabled={submitting}>
                  Annuler
                </button>
                <button type="submit" className="util-btn-submit" disabled={submitting}>
                  {submitting
                    ? <><Loader2 size={15} className="util-spinner" /> {isEdit ? 'Modification…' : 'Création…'}</>
                    : <>{isEdit ? <Save size={15} /> : <Plus size={15} />} {isEdit ? 'Enregistrer' : 'Créer l\'utilisateur'}</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="util-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="util-modal util-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="util-modal-header">
              <h2>Confirmer la suppression</h2>
              <button className="util-modal-close" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                <X size={18} />
              </button>
            </div>
            <div className="util-delete-body">
              <AlertCircle size={28} className="util-delete-icon" />
              <p className="util-delete-text">
                Êtes-vous sûr de vouloir supprimer <strong>{deleteTarget.prenom} {deleteTarget.nom}</strong> ?
                Cette action est irréversible.
              </p>
            </div>
            <div className="util-modal-footer">
              <button className="util-btn-cancel" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Annuler
              </button>
              <button className="util-btn-delete" onClick={handleDelete} disabled={deleting}>
                {deleting
                  ? <><Loader2 size={15} className="util-spinner" /> Suppression…</>
                  : <><Trash2 size={15} /> Supprimer</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
