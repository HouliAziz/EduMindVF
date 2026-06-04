import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, Pencil, Archive, Trash2, RotateCcw, Search, RefreshCw, Users, Clock, Loader2, WifiOff, X } from 'lucide-react'
import { formationsAPI } from '../../services/api'
import './Formations.css'

// ─── Status display map ───────────────────────────────────────────────────────
const STATUT_STYLE = {
  ACTIF: { cls: 'badge-active', label: 'ACTIF' },
  ACTIVE: { cls: 'badge-active', label: 'ACTIF' },
  BROUILLON: { cls: 'badge-draft', label: 'BROUILLON' },
  PLANIFIEE: { cls: 'badge-planned', label: 'PLANIFIÉ' },
  TERMINEE: { cls: 'badge-ended', label: 'TERMINÉ' },
  VALIDEE: { cls: 'badge-planned', label: 'VALIDÉE' },
  EN_ATTENTE: { cls: 'badge-draft', label: 'EN ATTENTE' },
  ARCHIVEE: { cls: 'badge-ended', label: 'ARCHIVÉE' },
}

export default function Formations({ onNew, onEdit, onToast }) {
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [statut, setStatut] = useState('all')
  const [selectedFormation, setSelectedFormation] = useState(null)

  const fetchFormations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await formationsAPI.list()
      setFormations(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de charger les formations.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFormations() }, [fetchFormations])

  const filtered = formations.filter(f => {
    const q = search.toLowerCase()
    const matchSearch = f.titre?.toLowerCase().includes(q) || f.domaine?.toLowerCase().includes(q)
    const matchType = type === 'all' || f.typeFormation === type
    const matchStatut = statut === 'all' || f.statut === statut
    return matchSearch && matchType && matchStatut
  })

  const resetFilters = () => { setSearch(''); setType('all'); setStatut('all') }

  return (
    <div className="formations-page">
      {/* ── Header ── */}
      <div className="page-topbar">
        <div>
          <div className="breadcrumb">Tableau de bord &rsaquo; <span>Formations</span></div>
          <h1>
            Gestion des Formations
            {!loading && !error && (
              <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--gray-400)', marginLeft: 10 }}>
                ({formations.length} au total)
              </span>
            )}
          </h1>
        </div>
        <button className="btn btn-primary" onClick={onNew}>
          <Plus size={16} /> Nouvelle formation
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="formations-filters card">
        <div className="filter-search">
          <Search size={14} />
          <input
            placeholder="Titre, domaine ou mots-clés..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="all">Tous les types</option>
          <option value="INTERNE">Interne</option>
          <option value="EXTERNE">Externe</option>
        </select>
        <select value={statut} onChange={e => setStatut(e.target.value)}>
          <option value="all">Tous les statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="BROUILLON">Brouillon</option>
          <option value="VALIDEE">Validée</option>
          <option value="ARCHIVEE">Archivée</option>
        </select>
        <button className="refresh-btn" title="Actualiser" onClick={fetchFormations}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
        </button>
        <button className="refresh-btn" title="Réinitialiser filtres" onClick={resetFilters} style={{ marginLeft: -4 }}>
          <span style={{ fontSize: 11, padding: '0 4px' }}>✕</span>
        </button>
      </div>

      {/* ── States ── */}
      {loading ? (
        <div className="formations-state">
          <Loader2 size={32} className="spin" />
          <p>Chargement des formations…</p>
        </div>
      ) : error ? (
        <div className="formations-state formations-state--error">
          <WifiOff size={36} />
          <p>{error}</p>
          <button className="btn btn-ghost" onClick={fetchFormations}>
            <RefreshCw size={14} /> Réessayer
          </button>
        </div>
      ) : (
        <>
          <div className="formations-grid stagger">
            {filtered.map(f => (
              <FormationCard
                key={f.id}
                f={f}
                onRefresh={fetchFormations}
                onViewDetails={setSelectedFormation}
                onEdit={onEdit}
                onToast={onToast}
              />
            ))}
            <button className="create-card card" onClick={onNew}>
              <div className="create-icon"><Plus size={28} /></div>
              <div className="create-title">Créer une formation</div>
              <div className="create-sub">Lancez un nouveau programme pédagogique interne ou externe.</div>
            </button>
          </div>

          <div className="formations-pagination">
            <span>
              {filtered.length === formations.length
                ? `${formations.length} formation${formations.length !== 1 ? 's' : ''}`
                : `${filtered.length} résultat${filtered.length !== 1 ? 's' : ''} sur ${formations.length}`
              }
            </span>
          </div>
        </>
      )}

      {/* ── Details Modal ── */}
      {selectedFormation && (
        <div className="modal-overlay" onClick={() => setSelectedFormation(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedFormation.titre}</h2>
              <button className="modal-close" onClick={() => setSelectedFormation(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Type:</strong>
                <span className={`ftype-badge ftype-${(selectedFormation.typeFormation || 'INTERNE').toLowerCase()}`}>
                  {selectedFormation.typeFormation || 'INTERNE'}
                </span>
              </div>
              <div className="detail-row">
                <strong>Statut:</strong>
                <span className={`badge ${STATUT_STYLE[selectedFormation.statut]?.cls || 'badge-draft'}`}>
                  {STATUT_STYLE[selectedFormation.statut]?.label || selectedFormation.statut}
                </span>
              </div>
              {selectedFormation.domaine && (
                <div className="detail-row">
                  return <strong>Domaine:</strong>
                  <span>{selectedFormation.domaine}</span>
                </div>
              )}
              {selectedFormation.dureeJours && (
                <div className="detail-row">
                  <strong>Durée:</strong>
                  <span>{selectedFormation.dureeJours} jours</span>
                </div>
              )}
              {selectedFormation.publicCible && (
                <div className="detail-section">
                  <strong>Public cible:</strong>
                  <p>{selectedFormation.publicCible}</p>
                </div>
              )}
              {selectedFormation.objectifs && (
                <div className="detail-section">
                  <strong>Objectifs:</strong>
                  <p>{selectedFormation.objectifs}</p>
                </div>
              )}
              {selectedFormation.description && (
                <div className="detail-section">
                  <strong>Description:</strong>
                  <p>{selectedFormation.description}</p>
                </div>
              )}
              {selectedFormation.reference && (
                <div className="detail-row">
                  <strong>Référence:</strong>
                  <span style={{ fontFamily: 'monospace' }}>#{selectedFormation.reference}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Formation Card Component ─────────────────────────────────────────────────
function FormationCard({ f, onRefresh, onViewDetails, onEdit, onToast }) {
  const navigate = useNavigate()
  const statut = f.statut || 'BROUILLON'
  const s = STATUT_STYLE[statut] ?? { cls: 'badge-draft', label: statut }
  const dureeJours = f.dureeJours || 0
  const dureeLabel = dureeJours > 0 ? `${dureeJours}j` : '—'
  const [pendingAction, setPendingAction] = useState(null)

  const handleSessions = () => { navigate(`/admin/sessions?formation=${f.id}`) }
  const handleModifier = (e) => {
    e.stopPropagation()
    if (onEdit) onEdit(f)
  }

  const confirmLabels = {
    delete: { title: 'Supprimer cette formation ?', icon: Trash2 },
    unarchive: { title: 'Désarchiver cette formation ?', icon: RotateCcw },
    archive: { title: 'Archiver cette formation ?', icon: Archive },
  }

  const handleArchiveAction = async (e, action) => {
    e.stopPropagation()
    setPendingAction(action)
  }

  const executeAction = async () => {
    const action = pendingAction
    setPendingAction(null)
    try {
      if (action === 'delete') {
        await formationsAPI.delete(f.id)
        onRefresh()
        onToast({ type: 'error', message: `🗑️ ${f.titre} supprimée.` })
      } else if (action === 'unarchive') {
        await formationsAPI.unarchive(f.id)
        onRefresh()
        onToast({ type: 'success', message: `📦 ${f.titre} désarchivée (En attente).` })
      } else if (action === 'archive') {
        await formationsAPI.archive(f.id)
        onRefresh()
        onToast({ type: 'error', message: `📦 ${f.titre} archivée.` })
      }
    } catch (err) {
      onToast({ type: 'error', message: err.response?.data?.error || 'Erreur lors de l\'opération.' })
    }
  }

  return (
    <div className="formation-card card" onClick={() => onViewDetails(f)} style={{ cursor: 'pointer', position: 'relative' }}>
      <div className="fcard-top" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <span className={`ftype-badge ftype-${(f.typeFormation || 'INTERNE').toLowerCase()}`} style={{ position: 'static', margin: 0 }}>
          {f.typeFormation || 'INTERNE'}
        </span>
        <span className={`badge ${s.cls}`} style={{ position: 'static', margin: 0 }}>
          {s.label}
        </span>
      </div>

      <h3 className="fcard-title" style={{ marginTop: '6px' }}>{f.titre}</h3>

      <div className="fcard-meta">
        <span><Users size={12} /> {f.domaine || '—'}</span>
        <span><Clock size={12} /> {dureeLabel}</span>
      </div>

      {f.publicCible && (
        <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 10, lineHeight: 1.4 }}>
          🎯 {f.publicCible}
        </div>
      )}

      {f.reference && (
        <div style={{ fontSize: 11, color: 'var(--gray-300)', fontFamily: 'monospace', marginBottom: 8 }}>
          #{f.reference}
        </div>
      )}

      <div className="fcard-actions" onClick={e => e.stopPropagation()}>
        <button className="faction-btn" onClick={handleSessions} title="Gérer les sessions"><Calendar size={15} /><span>Sessions</span></button>
        <button className="faction-btn" onClick={handleModifier} title="Modifier la formation"><Pencil size={15} /><span>Modifier</span></button>
        {statut === 'ARCHIVEE' && (
          <button className="faction-btn" onClick={e => handleArchiveAction(e, 'unarchive')} title="Désarchiver cette formation"><RotateCcw size={15} /><span>Désarchiver</span></button>
        )}
        {statut === 'BROUILLON' || statut === 'ARCHIVEE'
          ? <button className="faction-btn danger" onClick={e => handleArchiveAction(e, 'delete')} title="Supprimer cette formation"><Trash2 size={15} /><span>Supprimer</span></button>
          : <button className="faction-btn danger" onClick={e => handleArchiveAction(e, 'archive')} title="Archiver la formation"><Archive size={15} /><span>Archiver</span></button>
        }
      </div>

      {/* Confirmation overlay */}
      {pendingAction && (() => {
        const info = confirmLabels[pendingAction]
        const Icon = info.icon
        const isDanger = pendingAction === 'delete'
        return (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(2px)', zIndex: 10, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '24px', borderRadius: '16px',
          }}>
            <Icon size={32} style={{ color: isDanger ? '#dc2626' : 'var(--navy)', marginBottom: '10px' }} />
            <p style={{ margin: '0 0 14px', fontSize: '14px', color: isDanger ? '#991b1b' : 'var(--gray-700)', fontWeight: 600, textAlign: 'center' }}>
              {info.title}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={e => { e.stopPropagation(); setPendingAction(null) }} style={{
                padding: '8px 18px', border: '1.5px solid var(--gray-200)', borderRadius: '8px',
                background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500
              }}>Annuler</button>
              <button type="button" onClick={e => { e.stopPropagation(); executeAction() }} style={{
                padding: '8px 18px', border: 'none', borderRadius: '8px',
                background: isDanger ? '#dc2626' : 'var(--navy)', color: '#fff', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <Icon size={14} /> Confirmer
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}