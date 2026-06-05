import { useState, useEffect } from 'react'
import {
  ChevronLeft, ChevronRight, MapPin, Clock, Calendar,
  ChevronRight as Arrow, Users, Loader2
} from 'lucide-react'
import { formateurAPI } from '../../services/api'
import './FormateurPlanning.css'

const HOUR_HEIGHT = 70
const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']
const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatWeekRange(start) {
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const opts = { day: 'numeric', month: 'long' }
  return `${start.toLocaleDateString('fr-FR', opts)} — ${end.toLocaleDateString('fr-FR', opts)}`
}

export default function FormateurPlanning() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const weekStart = getMonday(today)
  weekStart.setDate(weekStart.getDate() + weekOffset * 7)

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  useEffect(() => {
    setLoading(true)
    const ws = weekStart.toISOString().slice(0, 10)
    formateurAPI.planning({ weekStart: ws })
      .then(({ data: res }) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [weekOffset])

  if (loading) {
    return (
      <div className="fp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '10px', color: 'var(--gray-400)' }}>
        <Loader2 size={24} className="spin" />
        <span>Chargement du planning...</span>
      </div>
    )
  }

  const events = data?.events || []
  const spotlight = data?.spotlight || null
  const upcoming = data?.upcoming || []
  const monthStats = data?.monthStats || { total: 0, terminees: 0, restantes: 0 }
  const prenom = data?.prenom || 'Formateur'

  return (
    <div className="fp-page">
      <div className="fp-header">
        <div>
          <h1>Bonjour, {prenom}</h1>
          <p>Voici votre emploi du temps pour la {formatWeekRange(weekStart)}.</p>
        </div>
        <div className="fp-week-nav">
          <button className="fp-week-btn" onClick={() => setWeekOffset(v => v - 1)}>
            <ChevronLeft size={16} />
          </button>
          <span className="fp-week-label">
            <Calendar size={14} />
            {formatWeekRange(weekStart)}
          </span>
          <button className="fp-week-btn" onClick={() => setWeekOffset(v => v + 1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="fp-body">
        <div className="card fp-cal-card">
          <div className="fp-cal-header">
            <div className="fp-gutter" />
            {weekDates.map((d, i) => {
              const isToday = d.toDateString() === today.toDateString()
              return (
                <div key={i} className={`fp-day-head ${isToday ? 'today' : ''}`}>
                  <span className="fp-day-name">{DAYS[i]}</span>
                  <span className={`fp-day-num ${isToday ? 'today-num' : ''}`}>{d.getDate()}</span>
                </div>
              )
            })}
          </div>

          <div className="fp-grid">
            <div className="fp-hours">
              {HOURS.map(h => (
                <div key={h} className="fp-hour-label">{h}</div>
              ))}
            </div>

            {weekDates.map((d, dayIdx) => {
              const isToday = d.toDateString() === today.toDateString()
              const dayEvents = events.filter(e => e.dayIndex === dayIdx)
              return (
                <div key={dayIdx} className={`fp-col ${isToday ? 'today-col' : ''}`}>
                  {HOURS.map((_, hi) => (
                    <div key={hi} className="fp-hour-row" />
                  ))}
                  {dayEvents.map(ev => {
                    const duration = Math.max(ev.duration, 0.5)
                    const topPx = (ev.startHour - 9) * HOUR_HEIGHT
                    const heightPx = duration * HOUR_HEIGHT - 4
                    return (
                      <div key={ev.id} className="fp-event" style={{ top: topPx, height: heightPx, background: ev.bgColor, color: ev.textColor }}>
                        <span className="fp-ev-title">{ev.title}</span>
                        <span className="fp-ev-sub">{ev.subtitle}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        <div className="fp-side">
          {spotlight && (
            <div className="card fp-spotlight">
              <div className="fp-spot-badge">PROCHAINE SESSION</div>
              <h3 className="fp-spot-title">{spotlight.title}</h3>
              <div className="fp-spot-meta">
                <div className="fp-meta-row"><Calendar size={14} /> {spotlight.date} {spotlight.month}</div>
                <div className="fp-meta-row"><Clock size={14} /> {spotlight.time}</div>
              </div>
              <button className="btn btn-navy fp-spot-btn">
                Préparer la session <Arrow size={14} />
              </button>
            </div>
          )}

          <div className="card fp-upcoming">
            <div className="fp-up-head">
              <h4>À venir</h4>
            </div>
            <div className="fp-up-list">
              {upcoming.length === 0 ? (
                <div style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--gray-400)' }}>Aucune session à venir.</div>
              ) : (
                upcoming.slice(0, 5).map((item, i) => (
                  <div key={i} className="fp-up-item">
                    <div className="fp-up-date">
                      <span className="fp-up-day">{item.date}</span>
                      <span className="fp-up-month">{item.month}</span>
                    </div>
                    <div className="fp-up-info">
                      <span className="fp-up-title">{item.title}</span>
                      <span className="fp-up-time">{item.time}</span>
                    </div>
                    <Arrow size={14} className="fp-up-arrow" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card fp-month-stats">
            <div className="fp-up-head">
              <h4>Ce mois-ci</h4>
            </div>
            <div className="fp-ms-grid">
              <div className="fp-ms-stat">
                <span className="fp-ms-num">{monthStats.total}</span>
                <span className="fp-ms-label">Total sessions</span>
              </div>
              <div className="fp-ms-stat">
                <span className="fp-ms-num fp-ms-done">{monthStats.terminees}</span>
                <span className="fp-ms-label">Terminées</span>
              </div>
              <div className="fp-ms-stat">
                <span className="fp-ms-num fp-ms-left">{monthStats.restantes}</span>
                <span className="fp-ms-label">Restantes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
