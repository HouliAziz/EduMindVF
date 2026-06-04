import { useState } from 'react'
import { Users, MapPin, Calendar, ChevronRight, Eye, ClipboardList, Star } from 'lucide-react'
import './MesSessions.css'

const SESSIONS = [
    { id: 1, titre: 'Management Agile 2.0', formation: 'Leadership & Management', dateDebut: '14 Oct 2024', dateFin: '16 Oct 2024', salle: 'Salle A201', inscrits: 12, capacite: 15, statut: 'EN_COURS', note: 4.8 },
    { id: 2, titre: 'Data Science Fondamentaux', formation: 'Expertise Data Science', dateDebut: '21 Oct 2024', dateFin: '25 Oct 2024', salle: 'Lab Info', inscrits: 8, capacite: 12, statut: 'A_VENIR', note: null },
    { id: 3, titre: 'Communication Non-Violente', formation: 'Soft Skills Entreprise', dateDebut: '01 Oct 2024', dateFin: '03 Oct 2024', salle: 'Salle C102', inscrits: 10, capacite: 10, statut: 'TERMINEE', note: 4.6 },
    { id: 4, titre: 'Design Thinking Workshop', formation: 'Innovation & Créativité', dateDebut: '28 Oct 2024', dateFin: '29 Oct 2024', salle: 'Salle B204', inscrits: 6, capacite: 14, statut: 'A_VENIR', note: null },
    { id: 5, titre: 'Leadership Situationnel', formation: 'Leadership & Management', dateDebut: '05 Sep 2024', dateFin: '07 Sep 2024', salle: 'Salle A201', inscrits: 13, capacite: 15, statut: 'TERMINEE', note: 4.9 },
]

const STATUT_STYLE = {
    EN_COURS: { label: 'EN COURS', cls: 'badge-active' },
    A_VENIR: { label: 'À VENIR', cls: 'badge-planned' },
    TERMINEE: { label: 'TERMINÉE', cls: 'badge-ended' },
}

const TABS = ['Toutes', 'À venir', 'En cours', 'Terminées']
const FILTER_MAP = { 'Toutes': null, 'À venir': 'A_VENIR', 'En cours': 'EN_COURS', 'Terminées': 'TERMINEE' }

export default function MesSessions() {
    const [tab, setTab] = useState('Toutes')

    const filtered = SESSIONS.filter(s => !FILTER_MAP[tab] || s.statut === FILTER_MAP[tab])

    const totalApprenants = SESSIONS.reduce((acc, s) => acc + s.inscrits, 0)
    const avgNote = (SESSIONS.filter(s => s.note).reduce((acc, s) => acc + s.note, 0) / SESSIONS.filter(s => s.note).length).toFixed(1)

    return (
        <div className="ms-page">
            {/* Header */}
            <div className="ms-header">
                <div>
                    <h1>Mes Sessions <span className="ms-count-badge">{SESSIONS.length}</span></h1>
                    <p>Gérez vos sessions de formation et suivez la progression de vos apprenants.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="ms-stats stagger">
                <div className="card ms-stat">
                    <div className="ms-stat-icon ms-icon-navy"><Calendar size={18} /></div>
                    <div>
                        <div className="ms-stat-label">Total sessions</div>
                        <div className="ms-stat-val">{SESSIONS.length}</div>
                    </div>
                </div>
                <div className="card ms-stat">
                    <div className="ms-stat-icon ms-icon-orange"><Users size={18} /></div>
                    <div>
                        <div className="ms-stat-label">Apprenants formés</div>
                        <div className="ms-stat-val">{totalApprenants}</div>
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
                        <div className="ms-stat-val">{SESSIONS.filter(s => s.statut === 'A_VENIR').length}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="ms-tabs">
                {TABS.map(t => (
                    <button key={t} className={`ms-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
                ))}
            </div>

            {/* Sessions list */}
            <div className="ms-list stagger">
                {filtered.map(s => <SessionRow key={s.id} s={s} />)}
            </div>
        </div>
    )
}

function SessionRow({ s }) {
    const st = STATUT_STYLE[s.statut]
    const fillPct = Math.round((s.inscrits / s.capacite) * 100)
    const fillColor = fillPct >= 90 ? 'var(--danger)' : fillPct >= 70 ? 'var(--orange)' : 'var(--navy)'

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

                <div className="ms-row-capacity">
                    <div className="ms-cap-label">
                        <Users size={13} />
                        <span><strong>{s.inscrits}</strong> / {s.capacite}</span>
                    </div>
                    <div className="progress-bar" style={{ width: 120 }}>
                        <div className="progress-fill" style={{ width: `${fillPct}%`, background: fillColor }} />
                    </div>
                    <span className="ms-cap-pct" style={{ color: fillColor }}>{fillPct}%</span>
                </div>

                {s.note && (
                    <div className="ms-row-note">
                        <Star size={14} fill="var(--orange)" color="var(--orange)" />
                        <span className="ms-note-val">{s.note}</span>
                        <span className="ms-note-sub">/5</span>
                    </div>
                )}

                <div className="ms-row-actions">
                    <button className="ms-action-btn"><Eye size={14} /> Voir apprenants</button>
                    <button className="ms-action-btn"><ClipboardList size={14} /> Présences</button>
                    <button className="ms-action-btn ms-action-primary"><Star size={14} /> Évaluations</button>
                </div>
            </div>
        </div>
    )
}
