import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { RefreshCw, ChevronDown, Zap, AlertTriangle, CheckCircle } from 'lucide-react'
import './AnalyseIA.css'

const SESSIONS_OPTIONS = ['Architecture Cloud & DevOps v4', 'Management Agile 2.0', 'Cybersécurité Avancée']

const EVOLUTION = [
  { month: 'JAN', score: 3.2 },
  { month: 'FÉV', score: 3.5 },
  { month: 'MAR', score: 3.8 },
  { month: 'AVR', score: 4.0 },
  { month: 'MAI', score: 4.6 },
  { month: 'JUN', score: 4.3 },
]

const POS_WORDS = ['Expertise', 'Clarté', 'Pratique', 'Disponibilité', 'Inspirant', 'Échanges']
const NEG_WORDS = ['Rythme', 'Support PDF', 'Installation', 'Temps', 'Connexion']

const RETOURS = [
  { initials: 'JM', nom: 'Jean-Marc L.', role: 'Architecte Solutions', note: 5, commentaire: 'Une formation d\'une rare qualité. Le lab sur Kubernetes était bluffant de réalisme.', sentiment: 'Enthousiaste', sentimentCls: 'sent-pos' },
  { initials: 'SD', nom: 'Sarah D.', role: 'Lead Dev', note: 3, commentaire: 'Le contenu est top mais le rythme est trop soutenu pour tout assimiler en 3 jours.', sentiment: 'Nuancé', sentimentCls: 'sent-neutral' },
]

export default function AnalyseIA() {
  const [session, setSession] = useState(SESSIONS_OPTIONS[0])
  const [open, setOpen] = useState(false)

  return (
    <div className="ia-page">
      {/* Header */}
      <div className="ia-header">
        <div>
          <h1>Analyse IA des Évaluations <span className="ia-powered-badge"><Zap size={11} /> POWERED BY MISTRAL AI</span></h1>
          <p>Exploration sémantique et analyse de sentiment des retours apprenants.</p>
        </div>
        <div className="ia-session-select" onClick={() => setOpen(o => !o)}>
          <span>{session}</span>
          <ChevronDown size={14} className={open ? 'rotated' : ''} />
          {open && (
            <div className="ia-dropdown">
              {SESSIONS_OPTIONS.map(s => (
                <div key={s} className={`ia-dropdown-item ${s === session ? 'active' : ''}`} onClick={() => { setSession(s); setOpen(false) }}>{s}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top row */}
      <div className="ia-top-row">
        {/* Sentiment gauge */}
        <div className="card sentiment-card">
          <div className="sentiment-header">
            <h3>Sentiment Global</h3>
          </div>
          <div className="gauge-wrap">
            <svg viewBox="0 0 200 120" className="gauge-svg">
              {/* Background arc */}
              <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="#f1f3f8" strokeWidth="18" strokeLinecap="round" />
              {/* Colored arc (82% of 180deg) */}
              <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="url(#gaugeGrad)" strokeWidth="18" strokeLinecap="round"
                strokeDasharray={`${0.82 * 251} 251`} />
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#1B3A7A" />
                </linearGradient>
              </defs>
              <text x="100" y="95" textAnchor="middle" fontSize="28" fontWeight="800" fontFamily="Plus Jakarta Sans" fill="#111827">82%</text>
              <text x="100" y="112" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="Plus Jakarta Sans" fill="#10b981" letterSpacing="1">TRÈS POSITIF</text>
            </svg>
          </div>
          <div className="sentiment-breakdown">
            <div className="sent-item sent-pos-item"><span>POSITIF</span><strong>82%</strong></div>
            <div className="sent-item sent-neutral-item"><span>NEUTRE</span><strong>12%</strong></div>
            <div className="sent-item sent-neg-item"><span>NÉGATIF</span><strong>6%</strong></div>
          </div>
        </div>

        {/* Word cloud */}
        <div className="card wordcloud-card">
          <div className="wc-col">
            <div className="wc-header wc-pos"><span>👍</span> MOTS-CLÉS POSITIFS</div>
            <div className="wc-tags">
              {POS_WORDS.map((w, i) => (
                <span key={w} className="wc-tag wc-tag-pos" style={{ fontSize: 11 + (i % 3) * 2 }}>{w}</span>
              ))}
            </div>
          </div>
          <div className="wc-divider" />
          <div className="wc-col">
            <div className="wc-header wc-neg"><span>👎</span> MOTS-CLÉS NÉGATIFS</div>
            <div className="wc-tags">
              {NEG_WORDS.map((w, i) => (
                <span key={w} className="wc-tag wc-tag-neg" style={{ fontSize: 11 + (i % 3) * 2 }}>{w}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle row */}
      <div className="ia-mid-row">
        {/* Narrative */}
        <div className="card narrative-card">
          <div className="narrative-header">
            <div className="narrative-title">
              <Zap size={16} className="narrative-icon" />
              Synthèse Narrative de l'IA
            </div>
            <div className="narrative-meta">
              <span>Dernière mise à jour : il y a 12 minutes</span>
              <button className="btn btn-ghost regenerate-btn"><RefreshCw size={13} /> Régénérer</button>
            </div>
          </div>
          <div className="narrative-body">
            <p>L'analyse sémantique des 45 retours de la session <strong>Cloud Architecture</strong> révèle un accueil extrêmement positif quant à la structure pédagogique. Les apprenants soulignent particulièrement l'équilibre entre théorie et mise en pratique réelle.</p>
            <p>Cependant, une tendance émergente suggère que le <mark>rythme de la troisième journée</mark> est jugé trop dense, impactant la rétention d'informations sur les microservices. L'IA recommande d'espacer les démonstrations techniques ou d'allonger la durée globale du module de 4h.</p>
            <div className="narrative-bullets">
              <div className="nbullet nbullet-pos"><CheckCircle size={14} /> Taux de satisfaction record sur le formateur : 4.9/5</div>
              <div className="nbullet nbullet-warn"><AlertTriangle size={14} /> Point d'attention sur les supports de cours à moderniser</div>
            </div>
          </div>
        </div>

        {/* Right: chart + response rate */}
        <div className="ia-right-col">
          <div className="card evolution-card">
            <h4>Évolution Satisfaction</h4>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={EVOLUTION} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9aa3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[2, 5]} tick={{ fontSize: 10, fill: '#9aa3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.1)' }} />
                <Bar dataKey="score" fill="var(--navy)" radius={[4, 4, 0, 0]}
                  label={false}
                  data={EVOLUTION.map((d, i) => ({ ...d, fill: i === 4 ? 'var(--orange)' : 'var(--navy)' }))}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card response-card">
            <div className="response-rate">
              <span className="response-pct">89%</span>
              <span className="response-label">Taux de réponse</span>
            </div>
            <div className="response-sub">
              <span>128 sur 144 apprenants</span>
              <span className="response-trend">↑ +12% vs mois dernier</span>
            </div>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: '89%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Retours table */}
      <div className="card retours-card">
        <h3>Retours qualitatifs récents</h3>
        <table className="data-table retours-table">
          <thead>
            <tr>
              <th>APPRENANT</th>
              <th>NOTE</th>
              <th>COMMENTAIRE</th>
              <th>SENTIMENT IA</th>
            </tr>
          </thead>
          <tbody>
            {RETOURS.map((r, i) => (
              <tr key={i}>
                <td>
                  <div className="retour-user">
                    <div className="avatar-circle" style={{ background: 'var(--navy)', width: 34, height: 34, fontSize: 12 }}>{r.initials}</div>
                    <div><div className="formation-title">{r.nom}</div><div className="formation-ref">{r.role}</div></div>
                  </div>
                </td>
                <td>
                  <div className="stars">{'★'.repeat(r.note)}{'☆'.repeat(5 - r.note)}</div>
                  <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{r.note}/5</span>
                </td>
                <td><p className="retour-comment">"{r.commentaire}"</p></td>
                <td><span className={`badge sent-badge ${r.sentimentCls}`}>{r.sentiment}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
