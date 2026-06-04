import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, TrendingDown, Target, Search, FileText, FileSpreadsheet, Loader2, AlertCircle, ChevronDown } from 'lucide-react'
import { financeAPI, formationsAPI } from '../../services/api'
import './Finances.css'

const MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

const PERIODS = ['Ce mois', 'Trimestre', 'Année']

function getCurrentPeriod() {
  const now = new Date()
  return { annee: now.getFullYear(), mois: now.getMonth() + 1, trimestre: Math.floor(now.getMonth() / 3) + 1 }
}

export default function Finances() {
  const [period, setPeriod] = useState('Ce mois')
  const [formationId, setFormationId] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [allFormations, setAllFormations] = useState([])

  useEffect(() => {
    formationsAPI.list().then(({ data }) => setAllFormations(data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    const p = getCurrentPeriod()
    let params = {}
    if (period === 'Ce mois') { params = { annee: p.annee, mois: p.mois } }
    else if (period === 'Trimestre') { params = { annee: p.annee, trimestre: p.trimestre } }
    else { params = { annee: p.annee } }
    if (formationId) params.formationId = formationId

    financeAPI.dashboard(params)
      .then(({ data: res }) => setData(res))
      .catch(err => {
        console.error('Finance API error:', err)
        setError('Impossible de charger les données financières.')
      })
      .finally(() => setLoading(false))
  }, [period, formationId])

  const handleExportCSV = async () => {
    const p = getCurrentPeriod()
    let params = {}
    if (period === 'Ce mois') { params = { annee: p.annee, mois: p.mois } }
    else if (period === 'Trimestre') { params = { annee: p.annee, trimestre: p.trimestre } }
    else { params = { annee: p.annee } }
    if (formationId) params.formationId = formationId
    try {
      const res = await financeAPI.exportCsv(params)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url; a.download = 'rapport_finances.csv'; a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) { console.error('Export CSV error:', err) }
  }

  const handleExportPDF = async () => {
    const p = getCurrentPeriod()
    let params = {}
    if (period === 'Ce mois') { params = { annee: p.annee, mois: p.mois } }
    else if (period === 'Trimestre') { params = { annee: p.annee, trimestre: p.trimestre } }
    else { params = { annee: p.annee } }
    if (formationId) params.formationId = formationId
    try {
      const res = await financeAPI.exportJson(params)
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'rapport_finances.json'; a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) { console.error('Export JSON error:', err) }
  }

  if (loading) {
    return (
      <div className="finances-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '10px', color: 'var(--gray-400)' }}>
        <Loader2 size={24} className="spin" />
        <span>Chargement des données financières...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="finances-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px', color: '#dc2626' }}>
        <AlertCircle size={36} />
        <span>{error}</span>
      </div>
    )
  }

  if (!data) return null

  const { kpis, monthlyData, expensesByCategory, formationsDetail } = data

  const formatCurrency = (val) => {
    if (val == null || val === 0) return '0 €'
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val)
  }

  return (
    <div className="finances-page">
      {/* Header */}
      <div className="fin-header">
        <div>
          <h1>Gestion Financière</h1>
          <p>Vue d'ensemble de la rentabilité opérationnelle</p>
        </div>
        <div className="fin-header-right">
          <div className="period-tabs">
            {PERIODS.map(p => (
              <button key={p} className={`period-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
            ))}
          </div>
          <div className="view-icons">
            <button className="view-icon-btn" onClick={handleExportPDF} title="Exporter PDF"><FileText size={16} /><span>PDF</span></button>
            <button className="view-icon-btn" onClick={handleExportCSV} title="Exporter Excel"><FileSpreadsheet size={16} /><span>Excel</span></button>
          </div>
        </div>
      </div>

      {/* Formation filter */}
      <div className="fin-formation-filter">
        <div className="fin-search">
          <Search size={14} />
          <select value={formationId} onChange={e => setFormationId(e.target.value)}>
            <option value="">Toutes les formations</option>
            {allFormations.filter(f => f.statut === 'ACTIVE').map(f => (
              <option key={f.id} value={f.id}>{f.titre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI row */}
      <div className="fin-kpi-row stagger">
        <FinKpi icon={<TrendingUp size={18} />} label="TOTAL REVENUE" value={formatCurrency(kpis.totalRevenue)} color="navy" />
        <FinKpi icon={<TrendingDown size={18} />} label="TOTAL EXPENSES" value={formatCurrency(kpis.totalExpenses)} color="orange" />
        <FinKpi icon={<Target size={18} />} label="GLOBAL MARGIN" value={kpis.globalMargin != null ? `${kpis.globalMargin}%` : 'N/A'} color="green" />
        <FinKpi
          label="BUDGET CONSUMED"
          value={`${kpis.budgetConsumedPct || 0}%`}
          color="blue"
          custom={
            <div className="budget-consumed-card">
              <div className="budget-pct-row">
                <span>{kpis.budgetConsumedPct || 0}%</span>
                <span className="budget-lbl">BUDGET CONSUMED</span>
              </div>
              <div className="progress-bar" style={{ margin: '6px 0' }}>
                <div className="progress-fill" style={{ width: `${kpis.budgetConsumedPct || 0}%` }} />
              </div>
              <div className="budget-detail">{formatCurrency(kpis.budgetConsumed)} engagé / {formatCurrency(kpis.budgetAlloue)} budgétisé</div>
            </div>
          }
        />
      </div>

      {/* Charts row */}
      <div className="fin-charts-row">
        {/* Bar chart */}
        <div className="card fin-chart-card">
          <div className="chart-header">
            <h3>Revenus vs Dépenses par mois</h3>
            <div className="chart-legend">
              <span><span className="legend-dot" style={{ background: 'var(--navy)' }} /> Revenus</span>
              <span><span className="legend-dot" style={{ background: 'var(--orange)' }} /> Dépenses</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData || []} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f8" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9aa3b8' }} axisLine={false} tickLine={false}
                tickFormatter={m => MONTH_NAMES[m - 1] || m} />
              <YAxis tick={{ fontSize: 11, fill: '#9aa3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 12 }}
                formatter={v => [formatCurrency(v)]}
                labelFormatter={m => MONTH_NAMES[m - 1] || m}
              />
              <Bar dataKey="revenus"  name="Revenus"  fill="var(--navy)"   radius={[4, 4, 0, 0]} />
              <Bar dataKey="depenses" name="Dépenses" fill="var(--orange)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card fin-pie-card">
          <h3>Dépenses par catégorie</h3>
          <div className="fin-pie-wrap">
            <PieChart width={160} height={160}>
              <Pie data={expensesByCategory || []} cx={75} cy={75} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                {(expensesByCategory || []).map((e, i) => <Cell key={i} fill={e.color || '#9aa3b8'} />)}
              </Pie>
            </PieChart>
            <div className="fin-pie-center">
              <span>{formatCurrency(kpis.totalExpenses)}</span>
              <span>Total</span>
            </div>
          </div>
          <div className="fin-pie-legend">
            {(expensesByCategory || []).map(d => (
              <div key={d.name} className="fin-legend-item">
                <span className="legend-dot" style={{ background: d.color || '#9aa3b8' }} />
                <span>{d.name}</span>
                <strong>{d.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail table */}
      <div className="card fin-table-card">
        <div className="fin-table-header">
          <h3>Détail financier par formation</h3>
        </div>
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>FORMATION</th>
                <th>REVENUS</th>
                <th>DÉPENSES</th>
                <th>LOGEMENT</th>
                <th>TRANSPORT</th>
                <th>RESTAURATION</th>
                <th>PAUSE CAFÉ</th>
                <th>LOCATION SALLES</th>
                <th>AUTRE</th>
                <th>MARGE</th>
              </tr>
            </thead>
            <tbody>
              {(formationsDetail || []).map((f, i) => (
                <tr key={i}>
                  <td><span className="formation-title">{f.nom}</span></td>
                  <td><strong style={{ color: 'var(--success)' }}>{formatCurrency(f.revenus)}</strong></td>
                  <td>{formatCurrency(f.depenses)}</td>
                  <td>{formatCurrency(f.logement)}</td>
                  <td>{formatCurrency(f.transport)}</td>
                  <td>{formatCurrency(f.restauration)}</td>
                  <td>{formatCurrency(f.pauseCafe)}</td>
                  <td>{formatCurrency(f.locationSalles)}</td>
                  <td>{formatCurrency(f.autre)}</td>
                  <td>
                    <span className={`badge ${f.margePos ? 'badge-active' : 'badge-cancelled'}`}>
                      {f.marge != null ? `${f.marge >= 0 ? '+' : ''}${f.marge}%` : 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!formationsDetail || formationsDetail.length === 0) && (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-400)' }}>
                    Aucune formation active avec données financières.
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

function FinKpi({ icon, label, value, trend, trendPos, sub, color, custom }) {
  if (custom) return <div className="card fin-kpi-custom">{custom}</div>
  return (
    <div className={`card fin-kpi fin-kpi-${color}`}>
      <div className="fin-kpi-top">
        <span className="fin-kpi-label">{label}</span>
        {icon && <div className="fin-kpi-icon">{icon}</div>}
      </div>
      <div className="fin-kpi-value">{value}</div>
      {trend && <div className={`fin-kpi-trend ${trendPos ? 'trend-pos' : 'trend-neg'}`}>
        {trendPos ? '↑' : '↓'} {trend}
      </div>}
      {sub && <div className="fin-kpi-sub">{sub}</div>}
    </div>
  )
}
