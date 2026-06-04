import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Star, TrendingUp, Users, MessageSquare } from 'lucide-react'
import './EvaluationsFormateur.css'

const TREND_DATA = [
    { month: 'Jan', score: 4.1 },
    { month: 'Fév', score: 4.3 },
    { month: 'Mar', score: 4.2 },
    { month: 'Avr', score: 4.5 },
    { month: 'Mai', score: 4.7 },
    { month: 'Jun', score: 4.8 },
]

const CRITERES_DATA = [
    { label: 'Pédagogie', score: 4.8 },
    { label: 'Clarté', score: 4.6 },
    { label: 'Disponibilité', score: 4.9 },
    { label: 'Support de cours', score: 4.2 },
    { label: 'Rythme', score: 4.0 },
]

const COMMENTAIRES = [
    { initials: 'JM', nom: 'Jean-Marc L.', session: 'Management Agile 2.0', note: 5, commentaire: 'Formateur exceptionnel, très à l\'écoute et pédagogue. Les exercices pratiques étaient parfaitement adaptés.', sentiment: 'Enthousiaste', sentPos: true },
    { initials: 'SD', nom: 'Sarah D.', session: 'Leadership Situationnel', note: 4, commentaire: 'Très bonne session, quelques points théoriques un peu denses mais le formateur a su s\'adapter.', sentiment: 'Satisfait', sentPos: true },
    { initials: 'PM', nom: 'Pierre M.', session: 'Communication Non-Violente', note: 3, commentaire: 'Le contenu est intéressant mais le rythme était parfois trop rapide pour tout assimiler.', sentiment: 'Nuancé', sentPos: false },
]

export default function EvaluationsFormateur() {
    const avgScore = 4.7
    const totalRetours = 128
    const tauxReponse = 89

    return (
        <div className="ef-page">
            {/* Header */}
            <div className="ef-header">
                <div>
                    <h1>Mes Évaluations</h1>
                    <p>Retours de vos apprenants et analyse de votre performance pédagogique.</p>
                </div>
                <div className="ef-overall">
                    <Star size={18} fill="var(--orange)" color="var(--orange)" />
                    <span className="ef-overall-score">{avgScore}</span>
                    <span className="ef-overall-sub">/5 moyenne globale</span>
                </div>
            </div>

            {/* KPIs */}
            <div className="ef-kpis stagger">
                <div className="card ef-kpi">
                    <div className="ef-kpi-icon ef-kpi-orange"><Star size={18} /></div>
                    <div className="ef-kpi-val">{avgScore}/5</div>
                    <div className="ef-kpi-label">Note moyenne</div>
                    <div className="ef-kpi-trend trend-pos">↑ +0.3 vs mois dernier</div>
                </div>
                <div className="card ef-kpi">
                    <div className="ef-kpi-icon ef-kpi-navy"><Users size={18} /></div>
                    <div className="ef-kpi-val">{totalRetours}</div>
                    <div className="ef-kpi-label">Retours reçus</div>
                    <div className="ef-kpi-trend trend-pos">↑ +12 ce mois</div>
                </div>
                <div className="card ef-kpi">
                    <div className="ef-kpi-icon ef-kpi-green"><TrendingUp size={18} /></div>
                    <div className="ef-kpi-val">{tauxReponse}%</div>
                    <div className="ef-kpi-label">Taux de réponse</div>
                    <div className="ef-kpi-trend trend-pos">↑ +4% vs m-1</div>
                </div>
                <div className="card ef-kpi">
                    <div className="ef-kpi-icon ef-kpi-blue"><MessageSquare size={18} /></div>
                    <div className="ef-kpi-val">94%</div>
                    <div className="ef-kpi-label">Recommandent</div>
                    <div className="ef-kpi-trend trend-pos">Très satisfaisant</div>
                </div>
            </div>

            {/* Charts row */}
            <div className="ef-charts-row">
                {/* Gauge */}
                <div className="card ef-gauge-card">
                    <h3>Score Global</h3>
                    <div className="ef-gauge-wrap">
                        <svg viewBox="0 0 200 120" className="ef-gauge-svg">
                            <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="#f1f3f8" strokeWidth="18" strokeLinecap="round" />
                            <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="url(#efGrad)" strokeWidth="18" strokeLinecap="round"
                                strokeDasharray={`${(avgScore / 5) * 251} 251`} />
                            <defs>
                                <linearGradient id="efGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#F26522" />
                                    <stop offset="100%" stopColor="#1B3A7A" />
                                </linearGradient>
                            </defs>
                            <text x="100" y="95" textAnchor="middle" fontSize="30" fontWeight="800" fontFamily="Plus Jakarta Sans" fill="#111827">{avgScore}</text>
                            <text x="100" y="112" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="Plus Jakarta Sans" fill="#F26522" letterSpacing="1">EXCELLENT</text>
                        </svg>
                    </div>
                    <div className="ef-gauge-sub">{totalRetours} évaluations • {tauxReponse}% de taux</div>
                </div>

                {/* Criteria bars */}
                <div className="card ef-criteria-card">
                    <h3>Par critère</h3>
                    <div className="ef-criteria-list">
                        {CRITERES_DATA.map(c => (
                            <div key={c.label} className="ef-criterion">
                                <div className="ef-criterion-header">
                                    <span>{c.label}</span>
                                    <strong style={{ color: c.score >= 4.5 ? 'var(--success)' : c.score >= 4 ? 'var(--navy)' : 'var(--orange)' }}>{c.score}</strong>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${(c.score / 5) * 100}%`, background: c.score >= 4.5 ? 'var(--success)' : c.score >= 4 ? 'var(--navy)' : 'var(--orange)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trend chart */}
                <div className="card ef-trend-card">
                    <h3>Évolution sur 6 mois</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={TREND_DATA} barSize={24}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f8" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9aa3b8' }} axisLine={false} tickLine={false} />
                            <YAxis domain={[3.5, 5]} tick={{ fontSize: 11, fill: '#9aa3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.1)' }} />
                            <Bar dataKey="score" name="Score" radius={[5, 5, 0, 0]}
                                fill="var(--navy)"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Comments table */}
            <div className="card ef-comments-card">
                <div className="ef-comments-header">
                    <h3>Commentaires récents</h3>
                    <span className="ef-comments-count">{COMMENTAIRES.length} affichés</span>
                </div>
                <table className="data-table ef-table">
                    <thead>
                        <tr>
                            <th>APPRENANT</th>
                            <th>SESSION</th>
                            <th>NOTE</th>
                            <th>COMMENTAIRE</th>
                            <th>SENTIMENT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMMENTAIRES.map((c, i) => (
                            <tr key={i}>
                                <td>
                                    <div className="ef-user">
                                        <div className="ef-avatar">{c.initials}</div>
                                        <span className="ef-username">{c.nom}</span>
                                    </div>
                                </td>
                                <td><span className="ef-session-name">{c.session}</span></td>
                                <td>
                                    <div className="ef-stars">{'★'.repeat(c.note)}{'☆'.repeat(5 - c.note)}</div>
                                </td>
                                <td><p className="ef-comment">"{c.commentaire}"</p></td>
                                <td>
                                    <span className={`badge ${c.sentPos ? 'badge-active' : 'badge-ended'}`}>{c.sentiment}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
