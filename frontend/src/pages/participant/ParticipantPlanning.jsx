import { useState, useEffect } from 'react'
import {
  ChevronLeft, ChevronRight, MapPin, Clock, User,
  Calendar, ChevronRight as Arrow, Target, Users, Loader2
} from 'lucide-react'
import { participantsAPI } from '../../services/api'
import './ParticipantPlanning.css'

const HOUR_HEIGHT = 70
const DAY_NAMES = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']
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

export default function ParticipantPlanning() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    participantsAPI.planning()
      .then(({ data: res }) => setData(res))
      .catch(err => console.error('Planning API error:', err))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  const weekStart = getMonday(today)
  weekStart.setDate(weekStart.getDate() + weekOffset * 7)

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  if (loading) {
    return (
      <div className="planning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '10px', color: 'var(--gray-400)' }}>
        <Loader2 size={24} className="spin" />
        <span>Chargement du planning...</span>
      </div>
    )
  }

  const events = data?.events || []
  const spotlight = data?.spotlight || null
  const upcoming = data?.upcoming || []
  const objective = data?.objective || null

  return (
    <div className="planning">
      {/* Header */}
      <div className="planning-header">
        <div>
          <h1>Bonjour, {data?.prenom || 'Participant'} 👋</h1>
          <p>Voici votre emploi du temps pour la {formatWeekRange(weekStart)}.</p>
        </div>
        <div className="week-nav">
          <button className="week-btn" onClick={() => setWeekOffset(v => v - 1)}>
            <ChevronLeft size={16} />
          </button>
          <span className="week-label">
            <Calendar size={14} />
            Semaine {weekOffset + 1}
          </span>
          <button className="week-btn" onClick={() => setWeekOffset(v => v + 1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="planning-body">
        {/* Calendar */}
        <div className="card calendar-card">
          <div className="cal-header">
            <div className="cal-time-gutter" />
            {weekDates.map((d, i) => {
              const isToday = d.toDateString() === today.toDateString()
              return (
                <div key={i} className={`cal-day-header ${isToday ? 'today' : ''}`}>
                  <span className="cal-day-name">{DAY_NAMES[i]}</span>
                  <span className={`cal-day-num ${isToday ? 'today-num' : ''}`}>{d.getDate()}</span>
                </div>
              )
            })}
          </div>

          <div className="cal-grid">
            <div className="cal-hours">
              {HOURS.map(h => (
                <div key={h} className="cal-hour-label">{h}</div>
              ))}
            </div>

            {weekDates.map((d, dayIdx) => {
              const isToday = d.toDateString() === today.toDateString()
              const dayEvents = events.filter(e => {
                const ed = new Date(e.date)
                return ed.toDateString() === d.toDateString()
              })
              return (
                <div key={dayIdx} className={`cal-col ${isToday ? 'today-col' : ''}`}>
                  {HOURS.map((_, hi) => (
                    <div key={hi} className="cal-hour-row" />
                  ))}
                  {dayEvents.map(ev => {
                    const startH = parseInt(ev.heureDebut?.split(':')[0] || '9')
                    const endH = parseInt(ev.heureFin?.split(':')[0] || '17')
                    const duration = endH - startH
                    const topPx = (startH - 9) * HOUR_HEIGHT
                    const heightPx = duration * HOUR_HEIGHT - 4
                    return (
                      <div key={ev.id} className="cal-event cal-event-navy" style={{ top: topPx, height: heightPx }}>
                        <span className="cal-event-title">{ev.titre}</span>
                        <span className="cal-event-sub">{ev.formateur || ev.lieu || ''}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="planning-side">
          {/* Spotlight */}
          {spotlight && (
            <div className="card spotlight-card">
              <div className="spotlight-badge">SPOTLIGHT</div>
              <div className="spotlight-sub">Prochaine Session</div>
              <h3 className="spotlight-title">{spotlight.titre}</h3>

              <div className="spotlight-meta">
                <div className="meta-row">
                  <Calendar size={14} />
                  <span>{spotlight.date}</span>
                </div>
                <div className="meta-row">
                  <Clock size={14} />
                  <span>{spotlight.heureDebut} — {spotlight.heureFin}</span>
                </div>
                <div className="meta-row">
                  <MapPin size={14} />
                  <span>{spotlight.lieu || 'Non spécifié'}</span>
                </div>
                <div className="meta-row">
                  <User size={14} />
                  <span>{spotlight.formateur || 'Non assigné'}</span>
                </div>
              </div>

              {spotlight.countdown && (
                <div className="countdown-row">
                  <div className="countdown-box">
                    <span>Compte à rebours</span>
                  </div>
                  <div className="countdown-box countdown-orange">
                    <span>Dans {spotlight.countdown} jours</span>
                  </div>
                </div>
              )}

              <button className="btn btn-navy spotlight-btn">
                Voir les supports <Arrow size={14} />
              </button>
            </div>
          )}

          {/* Upcoming */}
          <div className="card upcoming-card">
            <div className="upcoming-header">
              <h4>À venir</h4>
              <a href="#" className="voir-tout">Voir tout</a>
            </div>
            <div className="upcoming-list">
              {upcoming.length === 0 ? (
                <div style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--gray-400)' }}>Aucune session à venir.</div>
              ) : (
                upcoming.slice(0, 3).map((item, i) => (
                  <div key={i} className="upcoming-item">
                    <div className="upcoming-date">
                      <span className="upcoming-day">{item.day}</span>
                      <span className="upcoming-month">{item.month}</span>
                    </div>
                    <div className="upcoming-info">
                      <span className="upcoming-title">{item.titre}</span>
                      <span className="upcoming-time">{item.heureDebut} — {item.lieu || ''}</span>
                    </div>
                    <Arrow size={14} className="upcoming-arrow" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Objective */}
          {objective && (
            <div className="card objective-card">
              <div className="objective-inner">
                <div className="obj-icon">
                  <Target size={18} />
                </div>
                <div>
                  <div className="obj-title">{objective.titre || 'Objectif atteint !'}</div>
                  <div className="obj-sub">{objective.description}</div>
                </div>
              </div>
              <div className="obj-peers">
                <Users size={13} />
                <span>{objective.label || 'Bravo avec vos pairs'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
