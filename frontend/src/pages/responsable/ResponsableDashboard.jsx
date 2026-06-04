import { useState, useEffect } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import {
    BookOpen, Users, Banknote, Star, MoreVertical, Plus,
    ArrowUpRight, ClipboardList, Check, X, Clock, AlertCircle
} from 'lucide-react'
import './ResponsableDashboard.css'

const MONTHS_DATA = [
    { month: 'Jan', formations: 1 }, { month: 'Fév', formations: 2 },
    { month: 'Mar', formations: 3 }, { month: 'Avr', formations: 2 },
    { month: 'Mai', formations: 4 }, { month: 'Jun', formations: 2 },
]

const PIE_DATA = [
    { name: 'Formations Internes', value: 60, color: '#1B3A7A' },
    { name: 'Formations Externes', value: 40, color: '#F26522' },
]

const MOCK_FORMATIONS = [
    { id: 1, titre: 'Management Agile 2.0', ref: 'SFM-2024-04', type: 'Interne', dates: '15/05 - 18/05', participants: 12, budget: '4 500 DT', statut: 'ACTIVE' },
    { id: 2, titre: 'Cybersécurité Avancée', ref: 'SFM-2024-05', type: 'Externe', dates: '02/06 - 05/06', participants: 8, budget: '12 800 DT', statut: 'PLANIFIEE' },
]

const DEMANDES_RECENTES = [
    { id: 1, demandeur: 'Ali Ben Salah', avatar: 'AB', formation: 'Excel Avancé', date: '12 Mai 2024', priorite: 'URGENT', statut: 'EN_ATTENTE' },
    { id: 2, demandeur: 'Sonia Trabelsi', avatar: 'ST', formation: 'Leadership & Management', date: '10 Mai 2024', priorite: 'NORMAL', statut: 'EN_ATTENTE' },
    { id: 3, demandeur: 'Mehdi Chaabane', avatar: 'MC', formation: 'Power BI Dashboard', date: '09 Mai 2024', priorite: 'FAIBLE', statut: 'EN_ATTENTE' },
]

const PRIORITE_STYLE = {
    URGENT: { cls: 'prio-urgent', label: 'Urgent' },
    NORMAL: { cls: 'prio-normal', label: 'Normal' },
    FAIBLE: { cls: 'prio-faible', label: 'Faible' },
}

const STATUT_MAP = {
    ACTIVE: { label: 'ACTIF', cls: 'badge-active' },
    PLANIFIEE: { label: 'PLANIFIÉ', cls: 'badge-planned' },
    TERMINEE: { label: 'TERMINÉ', cls: 'badge-ended' },
    ANNULEE: { label: 'ANNULÉ', cls: 'badge-cancelled' },
}

export default function ResponsableDashboard() {
    const [demandes, setDemandes] = useState(DEMANDES_RECENTES)

    const handleStatut = (id, statut) => {
        setDemandes(d => d.map(item => item.id === id ? { ...item, statut } : item))
    }

    return (
        <div className="rd-page">
            {/* Header */}
            <div className="rd-header">
                <div>
                    <div className="rd-breadcrumb">Tableau de bord</div>
                    <h1>Bonjour 👋 — Vue Responsable Formation</h1>
                    <p>Supervision de votre département de formation.</p>
                </div>
                <div className="rd-quick-actions">
                    <button className="btn btn-ghost rd-qa-btn"><ClipboardList size={14} /> Nouvelle demande</button>
                    <button className="btn btn-primary"><Plus size={15} /> Nouvelle Formation</button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="rd-kpi-grid stagger">
                <KpiCard icon={<BookOpen size={20} />} label="Formations actives" value="7" sub="+2 ce mois" color="navy" trend />
                <KpiCard icon={<Users size={20} />} label="Participants" value="64" sub="+8% global" color="orange" trend />
                <KpiCard icon={<Banknote size={20} />} label="Budget utilisé (54%)" value="18 200 DT" sub={<ProgressBar value={54} />} color="blue" />
                <KpiCard
                    icon={<ClipboardList size={20} />}
                    label="Demandes en attente"
                    value={demandes.filter(d => d.statut === 'EN_ATTENTE').length}
                    sub="À traiter"
                    color="warn"
                    urgent
                />
            </div>

            {/* Charts row */}
            <div className="rd-charts-row">
                <div className="card rd-chart-card">
                    <div className="rd-chart-header">
                        <h3>Formations par mois</h3>
                        <a href="#" className="chart-link">Voir rapport complet</a>
                    </div>
                    <ResponsiveContainer width="100%" height={190}>
                        <BarChart data={MONTHS_DATA} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f8" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9aa3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#9aa3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 13 }} cursor={{ fill: 'rgba(27,58,122,.05)' }} />
                            <Bar dataKey="formations" fill="#1B3A7A" radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card rd-pie-card">
                    <div className="rd-chart-header"><h3>Répartition<br />Interne / Externe</h3></div>
                    <div className="pie-wrap">
                        <PieChart width={170} height={170}>
                            <Pie data={PIE_DATA} cx={80} cy={80} innerRadius={52} outerRadius={76} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                                {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                        </PieChart>
                        <div className="pie-center-label">
                            <span className="pie-total">7</span>
                            <span className="pie-total-sub">total</span>
                        </div>
                    </div>
                    <div className="pie-legend">
                        {PIE_DATA.map(d => (
                            <div key={d.name} className="pie-legend-item">
                                <span className="pie-dot" style={{ background: d.color }} />
                                <span>{d.name}</span>
                                <strong>{d.value}%</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Formations table */}
            <div className="card rd-table-card">
                <div className="table-header">
                    <h3>Formations Récentes</h3>
                    <button className="btn btn-primary"><Plus size={15} /> Nouvelle Formation</button>
                </div>
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>FORMATION</th><th>TYPE</th><th>DATES</th>
                                <th>PARTICIPANTS</th><th>BUDGET</th><th>STATUT</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_FORMATIONS.map(f => {
                                const s = STATUT_MAP[f.statut] ?? { label: f.statut, cls: 'badge-ended' }
                                return (
                                    <tr key={f.id}>
                                        <td>
                                            <div className="formation-cell">
                                                <span className="formation-title">{f.titre}</span>
                                                <span className="formation-ref">Réf: {f.ref}</span>
                                            </div>
                                        </td>
                                        <td><span className="type-pill">{f.type}</span></td>
                                        <td className="date-cell">{f.dates}</td>
                                        <td><strong>{f.participants}</strong></td>
                                        <td className="budget-cell">{f.budget}</td>
                                        <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                                        <td><button className="action-btn"><MoreVertical size={16} /></button></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Demandes récentes */}
            <div className="card rd-demandes-card">
                <div className="table-header">
                    <h3>Demandes de formation récentes</h3>
                    <a href="/responsable/demandes" className="chart-link">Voir toutes →</a>
                </div>
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>DEMANDEUR</th><th>FORMATION SOUHAITÉE</th>
                                <th>DATE</th><th>PRIORITÉ</th><th>STATUT</th><th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {demandes.map(d => {
                                const p = PRIORITE_STYLE[d.priorite]
                                return (
                                    <tr key={d.id}>
                                        <td>
                                            <div className="rd-user">
                                                <div className="rd-avatar">{d.avatar}</div>
                                                <span className="formation-title">{d.demandeur}</span>
                                            </div>
                                        </td>
                                        <td><span className="formation-title">{d.formation}</span></td>
                                        <td className="date-cell">{d.date}</td>
                                        <td><span className={`prio-badge ${p.cls}`}>{p.label}</span></td>
                                        <td>
                                            {d.statut === 'EN_ATTENTE' && <span className="badge badge-planned">En attente</span>}
                                            {d.statut === 'APPROUVEE' && <span className="badge badge-active">Approuvée</span>}
                                            {d.statut === 'REJETEE' && <span className="badge badge-cancelled">Rejetée</span>}
                                        </td>
                                        <td>
                                            {d.statut === 'EN_ATTENTE' && (
                                                <div className="rd-demandeactions">
                                                    <button className="rd-approve-btn" onClick={() => handleStatut(d.id, 'APPROUVEE')} title="Approuver">
                                                        <Check size={14} /> Approuver
                                                    </button>
                                                    <button className="rd-reject-btn" onClick={() => handleStatut(d.id, 'REJETEE')} title="Rejeter">
                                                        <X size={14} /> Rejeter
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function KpiCard({ icon, label, value, sub, color, trend, urgent }) {
    return (
        <div className={`card rd-kpi rd-kpi-${color} ${urgent ? 'urgent' : ''}`}>
            <div className="rd-kpi-top">
                <div className="rd-kpi-icon">{icon}</div>
                {trend && <span className="kpi-trend"><ArrowUpRight size={13} /></span>}
                {urgent && <span className="urgent-dot"><AlertCircle size={14} /></span>}
            </div>
            <div className="rd-kpi-label">{label}</div>
            <div className="rd-kpi-value">{value}</div>
            <div className="rd-kpi-sub">{sub}</div>
        </div>
    )
}

function ProgressBar({ value }) {
    return (
        <div className="progress-bar-wrap">
            <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${value}%` }} />
            </div>
        </div>
    )
}
