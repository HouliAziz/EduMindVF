import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Cpu, Globe, Zap } from 'lucide-react'
import './Login.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await login(email, password)

      // Extraction et normalisation du rôle renvoyé par l'API Symfony
      const role = (user?.role || user?.type || '').toUpperCase()

      switch (role) {
        case 'ADMIN':
          navigate('/admin/dashboard')
          break
        case 'RESPONSABLE_FORMATION':
          navigate('/responsable/dashboard')
          break
        case 'FORMATEUR':
          navigate('/formateur/planning')
          break
        case 'PARTICIPANT':
          navigate('/participant/planning')
          break
        default:
          // Sécurité si un rôle inconnu (ex: DIRECTION) se connecte
          setError('Espace utilisateur non configuré pour ce rôle.')
          break
      }
    } catch (err) {
      setError('Identifiants COSAP invalides. Vérifiez vos accès.')
    }
  }

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-logo-wrap">
            <img src="/src/assets/logo-edumind.png" alt="EduMind" className="login-logo" />
          </div>

          <div className="login-hero">
            <h1>Gérez vos formations<br />intelligemment</h1>
          </div>

          <div className="login-badges">
            <span className="login-badge"><Cpu size={13} /> IA intégrée</span>
            <span className="login-badge"><Globe size={13} /> Multi-rôles</span>
            <span className="login-badge"><Zap size={13} /> COSAP Ready</span>
          </div>
        </div>

        <div className="login-left-footer">
          © 2026 EduMind Platform. All rights reserved.
        </div>

        {/* Decorative circles */}
        <div className="deco-circle deco-circle-1" />
        <div className="deco-circle deco-circle-2" />
        <div className="deco-circle deco-circle-3" />
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <h2>Connexion à EduMind</h2>
            <p>Entrez vos identifiants COSAP</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>EMAIL / COSAP ID</label>
              <div className="input-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="text"
                  placeholder="nom.prenom@cosap.fr"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label>MOT DE PASSE</label>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pwd-toggle"
                  onClick={() => setShowPwd(v => !v)}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-extras">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span>Se souvenir de moi</span>
              </label>
              <button type="button" className="forgot-link">Mot de passe oublié?</button>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-navy login-submit"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="login-sso">
            <Lock size={13} />
            Connexion sécurisée via SSO COSAP
          </div>

          <div className="login-powered">
            powered by <strong>SFM</strong> Technologies
          </div>
        </div>
      </div>
    </div>
  )
}
