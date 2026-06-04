import { useState } from 'react'
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react'
import './MesApprenants.css'

const APPRENANTS = [
    { id: 1, prenom: 'Jean-Marc', nom: 'Laurent', formation: 'Management Agile 2.0', presences: 6, total: 8, note: 4.5, statut: 'EN_COURS', initials: 'JL', color: '#1B3A7A' },
    { id: 2, prenom: 'Sarah', nom: 'Dupont', formation: 'Management Agile 2.0', presences: 8, total: 8, note: 4.8, statut: 'CERTIFIE', initials: 'SD', color: '#F26522' },
    { id: 3, prenom: 'Mohamed', nom: 'Aziz', formation: 'Data Science Fondamentaux', presences: 4, total: 6, note: 3.9, statut: 'EN_COURS', initials: 'MA', color: '#10b981' },
    { id: 4, prenom: 'Léa', nom: 'Vasseur', formation: 'Design Thinking Workshop', presences: 2, total: 4, note: null, statut: 'A_VENIR', initials: 'LV', color: '#6366f1' },
    { id: 5, prenom: 'Pierre', nom: 'Martin', formation: 'Management Agile 2.0', presences: 3, total: 8, note: 2.5, statut: 'ABANDON', initials: 'PM', color: '#9aa3b8' },
    { id: 6, prenom: 'Camille', nom: 'Bernard', formation: 'Leadership Situationnel', presences: 6, total: 6, note: 4.9, statut: 'CERTIFIE', initials: 'CB', color: '#F26522' },
]

const STATUT_STYLE = {
    EN_COURS: { label: 'En cours', cls: 'badge-active' },
    CERTIFIE: { label: 'Certifié', cls: 'badge-cert' },
    A_VENIR: { label: 'À venir', cls: 'badge-planned' },
    ABANDON: { label: 'Abandon', cls: 'badge-cancelled' },
}

export default function MesApprenants() {
    const [search, setSearch] = useState('')
    const [expanded, setExpanded] = useState(null)
    const [filterSession, setFilterSession] = useState('all')

    const sessions = [...new Set(APPRENANTS.map(a => a.formation))]

    const filtered = APPRENANTS.filter(a =>
        (`${a.prenom} ${a.nom}`).toLowerCase().includes(search.toLowerCase()) &&
        (filterSession === 'all' || a.formation === filterSession)
    )

    const toggle = (id) => setExpanded(e => e === id ? null : id)

    return (
        <div className="ma-page">
            {/* Header */}
            <div className="ma-header">
                <div>
                    <h1>Mes Apprenants</h1>
                    <p>Suivez la progression et les résultats de vos apprenants.</p>
                </div>
                <div className="ma-header-stats">
                    <span className="ma-total-badge">{APPRENANTS.length} apprenants</span>
                    <span className="ma-cert-badge">{APPRENANTS.filter(a => a.statut === 'CERTIFIE').length} certifiés</span>
                </div>
            </div>

            {/* Toolbar */}
            <div className="ma-toolbar card">
                <div className="ma-search">
                    <Search size={14} />
                    <input placeholder="Rechercher un apprenant..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="ma-filter">
                    <Filter size={14} />
                    <select value={filterSession} onChange={e => setFilterSession(e.target.value)}>
                        <option value="all">Toutes les sessions</option>
                        {sessions.map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card ma-table-card">
                <table className="ma-table">
                    <thead>
                        <tr>
                            <th>APPRENANT</th>
                            <th>FORMATION</th>
                            <th>PRÉSENCES</th>
                            <th>NOTE FINALE</th>
                            <th>STATUT</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(a => {
                            const isOpen = expanded === a.id
                            const st = STATUT_STYLE[a.statut]
                            const presPct = Math.round((a.presences / a.total) * 100)
                            return (
                                <>
                                    <tr key={a.id} className={`ma-row ${isOpen ? 'expanded' : ''}`} onClick={() => toggle(a.id)}>
                                        <td>
                                            <div className="ma-user">
                                                <div className="ma-avatar" style={{ background: a.color }}>{a.initials}</div>
                                                <div>
                                                    <div className="ma-name">{a.prenom} {a.nom}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="ma-formation">{a.formation}</span></td>
                                        <td>
                                            <div className="ma-pres">
                                                <span className="ma-pres-count">{a.presences}/{a.total}</span>
                                                <div className="progress-bar" style={{ width: 80 }}>
                                                    <div className="progress-fill" style={{ width: `${presPct}%`, background: presPct < 50 ? 'var(--danger)' : presPct < 75 ? 'var(--orange)' : 'var(--success)' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {a.note
                                                ? <span className="ma-note" style={{ color: a.note >= 4 ? 'var(--success)' : a.note >= 3 ? 'var(--warning)' : 'var(--danger)' }}>★ {a.note}/5</span>
                                                : <span className="ma-note-na">—</span>
                                            }
                                        </td>
                                        <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                                        <td>
                                            <button className="ma-expand-btn">
                                                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </td>
                                    </tr>
                                    {isOpen && (
                                        <tr key={`${a.id}-detail`} className="ma-detail-row">
                                            <td colSpan={6}>
                                                <div className="ma-detail">
                                                    <div className="ma-detail-section">
                                                        <h4>Présences</h4>
                                                        <div className="ma-attendance-grid">
                                                            {Array.from({ length: a.total }).map((_, i) => (
                                                                <div key={i} className={`ma-att-dot ${i < a.presences ? 'present' : 'absent'}`} title={`Séance ${i + 1}`} />
                                                            ))}
                                                        </div>
                                                        <span className="ma-att-legend"><span className="dot-present" /> Présent &nbsp; <span className="dot-absent" /> Absent</span>
                                                    </div>
                                                    <div className="ma-detail-section">
                                                        <h4>Notes</h4>
                                                        <div className="ma-notes-form">
                                                            <textarea className="ma-notes-input" placeholder="Ajouter une note sur cet apprenant..." rows={3} />
                                                            <button className="btn btn-navy" style={{ padding: '8px 16px', fontSize: 12 }}>Enregistrer</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
