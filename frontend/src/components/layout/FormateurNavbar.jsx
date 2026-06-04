import { NavLink, useNavigate } from 'react-router-dom'
import { Bell, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './FormateurNavbar.css'

const navLinks = [
    { label: 'Mon Planning', to: '/formateur/planning' },
    { label: 'Mes Sessions', to: '/formateur/sessions' },
    { label: 'Mes Apprenants', to: '/formateur/apprenants' },
    { label: 'Ressources', to: '/formateur/ressources' },
    { label: 'Évaluations', to: '/formateur/evaluations' },
]

export default function FormateurNavbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => { logout(); navigate('/login') }
    const initials = user
        ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase()
        : 'FO'

    return (
        <header className="fn-navbar">
            <div className="fn-inner">
                <div className="fn-logo">
                    <img src="/src/assets/logo-brain.png" alt="EduMind" className="fn-logo-img" />
                    <div className="fn-logo-text">
                        <span className="fn-logo-name">EduMind</span>
                        <span className="fn-logo-sub">by SFM Technologies</span>
                    </div>
                </div>

                <nav className="fn-links">
                    {navLinks.map(({ label, to }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => `fn-link ${isActive ? 'active' : ''}`}
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="fn-right">
                    <button className="fn-icon-btn" title="Notifications">
                        <Bell size={18} />
                        <span className="fn-notif-dot" />
                    </button>
                    <div className="fn-user" onClick={() => navigate('/formateur/profile')}>
                        <div className="fn-avatar">{initials}</div>
                        <span className="fn-username">{user?.prenom ?? 'Formateur'}</span>
                    </div>
                    <button className="fn-icon-btn fn-logout-btn" onClick={handleLogout} title="Déconnexion">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    )
}
