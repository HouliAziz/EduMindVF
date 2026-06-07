import { useState, useEffect, useCallback } from 'react'
import { Check, ChevronLeft, ChevronRight, Bell, Loader2 } from 'lucide-react'
import { notificationsAPI } from '../../services/api'
import './Notifications.css'

const TYPE_STYLES = {
  RAPPEL_AVANT_SESSION: { bg: '#dbeafe', color: '#1d4ed8', label: 'Rappel' },
  CHANGEMENT_PLANNING: { bg: '#fef3c7', color: '#b45309', label: 'Changement' },
  ATTESTATION_DISPONIBLE: { bg: '#d1fae5', color: '#047857', label: 'Attestation' },
  SYSTEME: { bg: '#f3e8ff', color: '#7c3aed', label: 'Système' },
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatRelative(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Hier'
  if (days < 7) return `Il y a ${days} jours`
  return formatDate(iso)
}

export default function Notifications() {
  const [notifs, setNotifs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState('ALL')
  const limit = 20

  const fetchNotifs = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await notificationsAPI.list({ limit, offset: page * limit })
      setNotifs(data.notifications || [])
      setTotal(data.total || 0)
    } catch {}
    setLoading(false)
  }, [page])

  useEffect(() => { fetchNotifs() }, [fetchNotifs])

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id)
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, statut: 'LUE' } : n))
    } catch {}
  }

  const filtered = filter === 'ALL' ? notifs : notifs.filter(n => n.typeNotification === filter)
  const types = [...new Set(notifs.map(n => n.typeNotification))]
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="notif-page">
      <div className="notif-page-header">
        <div>
          <h1>Notifications</h1>
          <p>Historique de toutes vos notifications système.</p>
        </div>
        <div className="notif-page-count">
          <Bell size={16} />
          <span>{total} notification{total > 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="notif-filters">
        <button
          className={`notif-filter-btn ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          Toutes
        </button>
        {types.map(t => {
          const style = TYPE_STYLES[t] || { bg: '#f1f5f9', color: '#475569', label: t }
          return (
            <button
              key={t}
              className={`notif-filter-btn ${filter === t ? 'active' : ''}`}
              style={filter === t ? { background: style.bg, color: style.color, borderColor: style.color } : {}}
              onClick={() => setFilter(t)}
            >
              {style.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="notif-loading-state">
          <Loader2 size={28} className="spin" />
          <span>Chargement...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="notif-empty-state">
          <Bell size={40} />
          <p>Aucune notification{filter !== 'ALL' ? ' de ce type' : ''}.</p>
        </div>
      ) : (
        <div className="notif-table">
          <div className="notif-table-header">
            <span>TYPE</span>
            <span>TITRE</span>
            <span>MESSAGE</span>
            <span>DATE</span>
            <span></span>
          </div>
          {filtered.map(n => {
            const style = TYPE_STYLES[n.typeNotification] || { bg: '#f1f5f9', color: '#475569', label: n.typeNotification }
            const isUnread = n.statut !== 'LUE'
            return (
              <div key={n.id} className={`notif-row ${isUnread ? 'notif-row--unread' : ''}`}>
                <div>
                  <span className="notif-type-badge" style={{ background: style.bg, color: style.color }}>
                    {style.label}
                  </span>
                </div>
                <div className="notif-row-title">{n.titre}</div>
                <div className="notif-row-msg">{n.message}</div>
                <div className="notif-row-date" title={formatDate(n.envoyeeAt)}>{formatRelative(n.envoyeeAt)}</div>
                <div>
                  {isUnread && (
                    <button className="notif-read-btn" onClick={() => handleMarkRead(n.id)} title="Marquer comme lu">
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="notif-pagination">
          <button className="notif-page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={16} /> Précédent
          </button>
          <span className="notif-page-info">Page {page + 1} / {totalPages}</span>
          <button className="notif-page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            Suivant <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
