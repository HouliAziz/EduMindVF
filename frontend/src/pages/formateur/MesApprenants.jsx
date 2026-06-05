import { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronUp, Filter, Loader2, Star, Save } from 'lucide-react'
import { formateurAPI } from '../../services/api'
import './MesApprenants.css'

export default function MesApprenants() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [filterFormation, setFilterFormation] = useState('all')
  const [apprenants, setApprenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [noteDrafts, setNoteDrafts] = useState({})
  const [savingNote, setSavingNote] = useState(null)

  useEffect(() => {
    setLoading(true)
    formateurAPI.apprenants()
      .then(({ data }) => setApprenants(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const formations = [...new Set(apprenants.flatMap(a => a.inscriptions.map(i => i.formation)))]

  const filtered = apprenants.filter(a =>
    (`${a.prenom} ${a.nom}`).toLowerCase().includes(search.toLowerCase()) &&
    (filterFormation === 'all' || a.inscriptions.some(i => i.formation === filterFormation))
  )

  const toggle = (id) => {
    setExpanded(e => e === id ? null : id)
    setNoteDrafts({})
  }

  const handleNoteSave = async (inscriptionId) => {
    const val = noteDrafts[inscriptionId]
    if (val === undefined) return
    const note = val === '' ? null : parseFloat(val)
    if (note !== null && (isNaN(note) || note < 0 || note > 5)) return
    setSavingNote(inscriptionId)
    try {
      await formateurAPI.updateNote({ inscriptionId, noteFinale: note })
      setApprenants(prev => prev.map(p => ({
        ...p,
        inscriptions: p.inscriptions.map(i =>
          i.inscriptionId === inscriptionId ? { ...i, noteFinale: note } : i
        )
      })))
    } catch (e) {
      alert('Erreur lors de la sauvegarde de la note.')
    }
    setSavingNote(null)
  }

  if (loading) {
    return (
      <div className="ma-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '10px', color: 'var(--gray-400)' }}>
        <Loader2 size={24} className="spin" />
        <span>Chargement des apprenants...</span>
      </div>
    )
  }

  return (
    <div className="ma-page">
      <div className="ma-header">
        <div>
          <h1>Mes Apprenants</h1>
          <p>Suivez la progression et les résultats de vos apprenants.</p>
        </div>
        <div className="ma-header-stats">
          <span className="ma-total-badge">{apprenants.length} apprenants</span>
        </div>
      </div>

      <div className="ma-toolbar card">
        <div className="ma-search">
          <Search size={14} />
          <input placeholder="Rechercher un apprenant..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="ma-filter">
          <Filter size={14} />
          <select value={filterFormation} onChange={e => setFilterFormation(e.target.value)}>
            <option value="all">Toutes les formations</option>
            {formations.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
      </div>

      <div className="card ma-table-card">
        <table className="ma-table">
          <thead>
            <tr>
              <th>APPRENANT</th>
              <th>FORMATION(S)</th>
              <th>PRÉSENCES</th>
              <th>NOTE FINALE</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const isOpen = expanded === a.id
              const presPct = a.total > 0 ? Math.round((a.presences / a.total) * 100) : 0
              const allNotes = a.inscriptions.map(i => i.noteFinale).filter(n => n !== null)
              const avgNote = allNotes.length > 0 ? (allNotes.reduce((s, n) => s + n, 0) / allNotes.length).toFixed(1) : null
              const firstFormation = a.inscriptions[0]?.formation
              const extraCount = a.inscriptions.length - 1
              return (
                <tr key={a.id} className={isOpen ? 'ma-row-expanded' : ''}>
                  <td>
                    <div className="ma-user">
                      <div className="ma-avatar" style={{ background: a.color }}>{a.initials}</div>
                      <span className="ma-name">{a.prenom} {a.nom}</span>
                    </div>
                  </td>
                  <td>
                    <span className="ma-formation-badge">{firstFormation}</span>
                    {extraCount > 0 && <span className="ma-formation-extra">+{extraCount}</span>}
                  </td>
                  <td>
                    <div className="ma-pres">
                      <span className="ma-pres-count">{a.presences}/{a.total}</span>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill" style={{ width: `${presPct}%`, background: presPct < 50 ? 'var(--danger)' : presPct < 75 ? 'var(--orange)' : 'var(--success)' }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    {avgNote !== null ? <><Star size={12} fill="var(--orange)" color="var(--orange)" /> {avgNote}/5</> : <span className="ma-note-na">—</span>}
                  </td>
                  <td>
                    <button className="ma-expand-btn" onClick={() => toggle(a.id)}>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {expanded && filtered.filter(a => a.id === expanded).map(a => (
        <div key={a.id} className="card ma-detail-panel">
          {a.inscriptions.map(ins => {
            const pct = ins.total > 0 ? Math.round((ins.presences / ins.total) * 100) : 0
            const draftVal = noteDrafts[ins.inscriptionId] !== undefined ? noteDrafts[ins.inscriptionId] : (ins.noteFinale ?? '')
            return (
              <div key={ins.inscriptionId} className="ma-ins-section">
                <h4>{ins.formation}</h4>
                <div className="ma-ins-row">
                  <div className="ma-ins-col">
                    <strong>Présences</strong>
                    <div className="ma-session-list">
                      {ins.sessions.map(s => (
                        <div key={s.sessionId} className={`ma-session-item ${s.present ? 'present' : 'absent'}`}>
                          <span className={`ma-sess-dot ${s.present ? 'dot-present' : 'dot-absent'}`} />
                          <span className="ma-sess-date">{s.date}</span>
                          <span className="ma-sess-titre">{s.titre}</span>
                        </div>
                      ))}
                    </div>
                    <div className="ma-ins-pres-summary">{ins.presences}/{ins.total} présences ({pct}%)</div>
                  </div>
                  <div className="ma-ins-col">
                    <strong>Note finale</strong>
                    <div className="ma-note-block">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.5"
                        value={draftVal}
                        className="ma-note-input-lg"
                        onChange={e => setNoteDrafts(d => ({ ...d, [ins.inscriptionId]: e.target.value }))}
                      />
                      <button
                        className="btn btn-navy ma-save-btn"
                        onClick={() => handleNoteSave(ins.inscriptionId)}
                        disabled={savingNote === ins.inscriptionId}
                      >
                        <Save size={14} />
                        {savingNote === ins.inscriptionId ? '...' : 'Enregistrer'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}