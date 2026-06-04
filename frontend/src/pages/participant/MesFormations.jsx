import { useState } from 'react'
import { Clock, User, ChevronRight, Download, Search } from 'lucide-react'
import './MesFormations.css'

const FORMATIONS = [
    {
        id: 1,
        titre: 'Expertise Data Science & IA Appliquée',
        type: 'INTERNE',
        statut: 'EN_COURS',
        formateur: 'Jean-Pierre Lambert',
        duree: 45,
        progression: 65,
        date: 'Finit le 12 Oct 2024',
        img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
        certif: false,
    },
    {
        id: 2,
        titre: 'Leadership & Management Transversal',
        type: 'EXTERNE',
        statut: 'PLANIFIEE',
        formateur: 'Sarah Delacroix',
        duree: 24,
        progression: 0,
        date: 'Débute le 04 Nov 2024',
        img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80',
        certif: false,
    },
    {
        id: 3,
        titre: 'Communication Non-Violente en Entreprise',
        type: 'INTERNE',
        statut: 'TERMINEE',
        formateur: 'Marc Bertrand',
        duree: 12,
        progression: 100,
        date: 'Terminé',
        img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
        certif: true,
    },
    {
        id: 4,
        titre: 'Design Thinking : Innovation centrée utilisateur',
        type: 'EXTERNE',
        statut: 'EN_COURS',
        formateur: 'Léa Vasseur',
        duree: 16,
        progression: 12,
        date: 'Finit le 30 Oct 2024',
        img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80',
        certif: false,
    },
]

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

    const filtered = FORMATIONS.filter(f => {
        const matchTab = !FILTER_MAP[tab] || f.statut === FILTER_MAP[tab]
        const matchSearch = f.titre.toLowerCase().includes(search.toLowerCase())
        return matchTab && matchSearch
    })

    const terminées = FORMATIONS.filter(f => f.statut === 'TERMINEE').length
    const enCours = FORMATIONS.filter(f => f.statut === 'EN_COURS').length
    const planifiées = FORMATIONS.filter(f => f.statut === 'PLANIFIEE').length

    return (
        <div className="mes-formations">
            <h1 className="mf-title">Mes Formations</h1>

            {/* Stats summary */}
            <div className="mf-stats card">
                <div className="mf-stat">
                    <span className="mf-stat-icon mf-stat-green">✓</span>
                    <div>
                        <div className="mf-stat-val">Terminées</div>
                        <div className="mf-stat-num">{terminées} Formations</div>
                    </div>
                </div>
                <div className="mf-stat-divider" />
                <div className="mf-stat">
                    <span className="mf-stat-icon mf-stat-orange">↗</span>
                    <div>
                        <div className="mf-stat-val">En cours</div>
                        <div className="mf-stat-num">{enCours} Formations</div>
                    </div>
                </div>
                <div className="mf-stat-divider" />
                <div className="mf-stat">
                    <span className="mf-stat-icon mf-stat-gray">📅</span>
                    <div>
                        <div className="mf-stat-val">Planifiées</div>
                        <div className="mf-stat-num">{planifiées} Formation</div>
                    </div>
                </div>
            </div>

            {/* Tabs + search */}
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

            {/* Cards grid */}
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

    return (
        <div className="mf-card card">
            {/* Image */}
            <div className="mf-card-img">
                <img src={f.img} alt={f.titre} />
                <span className={`ftype-badge ftype-${f.type.toLowerCase()}`}>{f.type}</span>
                <span className={`mf-statut-badge ${s.cls}`}>{s.label}</span>
            </div>

            {/* Body */}
            <div className="mf-card-body">
                <h3 className="mf-card-title">{f.titre}</h3>

                <div className="mf-card-meta">
                    <div className="mf-formateur">
                        <div className="mf-avatar">{f.formateur[0]}</div>
                        <span>{f.formateur}</span>
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
                    <span className="mf-date">{f.date}</span>
                    {f.certif
                        ? <button className="btn-certif"><Download size={13} /> Télécharger l'attestation</button>
                        : <button className="btn-voir">Voir détails <ChevronRight size={13} /></button>
                    }
                </div>
            </div>
        </div>
    )
}
