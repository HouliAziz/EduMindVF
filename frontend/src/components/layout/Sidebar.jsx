import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, BookOpen, CalendarDays, Users, UserCheck,
  Banknote, Bell, Brain, HelpCircle, Settings, LogOut, UserRoundCog, User
} from 'lucide-react'
import './Sidebar.css'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',     to: '/admin/dashboard' },
  { icon: BookOpen,        label: 'Formations',    to: '/admin/formations' },
  { icon: CalendarDays,    label: 'Sessions',      to: '/admin/sessions' },
  { icon: UserRoundCog,    label: 'Utilisateurs',   to: '/admin/utilisateurs' },
  { icon: Banknote,        label: 'Finances',      to: '/admin/finances' },
  { icon: Bell,            label: 'Notifications', to: '/admin/notifications' },
  { icon: Brain,           label: 'Analyse IA',    to: '/admin/ia' },
]

const bottomItems = [
  { icon: User,       label: 'Profil',     to: '/admin/profile' },
  { icon: HelpCircle, label: 'Support',    to: '/admin/support' },
  { icon: Settings,   label: 'Paramètres', to: '/admin/settings' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src="/src/assets/logo-edumind.png" alt="EduMind" className="sidebar-logo-img" />
        <span className="sidebar-by">by SFM Technologies</span>
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
        {bottomItems.map(({ icon: Icon, label, to }) => (
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
        <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
