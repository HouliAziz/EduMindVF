import { NavLink, useNavigate } from 'react-router-dom'
import { Bell, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './ResponsableNavbar.css'

const navLinks = [
    { label: 'Dashboard', to: '/responsable/dashboard' },
    { label: 'Formations', to: '/responsable/formations' },
    { label: 'Sessions', to: '/responsable/sessions' },
    { label: 'Finances', to: '/responsable/finances' },
    { label: 'Demandes', to: '/responsable/demandes' },
    { label: 'Analyse IA', to: '/responsable/ia' },
]

export default function ResponsableNavbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => { logout(); navigate('/login') }
    const initials = user
        ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase()
        : 'RF'

    return (
        <header className="rn-navbar">
            <div className="rn-inner">
                <div className="rn-logo">
                    <img src="/src/assets/logo-brain.png" alt="EduMind" className="rn-logo-img" />
                    <div className="rn-logo-text">
                        <span className="rn-logo-name">EduMind</span>
                        <span className="rn-logo-sub">by SFM Technologies</span>
                    </div>
                </div>

                <nav className="rn-links">
                    {navLinks.map(({ label, to }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => `rn-link ${isActive ? 'active' : ''}`}
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="rn-right">
                    <button className="rn-icon-btn" title="Notifications">
                        <Bell size={17} />
                        <span className="rn-notif-dot" />
                    </button>
                    <div className="rn-user" onClick={() => navigate('/responsable/profile')}>
                        <div className="rn-avatar">{initials}</div>
                        <div className="rn-user-info">
                            <span className="rn-username">{user?.prenom ?? 'Responsable'} {user?.nom ?? ''}</span>
                            <span className="rn-role">Responsable Formation</span>
                        </div>
                    </div>
                    <button className="rn-icon-btn rn-logout-btn" onClick={handleLogout} title="Déconnexion">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    )
}
