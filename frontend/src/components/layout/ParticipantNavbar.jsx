import { NavLink, useNavigate } from 'react-router-dom'
import { Bell, MessageSquare, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './ParticipantNavbar.css'

const navLinks = [
  { label: 'Mon Planning',    to: '/participant/planning' },
  { label: 'Mes Formations',  to: '/participant/formations' },
  { label: 'Documents',       to: '/participant/documents' },
  { label: 'Attestations',    to: '/participant/attestations' },
  { label: 'Évaluations',     to: '/participant/evaluations' },
]

export default function ParticipantNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user
    ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase()
    : 'PA'

  return (
    <header className="p-navbar">
      <div className="p-navbar-inner">
        <div className="p-navbar-logo">
          <img src="/src/assets/logo-brain.png" alt="EduMind" className="p-logo-img" />
          <div className="p-logo-text">
            <span className="p-logo-name">EduMind</span>
            <span className="p-logo-sub">by SFM Technologies</span>
          </div>
        </div>

        <nav className="p-navbar-links">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `p-nav-link ${isActive ? 'active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-navbar-right">
          <button className="p-icon-btn" title="Notifications">
            <Bell size={18} />
            <span className="p-notif-dot" />
          </button>
          <button className="p-icon-btn" title="Messages">
            <MessageSquare size={18} />
          </button>

          <div className="p-user" onClick={() => navigate('/participant/profile')}>
            <div className="p-user-avatar">{initials}</div>
            <span className="p-user-name">{user?.prenom ?? 'Ahmed'}</span>
          </div>

          <button className="p-icon-btn p-logout-btn" onClick={handleLogout} title="Déconnexion">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
