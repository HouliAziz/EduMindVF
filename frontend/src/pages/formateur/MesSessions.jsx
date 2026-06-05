import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Users, MapPin, Calendar, Eye, ClipboardList, Star, Loader2, X, Check } from 'lucide-react'
import { formateurAPI, inscriptionsAPI } from '../../services/api'
import './MesSessions.css'

const STATUT_STYLE = {
  EN_COURS: { label: 'En cours', cls: 'badge-active' },
  A_VENIR: { label: 'À venir', cls: 'badge-planned' },
  TERMINEE: { label: 'Terminée', cls: 'badge-ended' },
}

const TABS = ['Toutes', 'À venir', 'En cours', 'Terminées']
const FILTER_MAP = { 'Toutes': null, 'À venir': 'A_VENIR', 'En cours': 'EN_COURS', 'Terminées': 'TERMINEE' }

export default function MesSessions() {
  const [tab, setTab] = useState('Toutes')
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [presenceSession, setPresenceSession] = useState(null)

  const [totalUniqueLearners, setTotalUniqueLearners] = useState(0)

  const loadSessions = () => {
    setLoading(true)
    formateurAPI.sessions()
      .then(({ data }) => {
        if (Array.isArray(data)) {
          // backward compat: flat array
          setSessions(data)
        } else {
          setSessions(data.sessions || [])
          setTotalUniqueLearners(data.totalUniqueLearners || 0)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(loadSessions, [])

  const filtered = sessions.filter(s => !FILTER_MAP[tab] || s.statut === FILTER_MAP[tab])
  const notesList = sessions.filter(s => s.note !== null)
  const avgNote = notesList.length > 0 ? (notesList.reduce((acc, s) => acc + s.note, 0) / notesList.length).toFixed(1) : '—'
  const sessionsAVenir = sessions.filter(s => s.statut === 'A_VENIR').length

  if (loading) {
    return (
      <div className="ms-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '10px', color: 'var(--gray-400)' }}>
        <Loader2 size={24} className="spin" />
        <span>Chargement des sessions...</span>
      </div>
    )
  }

  return (
    <div className="ms-page">
      <div className="ms-header">
        <div>
          <h1>Mes Sessions <span className="ms-count-badge">{sessions.length}</span></h1>
          <p>Gérez vos sessions de formation et suivez la progression de vos apprenants.</p>
        </div>
      </div>

      <div className="ms-stats stagger">
        <div className="card ms-stat">
          <div className="ms-stat-icon ms-icon-navy"><Calendar size={18} /></div>
          <div>
            <div className="ms-stat-label">Total sessions</div>
            <div className="ms-stat-val">{sessions.length}</div>
          </div>
        </div>
        <div className="card ms-stat">
          <div className="ms-stat-icon ms-icon-orange"><Users size={18} /></div>
          <div>
            <div className="ms-stat-label">Apprenants formés</div>
            <div className="ms-stat-val">{totalUniqueLearners}</div>
          </div>
        </div>
        <div className="card ms-stat">
          <div className="ms-stat-icon ms-icon-green"><Star size={18} /></div>
          <div>
            <div className="ms-stat-label">Note moyenne</div>
            <div className="ms-stat-val">{avgNote}/5</div>
          </div>
        </div>
        <div className="card ms-stat">
          <div className="ms-stat-icon ms-icon-blue"><ClipboardList size={18} /></div>
          <div>
            <div className="ms-stat-label">Sessions à venir</div>
            <div className="ms-stat-val">{sessionsAVenir}</div>
          </div>
        </div>
      </div>

      <div className="ms-tabs">
        {TABS.map(t => (
          <button key={t} className={`ms-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="ms-list stagger">
        {filtered.map(s => <SessionRow key={s.id} s={s} onPresence={() => setPresenceSession(s)} />)}
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '14px' }}>Aucune session trouvée.</div>
        )}
      </div>

      {presenceSession && createPortal(
        <PresenceModal session={presenceSession} onClose={() => setPresenceSession(null)} onSaved={loadSessions} />,
        document.body
      )}
    </div>
  )
}

function SessionRow({ s, onPresence }) {
  const st = STATUT_STYLE[s.statut] || { label: s.statut, cls: 'badge-planned' }
  const presPct = s.inscrits > 0 ? Math.round((s.presentCount / s.inscrits) * 100) : 0

  return (
    <div className="card ms-row">
      <div className="ms-row-main">
        <div className="ms-row-info">
          <div className="ms-row-top">
            <h3 className="ms-session-title">{s.titre}</h3>
            <span className={`badge ${st.cls}`}>{st.label}</span>
          </div>
          <div className="ms-session-formation">{s.formation}</div>
          <div className="ms-session-meta">
            <span><Calendar size={12} /> {s.dateDebut} → {s.dateFin}</span>
            <span><MapPin size={12} /> {s.salle}</span>
          </div>
        </div>

        <div className="ms-row-pres-bar">
          <div className="ms-cap-label">
            <Users size={13} />
            <span><strong>{s.presentCount}</strong> / {s.inscrits} présents</span>
          </div>
          <div className="progress-bar" style={{ width: 120 }}>
            <div className="progress-fill" style={{ width: `${presPct}%`, background: '#16a34a' }} />
          </div>
          <span className="ms-cap-pct" style={{ color: '#16a34a' }}>{presPct}%</span>
        </div>

        {s.note !== null && (
          <div className="ms-row-note">
            <Star size={14} fill="var(--orange)" color="var(--orange)" />
            <span className="ms-note-val">{s.note}</span>
            <span className="ms-note-sub">/5</span>
          </div>
        )}

        <div className="ms-row-actions">
          <Link to="/formateur/apprenants" className="ms-action-btn"><Eye size={14} /> Voir apprenants</Link>
          <button className="ms-action-btn" onClick={onPresence}><ClipboardList size={14} /> Présences</button>
          <button className="ms-action-btn ms-action-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}><Star size={14} /> Évaluations</button>
        </div>
      </div>
    </div>
  )
}

function PresenceModal({ session, onClose, onSaved }) {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    inscriptionsAPI.bySession(session.id)
      .then(({ data }) => setParticipants(
        data.map(p => ({
          ...p,
          statutPresence: p.statutPresence === 'PRESENT' ? 'PRESENT' : 'ABSENT',
        }))
      ))
      .catch(() => setParticipants([]))
      .finally(() => setLoading(false))
  }, [session.id])

  const togglePresence = (idx) => {
    setParticipants(prev => {
      const next = [...prev]
      const current = next[idx].statutPresence || 'ABSENT'
      next[idx] = { ...next[idx], statutPresence: current === 'PRESENT' ? 'ABSENT' : 'PRESENT' }
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await inscriptionsAPI.batchPresence({
        sessionId: session.id,
        presences: participants.map(p => ({
          inscriptionId: p.id,
          statutPresence: p.statutPresence,
        })),
      })
      onClose()
      if (onSaved) onSaved()
    } catch (e) {
      alert('Erreur lors de la sauvegarde des présences.')
    } finally {
      setSaving(false)
    }
  }

  const presenceIcon = (statut) => {
    return statut === 'PRESENT'
      ? <Check size={14} style={{ color: '#16a34a' }} />
      : <X size={14} style={{ color: '#dc2626' }} />
  }

  return (
    <div className="ms-modal-overlay" onClick={onClose}>
      <div className="ms-modal" onClick={e => e.stopPropagation()}>
        <div className="ms-modal-head">
          <h3>Présences — {session.titre}</h3>
          <button className="ms-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="ms-modal-body">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '30px', color: 'var(--gray-400)' }}>
              <Loader2 size={20} className="spin" />
            </div>
          ) : participants.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--gray-400)' }}>Aucun participant inscrit.</div>
          ) : (
            <table className="ms-pres-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Email</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={p.id}>
                    <td>{p.prenom} {p.nom}</td>
                    <td>{p.email}</td>
                    <td>
                      <button className={`ms-pres-status ${p.statutPresence === 'PRESENT' ? 'ms-pres-status--present' : 'ms-pres-status--absent'}`} onClick={() => togglePresence(i)}>
                        {presenceIcon(p.statutPresence)}
                        <span>{p.statutPresence || 'ABSENT'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="ms-modal-foot">
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn btn-navy" onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Enregistrement...' : 'Enregistrer les présences'}
          </button>
        </div>
      </div>
    </div>
  )
}