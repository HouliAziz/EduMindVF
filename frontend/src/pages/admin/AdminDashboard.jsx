import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { BookOpen, Users, Banknote, Star, MoreVertical, Plus, ArrowUpRight, Loader2 } from 'lucide-react'
import { adminAPI, formationsAPI } from '../../services/api'
import './AdminDashboard.css'

const MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

const STATUT_MAP = {
  EN_COURS:  { label: 'EN COURS', cls: 'badge-active' },
  PLANIFIEE: { label: 'PLANIFIÉ', cls: 'badge-planned' },
  TERMINEE:  { label: 'TERMINÉ',  cls: 'badge-ended' },
  ANNULEE:   { label: 'ANNULÉ',   cls: 'badge-cancelled' },
  VALIDEE:   { label: 'VALIDÉ',   cls: 'badge-active' },
  EN_ATTENTE: { label: 'EN ATTENTE', cls: 'badge-planned' },
  REJETEE:   { label: 'REJETÉ', cls: 'badge-cancelled' },
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [kpis, setKpis] = useState({ totalFormations: 0, activeSessions: 0, totalParticipants: 0, satisfaction: null })
  const [formationsParMois, setFormationsParMois] = useState([])
  const [interneExterne, setInterneExterne] = useState({ interne: 0, externe: 0 })
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      adminAPI.dashboard(),
      formationsAPI.list()
    ])
      .then(([dashRes, formationsRes]) => {
        if (dashRes.data) {
          const d = dashRes.data
          setKpis(d.kpis)
          // Map months data to bar chart format
          const months = (d.formationsParMois || []).map(item => ({
            month: MONTH_NAMES[item.month - 1] || item.month,
            formations: item.count
          }))
          setFormationsParMois(months)
          setInterneExterne(d.interneExterne || { interne: 0, externe: 0 })
        }
        if (formationsRes.data) {
          setFormations(formationsRes.data.slice(0, 3))
        }
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const ieData = [
    { name: 'Formations Internes', value: interneExterne.interne || 0, color: '#1B3A7A' },
    { name: 'Formations Externes', value: interneExterne.externe || 0, color: '#F26522' },
  ]

  const satisfactionDisplay = kpis.satisfaction ? `${kpis.satisfaction}/5` : 'N/A'

  return (
    <div className="dashboard stagger">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard
          icon={<BookOpen size={20} />}
          label="Total Formations"
          value={kpis.totalFormations}
          sub="Programmes enregistrés"
          color="navy"
          trend="up"
        />
        <KpiCard
          icon={<Users size={20} />}
          label="Participants"
          value={kpis.totalParticipants}
          sub="Collaborateurs actifs"
          color="orange"
          trend="up"
        />
        <KpiCard
          icon={<Banknote size={20} />}
          label="Sessions Actives"
          value={kpis.activeSessions}
          sub="Sessions en cours"
          color="blue"
        />
        <KpiCard
          icon={<Star size={20} />}
          label="Satisfaction IA"
          value={satisfactionDisplay}
          sub="Retours d'évaluation"
          color="green"
        />
      </div>

      {/* Charts row */}
      <div className="charts-row">
        {/* Bar chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <h3>Formations par mois</h3>
            </div>
            <span className="chart-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/sessions')}>
              Voir le calendrier
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={formationsParMois} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f8" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9aa3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9aa3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 13 }}
                cursor={{ fill: 'rgba(27,58,122,.05)' }}
              />
              <Bar dataKey="formations" fill="#1B3A7A" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card chart-card pie-card">
          <div className="chart-header">
            <h3>Répartition<br />Interne/Externe</h3>
          </div>
          <div className="pie-wrap">
            <PieChart width={180} height={180}>
              <Pie
                data={ieData}
                cx={85}
                cy={85}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {ieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <text x={85} y={82} textAnchor="middle" fontSize={22} fontWeight={700} fill="#1B3A7A">
                {interneExterne.interne + interneExterne.externe}
              </text>
              <text x={85} y={100} textAnchor="middle" fontSize={11} fill="#9aa3b8">
                total
              </text>
            </PieChart>
          </div>
          <div className="pie-legend">
            {ieData.map((d) => (
              <div key={d.name} className="pie-legend-item">
                <span className="pie-dot" style={{ background: d.color }} />
                <span>{d.name}</span>
                <strong>{d.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent formations table */}
      <div className="card table-card">
        <div className="table-header">
          <h3>Formations Récentes</h3>
          <button className="btn btn-primary" onClick={() => navigate('/admin/formations')}>
            <Plus size={15} />
            Nouvelle Formation
          </button>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '10px', color: 'var(--gray-400)' }}>
              <Loader2 size={24} className="spin" />
              <span>Chargement des formations...</span>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>FORMATION</th>
                  <th>TYPE</th>
                  <th>DURÉE</th>
                  <th>DOMAINE</th>
                  <th>STATUT</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formations.map((f) => {
                  const s = STATUT_MAP[f.statut] ?? { label: f.statut || 'PLANIFIÉ', cls: 'badge-planned' }
                  const isExterne = f.typeFormation === 'EXTERNE'
                  const typeLabel = isExterne ? 'Externe' : 'Interne'
                  return (
                    <tr key={f.id}>
                      <td>
                        <div className="formation-cell">
                          <span className="formation-title">{f.titre}</span>
                          <span className="formation-ref">Réf: {f.reference || 'N/A'}</span>
                        </div>
                      </td>
                      <td><span className={`type-pill ${isExterne ? 'type-pill--externe' : ''}`}>{typeLabel}</span></td>
                      <td className="date-cell">{f.dureeJours} jours</td>
                      <td><strong>{f.domaine || 'Général'}</strong></td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td>
                        <button className="action-btn" onClick={() => navigate(`/admin/formations`)}>
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {formations.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-400)' }}>
                      Aucune formation enregistrée pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, sub, color, trend }) {
  return (
    <div className={`card kpi-card kpi-${color}`}>
      <div className="kpi-top">
        <div className="kpi-icon-wrap">{icon}</div>
        {trend === 'up' && (
          <span className="kpi-trend">
            <ArrowUpRight size={13} />
          </span>
        )}
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  )
}
