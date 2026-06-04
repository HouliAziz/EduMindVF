import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import {
    BookOpen, Users, Banknote, MoreVertical, Plus,
    ArrowUpRight, ClipboardList, AlertCircle, Loader2
} from 'lucide-react'
import { responsableAPI } from '../../services/api'
import './ResponsableDashboard.css'

const MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

const STATUT_MAP = {
    ACTIVE:    { label: 'ACTIVE',   cls: 'badge-active' },
    EN_ATTENTE:{ label: 'EN ATTENTE', cls: 'badge-draft' },
    BROUILLON: { label: 'BROUILLON', cls: 'badge-draft' },
    PLANIFIEE: { label: 'PLANIFIÉ', cls: 'badge-planned' },
    TERMINEE:  { label: 'TERMINÉ',  cls: 'badge-ended' },
    ARCHIVEE:  { label: 'ARCHIVÉE', cls: 'badge-ended' },
    VALIDEE:   { label: 'VALIDÉE',  cls: 'badge-planned' },
    REJETEE:   { label: 'REJETÉ',   cls: 'badge-cancelled' },
}

export default function ResponsableDashboard() {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        responsableAPI.dashboard()
            .then(({ data }) => setData(data))
            .catch(err => console.error('Error loading responsable dashboard:', err))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="rd-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '10px', color: 'var(--gray-400)' }}>
                <Loader2 size={24} className="spin" />
                <span>Chargement du tableau de bord...</span>
            </div>
        )
    }

    if (!data) return null

    const { kpis, formationsParMois, interneExterne, formationsRecentes, formationsEnAttente } = data

    const pieData = [
        { name: 'Formations Internes', value: interneExterne?.interne || 0, color: '#1B3A7A' },
        { name: 'Formations Externes', value: interneExterne?.externe || 0, color: '#F26522' },
    ]

    const formatBudget = (val) => {
        if (val == null) return 'N/A'
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val)
    }

    const formatDate = (d) => {
        if (!d) return '—'
        const parts = d.split('-')
        return `${parts[2]}/${parts[1]}/${parts[0]}`
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
                    <button className="btn btn-primary" onClick={() => navigate('/responsable/formations')}><Plus size={15} /> Nouvelle Formation</button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="rd-kpi-grid stagger">
                <KpiCard icon={<BookOpen size={20} />} label="Formations actives" value={kpis.formationsActives || 0} sub="En cours" color="navy" trend />
                <KpiCard icon={<Users size={20} />} label="Participants" value={kpis.totalParticipants || 0} sub="Inscrits" color="orange" trend />
                <KpiCard
                    icon={<Banknote size={20} />}
                    label={`Budget utilisé (${kpis.budgetUtilise || 0}%)`}
                    value={formatBudget(kpis.depensesTotal)}
                    sub={<ProgressBar value={kpis.budgetUtilise || 0} />}
                    color="blue"
                />
                <KpiCard
                    icon={<ClipboardList size={20} />}
                    label="Demandes en attente"
                    value={kpis.demandesEnAttente || 0}
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
                    </div>
                    <ResponsiveContainer width="100%" height={190}>
                        <BarChart data={formationsParMois || []} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f8" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9aa3b8' }} axisLine={false} tickLine={false}
                                tickFormatter={m => MONTH_NAMES[m - 1] || m} />
                            <YAxis tick={{ fontSize: 12, fill: '#9aa3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 13 }}
                                cursor={{ fill: 'rgba(27,58,122,.05)' }}
                                labelFormatter={m => MONTH_NAMES[m - 1] || m} />
                            <Bar dataKey="count" name="Formations" fill="#1B3A7A" radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card rd-pie-card">
                    <div className="rd-chart-header"><h3>Répartition<br />Interne / Externe</h3></div>
                    <div className="pie-wrap">
                        <PieChart width={170} height={170}>
                            <Pie data={pieData} cx={80} cy={80} innerRadius={52} outerRadius={76} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                        </PieChart>
                        <div className="pie-center-label">
                            <span className="pie-total">{(interneExterne?.interne || 0) + (interneExterne?.externe || 0)}</span>
                            <span className="pie-total-sub">total</span>
                        </div>
                    </div>
                    <div className="pie-legend">
                        {pieData.map(d => (
                            <div key={d.name} className="pie-legend-item">
                                <span className="pie-dot" style={{ background: d.color }} />
                                <span>{d.name}</span>
                                <strong>{d.value}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Formations table */}
            <div className="card rd-table-card">
                <div className="table-header">
                    <h3>Formations Récentes</h3>
                </div>
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>FORMATION</th><th>TYPE</th><th>DATES</th><th>STATUT</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(formationsRecentes || []).map(f => {
                                const s = STATUT_MAP[f.statut] ?? { label: f.statut, cls: 'badge-ended' }
                                const typeLabel = f.typeFormation === 'EXTERNE' ? 'Externe' : 'Interne'
                                return (
                                    <tr key={f.id}>
                                        <td>
                                            <div className="formation-cell">
                                                <span className="formation-title">{f.titre}</span>
                                                <span className="formation-ref">Réf: {f.reference || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td><span className={`type-pill ${f.typeFormation === 'EXTERNE' ? 'type-pill--externe' : ''}`}>{typeLabel}</span></td>
                                        <td className="date-cell">{f.dateDebut ? `${formatDate(f.dateDebut)} → ${formatDate(f.dateFin)}` : '—'}</td>
                                        <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                                        <td><button className="action-btn" onClick={() => navigate(`/responsable/formations`)}><MoreVertical size={16} /></button></td>
                                    </tr>
                                )
                            })}
                            {(!formationsRecentes || formationsRecentes.length === 0) && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-400)' }}>
                                        Aucune formation pour le moment.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Formations en attente */}
            <div className="card rd-demandes-card">
                <div className="table-header">
                    <h3>Formations en attente</h3>
                    <a href="/responsable/formations" className="chart-link">Voir toutes →</a>
                </div>
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>FORMATION</th><th>TYPE</th><th>DATES</th><th>STATUT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(formationsEnAttente || []).map(f => {
                                const s = STATUT_MAP[f.statut] ?? { label: f.statut, cls: 'badge-ended' }
                                const typeLabel = f.typeFormation === 'EXTERNE' ? 'Externe' : 'Interne'
                                return (
                                    <tr key={f.id}>
                                        <td>
                                            <div className="formation-cell">
                                                <span className="formation-title">{f.titre}</span>
                                                <span className="formation-ref">Réf: {f.reference || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td><span className={`type-pill ${f.typeFormation === 'EXTERNE' ? 'type-pill--externe' : ''}`}>{typeLabel}</span></td>
                                        <td className="date-cell">{f.dateDebut ? `${formatDate(f.dateDebut)} → ${formatDate(f.dateFin)}` : '—'}</td>
                                        <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                                    </tr>
                                )
                            })}
                            {(!formationsEnAttente || formationsEnAttente.length === 0) && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-400)' }}>
                                        Aucune formation en attente.
                                    </td>
                                </tr>
                            )}
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
