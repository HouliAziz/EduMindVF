import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, Check } from 'lucide-react'
import { notificationsAPI } from '../../services/api'
import './NotificationDropdown.css'

const TYPE_ICONS = {
  RAPPEL_AVANT_SESSION: { bg: '#dbeafe', color: '#1d4ed8', label: 'Rappel' },
  CHANGEMENT_PLANNING: { bg: '#fef3c7', color: '#b45309', label: 'Changement' },
  ATTESTATION_DISPONIBLE: { bg: '#d1fae5', color: '#047857', label: 'Attestation' },
  SYSTEME: { bg: '#f3e8ff', color: '#7c3aed', label: 'Système' },
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'À l\'instant'
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Il y a ${days}j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function NotificationDropdown({ linkTo }) {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await notificationsAPI.unreadCount()
      setUnread(data.count)
    } catch {}
  }, [])

  const fetchNotifs = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await notificationsAPI.list({ limit: 10, offset: 0 })
      setNotifs(data.notifications || [])
      fetchUnread()
    } catch {}
    setLoading(false)
  }, [fetchUnread])

  useEffect(() => { fetchUnread() }, [fetchUnread])

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggle = () => {
    if (!open) fetchNotifs()
    setOpen(o => !o)
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id)
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, statut: 'LUE' } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  return (
    <div className="notif-dropdown" ref={ref}>
      <button className="notif-bell" onClick={toggle} title="Notifications">
        <Bell size={18} />
        {unread > 0 && <span className="notif-badge">{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span className="notif-panel-title">Notifications</span>
            {unread > 0 && <span className="notif-panel-count">{unread} non lue{unread > 1 ? 's' : ''}</span>}
          </div>

          <div className="notif-list">
            {loading ? (
              <div className="notif-loading">Chargement...</div>
            ) : notifs.length === 0 ? (
              <div className="notif-empty">Aucune notification</div>
            ) : (
              notifs.map(n => {
                const meta = TYPE_ICONS[n.typeNotification] || { bg: '#f1f5f9', color: '#475569', label: n.typeNotification }
                const isUnread = n.statut !== 'LUE'
                return (
                  <div key={n.id} className={`notif-item ${isUnread ? 'notif-item--unread' : ''}`} onClick={() => handleMarkRead(n.id)}>
                    <div className="notif-item-icon" style={{ background: meta.bg, color: meta.color }}>
                      {meta.label[0]}
                    </div>
                    <div className="notif-item-body">
                      <div className="notif-item-title">{n.titre}</div>
                      <div className="notif-item-msg">{n.message}</div>
                      <div className="notif-item-time">{formatTime(n.envoyeeAt)}</div>
                    </div>
                    {isUnread && <Check size={14} className="notif-mark-read" />}
                  </div>
                )
              })
            )}
          </div>

          {linkTo && (
            <a href={linkTo} className="notif-view-all">Voir toutes les notifications</a>
          )}
        </div>
      )}
    </div>
  )
}
