import { useState } from 'react'
import { Search, HelpCircle, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import NotificationDropdown from '../notifications/NotificationDropdown'
import './AdminTopbar.css'

export default function AdminTopbar() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  const initials = user
    ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase()
    : 'AD'

  return (
    <header className="admin-topbar">
      <div className="topbar-search">
        <Search size={15} className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher une formation, un participant..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="topbar-right">
        <NotificationDropdown linkTo="/admin/notifications" />
        <button className="topbar-icon-btn" title="Aide">
          <HelpCircle size={18} />
        </button>

        <div className="topbar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <span className="user-name">
              {user ? `${user.prenom} ${user.nom}` : 'Admin SFM'}
            </span>
            <span className="user-role">Administrateur</span>
          </div>
          <ChevronDown size={14} className="user-chevron" />
        </div>
      </div>
    </header>
  )
}
