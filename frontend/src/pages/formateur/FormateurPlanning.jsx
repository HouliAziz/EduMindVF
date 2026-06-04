import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Users, MapPin, Clock, ArrowRight, BookOpen } from 'lucide-react'
import './FormateurPlanning.css'

const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN']
const DATES = [14, 15, 16, 17, 18]
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const HOUR_H = 68

const EVENTS = [
    { id: 1, day: 0, startHour: 9, duration: 2, title: 'Management Agile', salle: 'Salle A201', participants: 12, color: 'navy', upcoming: false },
    { id: 2, day: 1, startHour: 14, duration: 1.5, title: 'Leadership Avancé', salle: 'Salle B102', participants: 8, color: 'orange', upcoming: false },
    { id: 3, day: 2, startHour: 9, duration: 3, title: 'Data Science IA', salle: 'Lab Informatique', participants: 15, color: 'navy', upcoming: true },
    { id: 4, day: 4, startHour: 13, duration: 2, title: 'Soft Skills Pro', salle: 'Salle C305', participants: 10, color: 'teal', upcoming: false },
]

const UPCOMING_WEEK = [
    { day: 'Lun 14', title: 'Management Agile', time: '09:00 - 11:00', salle: 'Salle A201' },
    { day: 'Mar 15', title: 'Leadership Avancé', time: '14:00 - 15:30', salle: 'Salle B102' },
    { day: 'Ven 18', title: 'Soft Skills Pro', time: '13:00 - 15:00', salle: 'Salle C305' },
]

export default function FormateurPlanning() {
    const [selectedEvent, setSelectedEvent] = useState(EVENTS[2])
    const todayIdx = 2

    return (
        <div className="fp-page">
            {/* Header */}
            <div className="fp-header">
                <div>
                    <h1>Mon Planning <span className="fp-week-badge">Semaine 42</span></h1>
                    <p>Voici vos sessions pour la semaine du 14 Octobre 2024.</p>
                </div>
                <div className="fp-week-nav">
                    <button className="fp-nav-btn"><ChevronLeft size={16} /></button>
                    <span>14 – 18 Oct 2024</span>
                    <button className="fp-nav-btn"><ChevronRight size={16} /></button>
                </div>
            </div>

            <div className="fp-body">
                {/* Calendar */}
                <div className="card fp-calendar">
                    {/* Day headers */}
                    <div className="fp-cal-header">
                        <div className="fp-gutter" />
                        {DAYS.map((d, i) => (
                            <div key={d} className={`fp-day-head ${i === todayIdx ? 'today' : ''}`}>
                                <span className="fp-day-name">{d}</span>
                                <span className={`fp-day-num ${i === todayIdx ? 'today-num' : ''}`}>{DATES[i]}</span>
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="fp-grid">
                        {/* Hours */}
                        <div className="fp-hours-col">
                            {HOURS.map(h => (
                                <div key={h} className="fp-hour-label">{h}</div>
                            ))}
                        </div>

                        {/* Day columns */}
                        {DAYS.map((_, di) => (
                            <div key={di} className={`fp-col ${di === todayIdx ? 'today-col' : ''}`}>
                                {HOURS.map((_, hi) => <div key={hi} className="fp-hour-row" />)}
                                {EVENTS.filter(e => e.day === di).map(ev => (
                                    <div
                                        key={ev.id}
                                        className={`fp-event fp-event-${ev.color} ${selectedEvent?.id === ev.id ? 'selected' : ''}`}
                                        style={{ top: (ev.startHour - 8) * HOUR_H, height: ev.duration * HOUR_H - 4 }}
                                        onClick={() => setSelectedEvent(ev)}
                                    >
                                        <span className="fp-ev-title">{ev.title}</span>
                                        <span className="fp-ev-meta"><MapPin size={10} /> {ev.salle}</span>
                                        <span className="fp-ev-meta"><Users size={10} /> {ev.participants} apprenants</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Side panel */}
                <div className="fp-side">
                    {/* Selected session detail */}
                    {selectedEvent && (
                        <div className="card fp-detail-card">
                            <div className="fp-detail-badge">SESSION DU JOUR</div>
                            <h3 className="fp-detail-title">{selectedEvent.title}</h3>
                            <div className="fp-detail-meta">
                                <div className="fp-detail-row"><Clock size={13} /> Mer 16 Oct • 09:00 – 12:00</div>
                                <div className="fp-detail-row"><MapPin size={13} /> {selectedEvent.salle}</div>
                                <div className="fp-detail-row"><Users size={13} /> {selectedEvent.participants} apprenants inscrits</div>
                            </div>
                            <div className="fp-detail-actions">
                                <button className="btn btn-navy fp-action-btn">
                                    <BookOpen size={14} /> Préparer la session
                                </button>
                                <button className="btn btn-ghost fp-action-btn">
                                    <Users size={14} /> Voir les apprenants
                                </button>
                            </div>
                        </div>
                    )}

                    {/* This week list */}
                    <div className="card fp-week-card">
                        <div className="fp-week-head">
                            <h4>Cette semaine</h4>
                            <span className="fp-week-count">{UPCOMING_WEEK.length} sessions</span>
                        </div>
                        <div className="fp-week-list">
                            {UPCOMING_WEEK.map((s, i) => (
                                <div key={i} className="fp-week-item">
                                    <div className="fp-week-dot" />
                                    <div className="fp-week-info">
                                        <span className="fp-week-title">{s.title}</span>
                                        <span className="fp-week-sub">{s.day} • {s.time}</span>
                                        <span className="fp-week-sub">{s.salle}</span>
                                    </div>
                                    <ArrowRight size={14} className="fp-week-arrow" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats mini */}
                    <div className="card fp-stats-card">
                        <h4>Ce mois</h4>
                        <div className="fp-mini-stats">
                            <div className="fp-mini-stat">
                                <span className="fp-mini-val">8</span>
                                <span className="fp-mini-label">Sessions</span>
                            </div>
                            <div className="fp-mini-stat">
                                <span className="fp-mini-val">94</span>
                                <span className="fp-mini-label">Apprenants</span>
                            </div>
                            <div className="fp-mini-stat">
                                <span className="fp-mini-val">4.7</span>
                                <span className="fp-mini-label">Note moy.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
