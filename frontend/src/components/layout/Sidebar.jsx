import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, BookOpen, CalendarDays, Users, UserCheck,
  Banknote, Bell, Brain, LogOut, UserRoundCog, User, FileText
} from 'lucide-react'
import './Sidebar.css'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',     to: '/admin/dashboard' },
  { icon: BookOpen,        label: 'Formations',    to: '/admin/formations' },
  { icon: FileText,        label: 'Demandes',      to: '/admin/demandes' },
  { icon: CalendarDays,    label: 'Sessions',      to: '/admin/sessions' },
  { icon: UserRoundCog,    label: 'Utilisateurs',   to: '/admin/utilisateurs' },
  { icon: Banknote,        label: 'Finances',      to: '/admin/finances' },
  { icon: Bell,            label: 'Notifications', to: '/admin/notifications' },
  { icon: Brain,           label: 'Analyse IA',    to: '/admin/ia' },
]

const bottomItems = []

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user
    ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase()
    : 'AD'

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src="/src/assets/logo-edumind.png" alt="EduMind" className="sidebar-logo-img" />
      </div>

      {/* Main nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="sidebar-bottom">
        <NavLink to="/admin/profile" className="sidebar-link sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">
              {user ? `${user.prenom} ${user.nom}` : 'Admin SFM'}
            </span>
            <span className="sidebar-user-role">Administrateur</span>
          </div>
        </NavLink>
        <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
