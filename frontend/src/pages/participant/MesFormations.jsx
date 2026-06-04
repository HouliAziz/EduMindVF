import { useState, useEffect } from 'react'
import { Clock, ChevronRight, Download, Search, Loader2 } from 'lucide-react'
import { participantsAPI } from '../../services/api'
import './MesFormations.css'

const TABS = ['Toutes', 'En cours', 'Planifiées', 'Terminées']

const STATUT_MAP = {
    EN_COURS: { label: 'EN COURS', cls: 'stt-encours' },
    PLANIFIEE: { label: 'PLANIFIÉE', cls: 'stt-planifiee' },
    TERMINEE: { label: 'TERMINÉE', cls: 'stt-terminee' },
}

const FILTER_MAP = {
    'Toutes': null,
    'En cours': 'EN_COURS',
    'Planifiées': 'PLANIFIEE',
    'Terminées': 'TERMINEE',
}

export default function MesFormations() {
    const [tab, setTab] = useState('Toutes')
    const [search, setSearch] = useState('')
    const [formations, setFormations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        participantsAPI.mesFormations()
            .then(({ data }) => setFormations(data || []))
            .catch(err => console.error('Formations API error:', err))
            .finally(() => setLoading(false))
    }, [])

    const filtered = formations.filter(f => {
        const matchTab = !FILTER_MAP[tab] || f.statut === FILTER_MAP[tab]
        const matchSearch = f.titre.toLowerCase().includes(search.toLowerCase())
        return matchTab && matchSearch
    })

    const terminées = formations.filter(f => f.statut === 'TERMINEE').length
    const enCours = formations.filter(f => f.statut === 'EN_COURS').length
    const planifiées = formations.filter(f => f.statut === 'PLANIFIEE').length

    if (loading) {
        return (
            <div className="mes-formations" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '10px', color: 'var(--gray-400)' }}>
                <Loader2 size={24} className="spin" />
                <span>Chargement...</span>
            </div>
        )
    }

    return (
        <div className="mes-formations">
            <h1 className="mf-title">Mes Formations</h1>

            <div className="mf-stats card">
                <div className="mf-stat">
                    <span className="mf-stat-icon mf-stat-green">✓</span>
                    <div>
                        <div className="mf-stat-val">Terminées</div>
                        <div className="mf-stat-num">{terminées} Formation{terminées > 1 ? 's' : ''}</div>
                    </div>
                </div>
                <div className="mf-stat-divider" />
                <div className="mf-stat">
                    <span className="mf-stat-icon mf-stat-orange">↗</span>
                    <div>
                        <div className="mf-stat-val">En cours</div>
                        <div className="mf-stat-num">{enCours} Formation{enCours > 1 ? 's' : ''}</div>
                    </div>
                </div>
                <div className="mf-stat-divider" />
                <div className="mf-stat">
                    <span className="mf-stat-icon mf-stat-gray">📅</span>
                    <div>
                        <div className="mf-stat-val">Planifiées</div>
                        <div className="mf-stat-num">{planifiées} Formation{planifiées > 1 ? 's' : ''}</div>
                    </div>
                </div>
            </div>

            <div className="mf-toolbar">
                <div className="mf-tabs">
                    {TABS.map(t => (
                        <button key={t} className={`mf-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
                    ))}
                </div>
                <div className="mf-search">
                    <Search size={13} />
                    <input placeholder="Rechercher une formation..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {filtered.length === 0
                ? <div className="mf-empty">
                    <span>🎓</span>
                    <p>Aucune formation trouvée</p>
                </div>
                : <div className="mf-grid stagger">
                    {filtered.map(f => <FormationCard key={f.id} f={f} />)}
                </div>
            }
        </div>
    )
}

function FormationCard({ f }) {
    const s = STATUT_MAP[f.statut]
    const progColor = f.progression === 100 ? 'var(--success)' : f.progression > 50 ? 'var(--navy)' : 'var(--orange)'
    const initials = f.titre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

    return (
        <div className="mf-card card">
            <div className="mf-card-img">
                <div className="mf-card-placeholder">{initials}</div>
                <span className={`ftype-badge ftype-${f.type?.toLowerCase()}`}>{f.type}</span>
                <span className={`mf-statut-badge ${s.cls}`}>{s.label}</span>
            </div>

            <div className="mf-card-body">
                <h3 className="mf-card-title">{f.titre}</h3>

                <div className="mf-card-meta">
                    <div className="mf-formateur">
                        <div className="mf-avatar">{f.formateur?.[0] || '?'}</div>
                        <span>{f.formateur || 'Non assigné'}</span>
                    </div>
                    <span className="mf-duree"><Clock size={12} /> {f.duree}h</span>
                </div>

                <div className="mf-prog-wrap">
                    <div className="mf-prog-label">
                        <span>Progression</span>
                        <strong style={{ color: progColor }}>{f.progression}%</strong>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${f.progression}%`, background: progColor }} />
                    </div>
                </div>

                <div className="mf-card-footer">
                    <span className="mf-date">{f.dateLabel || '—'}</span>
                    {f.certif
                        ? <button className="btn-certif"><Download size={13} /> Télécharger l'attestation</button>
                        : <button className="btn-voir">Voir détails <ChevronRight size={13} /></button>
                    }
                </div>
            </div>
        </div>
    )
}
