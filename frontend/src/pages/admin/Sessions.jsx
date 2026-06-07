import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react'
import { ChevronLeft, ChevronRight, Calendar, List, Search, Plus, Loader2, AlertCircle, RefreshCw, X, ShieldAlert, Check, Trash2, ArrowLeft, ArrowRight } from 'lucide-react'
import { sessionsAPI, formationsAPI, utilisateursAPI } from '../../services/api'
import './Sessions.css'

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS_HEADER = ['LUN.','MAR.','MER.','JEU.','VEN.','SAM.','DIM.']

const MODE_COLORS = {
  SUR_SITE: '#1B3A7A',
  HEBERGEMENT: '#F26522',
  CHEZ_CLIENT: '#3b82f6',
  DISTANCIEL: '#10b981',
}

const MODE_LABELS = {
  SUR_SITE: 'Sur Site',
  HEBERGEMENT: 'Hébergement',
  CHEZ_CLIENT: 'Chez le Client',
  DISTANCIEL: 'À Distance',
}

const LOGISTICS_LABELS = {
  pauseCafe: 'Pause café',
  locationSalles: 'Location des salles',
  restauration: 'Restauration',
  transport: 'Transport',
  logement: 'Logement',
  autre: 'Autre',
}

const LOGISTICS_FIELDS = Object.keys(LOGISTICS_LABELS)

const INITIAL_FORM = {
  formationId: '',
  dateDebut: '',
  heureDebut: '09:00',
  heureFin: '17:00',
  modeSession: 'SUR_SITE',
  nbParticipantsPrevu: 15,
  lieu: '',
  formateurId: '',
}
LOGISTICS_FIELDS.forEach(k => { INITIAL_FORM[k] = null })

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

function calculateDateFin(startDateStr, _durationDays) {
  // Session = 1 jour : dateFin = dateDebut
  return startDateStr || ''
}

export default function Sessions() {
  const now = new Date()
  const [view, setView] = useState('calendar')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState('ALL')

  const [sessions, setSessions] = useState([])
  const [formations, setFormations] = useState([])
  const [formateurs, setFormateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm] = useState({ ...INITIAL_FORM })
  const [formStep, setFormStep] = useState(1)

  // Context menu (Floating UI)
  const [contextMenu, setContextMenu] = useState(null)
  const [virtualEl, setVirtualEl] = useState(null)
  const { refs, floatingStyles } = useFloating({
    elements: { reference: virtualEl },
    whileElementsMounted: autoUpdate,
    placement: 'right-start',
    middleware: [offset(10), flip(), shift({ padding: 10 })],
  })

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Toast
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const resetForm = () => {
    setForm({ ...INITIAL_FORM, ...Object.fromEntries(LOGISTICS_FIELDS.map(k => [k, null])) })
    setFormErrors({})
    setModalError(null)
    setEditingSession(null)
    setFormStep(1)
    setContextMenu(null)
    setVirtualEl(null)
  }

  const openCreateModal = (prefillDate = '') => {
    resetForm()
    if (prefillDate) {
      setForm(prev => ({ ...prev, dateDebut: prefillDate }))
    }
    setEditingSession(null)
    setIsModalOpen(true)
    setFormStep(1)
  }

  const openEditModal = (session) => {
    resetForm()
    setForm({
      formationId: session.formationId || '',
      dateDebut: session.dateDebut || '',
      heureDebut: session.heureDebut || '09:00',
      heureFin: session.heureFin || '17:00',
      modeSession: session.modeSession || 'SUR_SITE',
      nbParticipantsPrevu: session.nbParticipantsPrevu || 15,
      lieu: session.lieu || '',
      formateurId: session.formateurId || '',
      pauseCafe: session.logistics?.PAUSE_CAFE ?? null,
      locationSalles: session.logistics?.LOCATION_SALLES ?? null,
      restauration: session.logistics?.RESTAURATION ?? null,
      transport: session.logistics?.TRANSPORT ?? null,
      logement: session.logistics?.HEBERGEMENT ?? null,
      autre: session.logistics?.AUTRE ?? null,
    })
    setEditingSession(session)
    setIsModalOpen(true)
    setFormStep(1)
    setContextMenu(null)
    setVirtualEl(null)
  }

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [sessionsRes, formationsRes, usersRes] = await Promise.all([
        sessionsAPI.list(),
        formationsAPI.list(),
        utilisateursAPI.list()
      ])
      setSessions(sessionsRes.data || [])
      setFormations(formationsRes.data || [])
      const users = usersRes.data || []
      setFormateurs(users.filter(u => u.type === 'FORMATEUR'))
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setError("Impossible de charger les sessions de formation.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return
    const handleClick = (e) => {
      if (refs.floating.current && !refs.floating.current.contains(e.target)) {
        setContextMenu(null)
        setVirtualEl(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [contextMenu, refs.floating])

  // Calendar calculations
  const totalDays = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const prevDays = getDaysInMonth(year, month - 1)

  const cells = []
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, current: false })
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, current: true })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - totalDays - firstDay + 1, current: false })
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else { setMonth(m => m - 1) }
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else { setMonth(m => m + 1) }
  }
  const today = () => {
    const todayDate = new Date()
    setYear(todayDate.getFullYear())
    setMonth(todayDate.getMonth())
  }

  // Filter & search
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.formationTitre?.toLowerCase().includes(search.toLowerCase()) ||
      s.codeSession?.toLowerCase().includes(search.toLowerCase())
    const matchesMode = modeFilter === 'ALL' || s.modeSession === modeFilter
    return matchesSearch && matchesMode
  })

  // Map sessions for calendar
  const sessionsByDay = {}
  filteredSessions.forEach(s => {
    if (!s.dateDebut) return
    const sDate = new Date(s.dateDebut)
    if (isNaN(sDate.getTime())) return
    const sYear = sDate.getFullYear()
    const sMonth = sDate.getMonth()
    const sDay = sDate.getDate()
    if (sYear === year && sMonth === month) {
      if (!sessionsByDay[sDay]) sessionsByDay[sDay] = []
      sessionsByDay[sDay].push(s)
    }
  })

  // Handle day click — show context menu if sessions exist, otherwise open create modal
  const handleDayClick = (day, cellCurrent, e) => {
    if (!cellCurrent) return
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const daySessions = sessionsByDay[day] || []

    if (daySessions.length === 0) {
      openCreateModal(dateStr)
      return
    }

    // Virtual element at cursor position — Floating UI handles flip/shift
    setVirtualEl({
      getBoundingClientRect() {
        return {
          width: 0, height: 0,
          x: e.clientX, y: e.clientY,
          top: e.clientY, right: e.clientX,
          bottom: e.clientY, left: e.clientX,
        }
      },
    })
    setContextMenu({ day, dateStr, sessions: daySessions })
  }

  // Form change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => {
      const next = { ...prev, [name]: name === 'nbParticipantsPrevu' ? parseInt(value) || 0 : value }
      // When formation changes, auto-fill nbParticipantsPrevu from formation data
      if (name === 'formationId') {
        const formation = formations.find(f => f.id === value)
        if (formation?.nbParticipants != null) {
          next.nbParticipantsPrevu = formation.nbParticipants
        }
      }
      return next
    })
    if (formErrors[name]) {
      setFormErrors(prev => { const n = { ...prev }; delete n[name]; return n })
    }
  }

  const goToStep2 = () => {
    const errs = {}
    if (!form.formationId) errs.formationId = "Veuillez sélectionner une formation."
    if (!form.dateDebut) errs.dateDebut = "Date de début requise."
    if (!form.formateurId) errs.formateurId = "Veuillez sélectionner un formateur."
    if (form.heureDebut && form.heureFin && form.heureDebut >= form.heureFin) {
      errs.heureFin = "L'heure de fin doit être postérieure à l'heure de début."
    }
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }
    setFormErrors({})
    setFormStep(2)
  }

  // Submit (create or update)
  const handleSubmit = async () => {
    setModalError(null)
    setFormErrors({})

    const errors = {}
    if (!form.formationId) errors.formationId = "Veuillez sélectionner une formation."
    if (!form.dateDebut) errors.dateDebut = "Date de début requise."
    if (!form.formateurId) errors.formateurId = "Veuillez sélectionner un formateur."
    if (form.heureDebut && form.heureFin && form.heureDebut >= form.heureFin) {
      errors.heureFin = "L'heure de fin doit être postérieure à l'heure de début."
    }

    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }

    const selectedFormation = formations.find(f => f.id === form.formationId)
    const durationDays = selectedFormation ? parseInt(selectedFormation.dureeJours || 1) : 1
    const computedDateFin = calculateDateFin(form.dateDebut, durationDays)

    const payload = {
      formationId: form.formationId,
      dateDebut: form.dateDebut,
      dateFin: computedDateFin,
      modeSession: form.modeSession,
      nbParticipantsPrevu: form.nbParticipantsPrevu,
      lieu: form.lieu,
      formateurId: form.formateurId || null,
      heureDebut: form.heureDebut || null,
      heureFin: form.heureFin || null,
      pauseCafe: form.pauseCafe || null,
      locationSalles: form.locationSalles || null,
      restauration: form.restauration || null,
      transport: form.transport || null,
      logement: form.logement || null,
      autre: form.autre || null,
    }

    setIsSubmitting(true)
    try {
      if (editingSession) {
        await sessionsAPI.update(editingSession.id, payload)
        showToast("Session mise à jour avec succès.")
      } else {
        await sessionsAPI.create(payload)
        showToast("Session planifiée avec succès.")
      }
      setIsModalOpen(false)
      resetForm()
      fetchData()
    } catch (err) {
      const data = err.response?.data
      if (data?.details) setModalError(data.details)
      else if (data?.error) setModalError(data.error)
      else setModalError("Une erreur est survenue.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete session
  const handleDelete = async (sessionId) => {
    try {
      await sessionsAPI.delete(sessionId)
      showToast("Session supprimée.", 'error')
      setIsModalOpen(false)
      setDeleteConfirm(null)
      resetForm()
      fetchData()
    } catch (err) {
      showToast("Erreur lors de la suppression.", 'error')
    }
  }

  // Max 3 events visible per cell
  const MAX_VISIBLE_EVENTS = 3

  return (
    <div className="sessions-page">
      {/* Toast */}
      {toast && (
        <div className={`sess-toast sess-toast--${toast.type}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="sessions-header">
        <div>
          <div className="sessions-breadcrumb">Administration › <span>Sessions</span></div>
          <h1>Planification Sessions</h1>
        </div>
        <div className="sessions-controls">
          <div className="view-toggle">
            <button className={`view-btn ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>
              <Calendar size={14} /> Vue Calendrier
            </button>
            <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
              <List size={14} /> Vue Liste
            </button>
          </div>
          <div className="sessions-search">
            <Search size={13} />
            <input placeholder="Rechercher par formation ou code..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="refresh-btn-sessions" onClick={fetchData} title="Recharger">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Mode Filter */}
      <div className="mode-filter-bar">
        <button className={`mode-filter-btn ${modeFilter === 'ALL' ? 'active' : ''}`} onClick={() => setModeFilter('ALL')}>Toutes</button>
        {Object.entries(MODE_LABELS).map(([val, label]) => (
          <button key={val} className={`mode-filter-btn ${modeFilter === val ? 'active' : ''}`} onClick={() => setModeFilter(val)}>
            <span className="legend-dot-small" style={{ background: MODE_COLORS[val] }} />
            {label}
          </button>
        ))}
      </div>

      {/* Loading / Error */}
      {loading && sessions.length === 0 ? (
        <div className="sessions-state">
          <Loader2 size={36} className="spin sessions-spinner" />
          <p>Chargement des sessions...</p>
        </div>
      ) : error ? (
        <div className="sessions-state sessions-state--error">
          <AlertCircle size={36} />
          <p>{error}</p>
          <button className="sess-btn-retry" onClick={fetchData}>Réessayer</button>
        </div>
      ) : (
        <>
          {/* Calendar Nav */}
          {view === 'calendar' && (
            <div className="cal-nav">
              <div className="cal-month-nav">
                <span className="cal-month-label">{MONTHS[month]} {year}</span>
                <div className="cal-nav-btns">
                  <button onClick={prevMonth}><ChevronLeft size={16} /></button>
                  <button className="today-btn" onClick={today}>Aujourd'hui</button>
                  <button onClick={nextMonth}><ChevronRight size={16} /></button>
                </div>
              </div>
              <div className="cal-legend">
                {Object.entries(MODE_LABELS).map(([mode, label]) => (
                  <span key={mode} className="legend-item">
                    <span className="legend-dot" style={{ background: MODE_COLORS[mode] }} /> {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {view === 'list' ? (
            /* List View */
            <div className="sess-table-wrap">
              <table className="sess-table">
                  <thead>
                    <tr>
                      <th>Formation</th>
                    <th>Date Début</th>
                    <th>Date Fin</th>
                    <th>Mode</th>
                    <th>Capacité</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((sess) => (
                    <tr key={sess.id}>
                      <td><div className="sess-title">{sess.formationTitre}</div></td>
                      <td>{sess.dateDebut}</td>
                      <td>{sess.dateFin}</td>
                      <td>
                        <span className="sess-mode-badge" style={{
                          background: (MODE_COLORS[sess.modeSession] || '#6b7280') + '15',
                          color: MODE_COLORS[sess.modeSession] || '#6b7280'
                        }}>
                          {MODE_LABELS[sess.modeSession] || sess.modeSession}
                        </span>
                      </td>
                      <td>{sess.nbParticipantsPrevu} participants</td>
                      <td>
                        <span className={`sess-status-badge sess-status--${sess.statut?.toLowerCase()}`}>{sess.statut}</span>
                      </td>
                      <td>
                        <button className="action-btn" onClick={() => openEditModal(sess)} title="Modifier">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSessions.length === 0 && (
                    <tr><td colSpan="7" className="sess-empty-row">Aucune session ne correspond à vos critères.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Calendar View */
            <div className="card month-calendar">
              <div className="month-header-row">
                {DAYS_HEADER.map(d => <div key={d} className="month-day-header">{d}</div>)}
              </div>
              <div className="month-grid">
                {cells.map((cell, i) => {
                  const evts = cell.current ? (sessionsByDay[cell.day] || []) : []
                  const nowToday = new Date()
                  const isToday = cell.current && cell.day === nowToday.getDate() && month === nowToday.getMonth() && year === nowToday.getFullYear()
                  const showMore = evts.length > MAX_VISIBLE_EVENTS
                  const visibleEvts = evts.slice(0, MAX_VISIBLE_EVENTS)

                  return (
                    <div
                      key={i}
                      className={`month-cell ${cell.current ? '' : 'other-month'} ${isToday ? 'today-cell' : ''}`}
                      onClick={(e) => handleDayClick(cell.day, cell.current, e)}
                    >
                      <span className={`month-day-num ${isToday ? 'today-num' : ''}`}>{cell.day}</span>
                      <div className="cell-events">
                        {visibleEvts.map(ev => {
                          const color = MODE_COLORS[ev.modeSession] || '#6b7280'
                          return (
                            <div
                              key={ev.id}
                              className="cell-event"
                              style={{ background: color }}
                              title={`${ev.formationTitre}\n${ev.codeSession ? `Code: ${ev.codeSession}\n` : ''}Mode: ${MODE_LABELS[ev.modeSession] || ev.modeSession}${ev.dateDebut ? `\nDu ${ev.dateDebut} au ${ev.dateFin}` : ''}`}
                              onClick={(e) => { e.stopPropagation(); openEditModal(ev) }}
                            >
                              {ev.formationTitre}
                            </div>
                          )
                        })}
                        {showMore && (
                          <span className="cell-more" onClick={(e) => { e.stopPropagation(); handleDayClick(cell.day, true, e) }}>
                            +{evts.length - MAX_VISIBLE_EVENTS} autres
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* FAB */}
      <button className="sessions-fab btn btn-primary" onClick={() => openCreateModal()} title="Planifier une session">
        <Plus size={20} />
      </button>

      {/* Context Menu (Floating UI) */}
      {contextMenu && (
        <div ref={refs.setFloating} style={{
          ...floatingStyles,
          zIndex: 1100,
          background: '#fff',
          borderRadius: '10px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          minWidth: '200px',
          maxWidth: 'min(280px, calc(100vw - 20px))',
          padding: '6px',
        }}>
          <div style={{ padding: '6px 10px 4px', fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)' }}>
            {new Date(contextMenu.dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <button style={{
            all: 'unset', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
            borderRadius: '6px', cursor: 'pointer', width: '100%', boxSizing: 'border-box',
            fontSize: '13px', color: 'var(--navy)', fontWeight: 600, transition: 'background 0.1s'
          }}
            onClick={() => openCreateModal(contextMenu.dateStr)}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Plus size={14} />
            Ajouter une session
          </button>
          {contextMenu.sessions.length > 0 && (
            <>
              <div style={{ height: '1px', background: 'var(--gray-100)', margin: '4px 6px' }} />
              {contextMenu.sessions.map(s => (
                <button key={s.id} style={{
                  all: 'unset', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
                  borderRadius: '6px', cursor: 'pointer', width: '100%', boxSizing: 'border-box',
                  fontSize: '12.5px', color: 'var(--gray-700)', transition: 'background 0.1s'
                }}
                  onClick={() => openEditModal(s)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: MODE_COLORS[s.modeSession] || '#6b7280', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.formationTitre}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Create/Edit Modal (portal to body for full-window blur) */}
      {isModalOpen && createPortal(
        <div className="sess-overlay" onClick={() => { setIsModalOpen(false); resetForm() }}>
          <div className="sess-modal" onClick={e => e.stopPropagation()}>
            <div className="sess-modal-header">
              <h2>{editingSession ? 'Modifier la Session' : 'Planifier une Session'}</h2>
              <button type="button" className="sess-modal-close" onClick={() => { setIsModalOpen(false); resetForm() }}>
                <X size={18} />
              </button>
            </div>

            <div className="sess-modal-form" style={{ position: 'relative' }}>
              {modalError && (
                <div className="sess-modal-error">
                  <ShieldAlert size={16} />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Step indicator */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: formStep === 1 ? 'var(--navy)' : 'var(--gray-200)' }} />
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: formStep === 2 ? 'var(--navy)' : 'var(--gray-200)' }} />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', fontWeight: 600 }}>
                <span style={{ color: formStep === 1 ? 'var(--navy)' : 'var(--gray-400)' }}>1. Détails session</span>
                <span style={{ color: formStep === 2 ? 'var(--navy)' : 'var(--gray-400)' }}>2. Logistique & Lieu</span>
              </div>

              {/* Step 1: Session details */}
              {formStep === 1 && (
                <div onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); goToStep2() } }}>
                  <div className="sess-field">
                    <label>Formation <span className="req">*</span></label>
                    <select name="formationId" value={form.formationId} onChange={handleInputChange} className={formErrors.formationId ? 'has-error' : ''}>
                      <option value="">-- Choisir une formation --</option>
                      {formations.filter(f => f.statut === 'ACTIVE').map(f => (
                        <option key={f.id} value={f.id}>{f.titre} ({f.reference}) — Durée: {f.dureeJours} jours</option>
                      ))}
                    </select>
                    {formErrors.formationId && <span className="sess-field-error">{formErrors.formationId}</span>}
                  </div>

                  <div className="sess-field">
                    <label>Date de début <span className="req">*</span></label>
                    <input type="date" name="dateDebut" value={form.dateDebut} onChange={handleInputChange} className={formErrors.dateDebut ? 'has-error' : ''} />
                    {formErrors.dateDebut && <span className="sess-field-error">{formErrors.dateDebut}</span>}
                  </div>

                  <div className="sess-form-row">
                    <div className="sess-field">
                      <label>Heure de début</label>
                      <input type="time" name="heureDebut" value={form.heureDebut} onChange={handleInputChange} />
                    </div>
                    <div className="sess-field">
                      <label>Heure de fin</label>
                      <input type="time" name="heureFin" value={form.heureFin} onChange={handleInputChange} className={formErrors.heureFin ? 'has-error' : ''} />
                      {formErrors.heureFin && <span className="sess-field-error">{formErrors.heureFin}</span>}
                    </div>
                  </div>

                  <div className="sess-field">
                    <label>Formateur référent <span className="req">*</span></label>
                    <select name="formateurId" value={form.formateurId} onChange={handleInputChange} className={formErrors.formateurId ? 'has-error' : ''}>
                      <option value="">-- Choisir un formateur --</option>
                      {formateurs.map(f => (
                        <option key={f.id} value={f.id}>{f.prenom} {f.nom} ({f.email})</option>
                      ))}
                    </select>
                    {formErrors.formateurId && <span className="sess-field-error">{formErrors.formateurId}</span>}
                  </div>

                  <div className="sess-form-row">
                    <div className="sess-field">
                      <label>Mode de session <span className="req">*</span></label>
                      <select name="modeSession" value={form.modeSession} onChange={handleInputChange}>
                        {Object.entries(MODE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sess-field">
                      <label>Participants prévus <span className="req">*</span></label>
                      <input type="number" name="nbParticipantsPrevu" value={form.nbParticipantsPrevu} disabled min="1" className={formErrors.nbParticipantsPrevu ? 'has-error' : ''} />
                      {formErrors.nbParticipantsPrevu && <span className="sess-field-error">{formErrors.nbParticipantsPrevu}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Logistics & Lieu */}
              {formStep === 2 && (
                <>
                  <div className="sess-field">
                    <label>Lieu <span className="optional">(Optionnel)</span></label>
                    <input type="text" name="lieu" value={form.lieu} onChange={handleInputChange} placeholder="Ex: Salle B, Paris or URL Teams" />
                  </div>

                  <div style={{ marginTop: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Services & Prestations
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                      {LOGISTICS_FIELDS.map(field => {
                        const checked = form[field] !== null && form[field] !== ''
                        return (
                          <div key={field} onClick={() => setForm(prev => ({ ...prev, [field]: checked ? null : 0 }))}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                              borderRadius: '8px', border: checked ? '1.5px solid var(--navy)' : '1.5px solid var(--gray-200)',
                              background: checked ? '#f0f4ff' : '#fff', cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}>
                            <div style={{
                              width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                              border: checked ? 'none' : '2px solid var(--gray-300)',
                              background: checked ? 'var(--navy)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {checked && <Check size={12} color="#fff" />}
                            </div>
                            <span style={{ flex: 1, fontSize: '13px', fontWeight: checked ? 600 : 400, color: checked ? 'var(--navy)' : 'var(--gray-700)' }}>
                              {LOGISTICS_LABELS[field]}
                            </span>
                            {checked && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={e => e.stopPropagation()}>
                                <input type="number" placeholder="0" min="0"
                                  value={form[field] || ''}
                                  onChange={e => setForm(prev => ({ ...prev, [field]: +e.target.value || 0 }))}
                                  style={{
                                    width: '90px', padding: '5px 8px', border: '1.5px solid var(--gray-200)',
                                    borderRadius: '6px', fontSize: '13px', textAlign: 'right',
                                  }} />
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-500)', minWidth: '14px' }}>€</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="sess-modal-footer" style={{ justifyContent: editingSession ? 'space-between' : 'flex-end' }}>
                {editingSession && (
                  <button type="button" className="sess-btn-delete" onClick={() => setDeleteConfirm(editingSession.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
                    background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5',
                    borderRadius: '9px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                  }}>
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {formStep === 1 ? (
                    <>
                      <button type="button" className="sess-btn-cancel" onClick={() => { setIsModalOpen(false); resetForm() }}>Annuler</button>
                      <button type="button" className="sess-btn-submit" onClick={goToStep2}>
                        Suivant <ArrowRight size={15} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="sess-btn-cancel" onClick={() => setFormStep(1)}>
                        <ArrowLeft size={15} /> Précédent
                      </button>
                      <button type="button" className="sess-btn-submit" disabled={isSubmitting} onClick={handleSubmit}>
                        {isSubmitting ? <><Loader2 size={16} className="spin" /> {editingSession ? 'Mise à jour...' : 'Planification...'}</>
                          : editingSession ? 'Mettre à jour' : 'Planifier la session'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Delete confirmation overlay */}
              {deleteConfirm && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(2px)', zIndex: 10, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', padding: '32px', borderRadius: '16px',
                }}>
                  <Trash2 size={36} style={{ color: '#dc2626', marginBottom: '12px' }} />
                  <p style={{ margin: '0 0 16px', fontSize: '15px', color: '#991b1b', fontWeight: 600, textAlign: 'center' }}>
                    Êtes-vous sûr de vouloir supprimer cette session ?
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => setDeleteConfirm(null)} className="sess-btn-cancel">
                      Annuler
                    </button>
                    <button type="button" onClick={() => handleDelete(deleteConfirm)} style={{
                      padding: '10px 20px', border: 'none', borderRadius: '9px',
                      background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      <Trash2 size={15} /> Confirmer la suppression
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  )
}
