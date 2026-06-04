import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Check, X, Clock, AlertCircle, RefreshCw, Loader2, Trash2, BookOpen, MapPin } from 'lucide-react'
import { formationsAPI } from '../../services/api'
import './GestionDemandes.css'

const COLUMNS = [
    { key: 'EN_ATTENTE', label: 'En attente', icon: <Clock size={15} />, color: 'col-waiting' },
    { key: 'ACTIVE', label: 'Approuvées', icon: <Check size={15} />, color: 'col-approved' },
    { key: 'REJETEE', label: 'Rejetées', icon: <X size={15} />, color: 'col-rejected' },
]

const TYPE_LABELS = { INTERNE: 'Interne', EXTERNE: 'Externe' }
const TYPE_PILL = { INTERNE: '', EXTERNE: 'type-pill--externe' }

export default function GestionDemandes() {
    const [formations, setFormations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const [toast, setToast] = useState(null)
    const [recentlyApproved, setRecentlyApproved] = useState([])
    const [deleteTarget, setDeleteTarget] = useState(null)
    const dragItem = useRef(null)
    const busyRef = useRef(null)

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }

    const fetchFormations = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await formationsAPI.list()
            const all = res.data || []
            setFormations(all.filter(f => f.statut !== 'ACTIVE'))
        } catch (err) {
            console.error(err)
            setError('Impossible de charger les formations.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchFormations()
    }, [fetchFormations])

    const handleApprove = async (id) => {
        if (busyRef.current) return
        busyRef.current = id
        const f = formations.find(f => f.id === id)
        if (!f) { busyRef.current = null; return }
        setActionLoading(id)
        try {
            await formationsAPI.approve(id)
            setFormations(prev => prev.filter(f => f.id !== id))
            setRecentlyApproved(prev => [...prev, f])
            showToast('Formation approuvée — devient active.', 'success')
            setTimeout(() => {
                setRecentlyApproved(prev => prev.filter(x => x.id !== id))
            }, 2500)
        } catch (err) {
            const msg = err?.response?.data?.error || "Erreur lors de l'approbation."
            showToast(msg, 'error')
            fetchFormations()
        } finally {
            setActionLoading(null)
            busyRef.current = null
        }
    }

    const handleReject = async (id) => {
        if (busyRef.current) return
        busyRef.current = id
        setActionLoading(id)
        try {
            await formationsAPI.reject(id)
            const f = formations.find(x => x.id === id) || recentlyApproved.find(x => x.id === id)
            if (!f) { busyRef.current = null; setActionLoading(null); return }
            setRecentlyApproved(prev => prev.filter(x => x.id !== id))
            setFormations(prev => prev.find(x => x.id === id)
                ? prev.map(x => x.id === id ? { ...x, statut: 'REJETEE' } : x)
                : [...prev, { ...f, statut: 'REJETEE' }]
            )
            showToast('Formation rejetée.', 'error')
        } catch (err) {
            const msg = err?.response?.data?.error || 'Erreur lors du rejet.'
            showToast(msg, 'error')
            fetchFormations()
        } finally {
            setActionLoading(null)
            busyRef.current = null
        }
    }

    const handleDelete = async () => {
        const id = deleteTarget
        if (!id) return
        setActionLoading(id)
        try {
            await formationsAPI.delete(id)
            setDeleteTarget(null)
            setFormations(prev => prev.filter(f => f.id !== id))
            // Small delay to let overlay unmount before showing toast
            setTimeout(() => showToast('Formation supprimée.', 'error'), 50)
        } catch (err) {
            setDeleteTarget(null)
            setTimeout(() => showToast('Erreur lors de la suppression.', 'error'), 50)
        } finally {
            setActionLoading(null)
        }
    }

    const handleDragStart = (e, f) => {
        dragItem.current = f
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDrop = (e, targetStatus) => {
        e.preventDefault()
        if (busyRef.current) return
        const f = dragItem.current
        if (!f || f.statut !== 'EN_ATTENTE') return
        dragItem.current = null
        if (targetStatus === 'ACTIVE') handleApprove(f.id)
        else if (targetStatus === 'REJETEE') handleReject(f.id)
    }

    const pendingCount = formations.filter(f => f.statut === 'EN_ATTENTE').length
    const approvedCount = recentlyApproved.length
    const rejectedCount = formations.filter(f => f.statut === 'REJETEE').length

    return (
        <div className="gd-page">
            {toast && (
                <div className={`gd-toast gd-toast--${toast.type}`}>
                    {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="gd-header">
                <div>
                    <div className="breadcrumb">Tableau de bord &rsaquo; <span>Demandes</span></div>
                    <div className="gd-title-row">
                        <h1>Gestion des formations en attente</h1>
                        <button className="gd-refresh-btn" onClick={fetchFormations} title="Rafraîchir">
                            <RefreshCw size={14} className={loading ? 'spin' : ''} />
                        </button>
                    </div>
                    <p>Validez ou rejetez les formations en attente par glisser-déposer.</p>
                </div>
            </div>

            {loading && formations.length === 0 ? (
                <div className="gd-state">
                    <Loader2 size={36} className="spin gd-spinner" />
                    <p>Chargement des formations...</p>
                </div>
            ) : error ? (
                <div className="gd-state gd-state--error">
                    <AlertCircle size={36} />
                    <p>{error}</p>
                    <button className="gd-btn-retry" onClick={fetchFormations}>Réessayer</button>
                </div>
            ) : (
                <>
                    <div className="gd-stats stagger">
                        <div className="card gd-stat">
                            <div className="gd-stat-icon gd-icon-navy"><AlertCircle size={18} /></div>
                            <div>
                                <div className="gd-stat-label">En attente</div>
                                <div className="gd-stat-val">{pendingCount}</div>
                            </div>
                        </div>
                        <div className="card gd-stat">
                            <div className="gd-stat-icon gd-icon-green"><Check size={18} /></div>
                            <div>
                                <div className="gd-stat-label">Approuvées récemment</div>
                                <div className="gd-stat-val">{approvedCount}</div>
                            </div>
                        </div>
                        <div className="card gd-stat">
                            <div className="gd-stat-icon gd-icon-warn"><X size={18} /></div>
                            <div>
                                <div className="gd-stat-label">Rejetées</div>
                                <div className="gd-stat-val">{rejectedCount}</div>
                            </div>
                        </div>
                    </div>

                    <div className="gd-kanban">
                        {COLUMNS.map(col => {
                            const cards = col.key === 'ACTIVE'
                                ? recentlyApproved
                                : formations.filter(f => f.statut === col.key)
                            return (
                                <div
                                    key={col.key}
                                    className={`gd-column ${col.color}`}
                                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                                    onDrop={e => handleDrop(e, col.key)}
                                >
                                    <div className="gd-col-header">
                                        <div className="gd-col-title">
                                            {col.icon}
                                            <span>{col.label}</span>
                                        </div>
                                        <span className="gd-col-count">{cards.length}</span>
                                    </div>

                                    <div className="gd-cards">
                                        {cards.length === 0 && (
                                            <div className="gd-empty-col">
                                                <span>Aucune formation</span>
                                            </div>
                                        )}
                                        {cards.map(f => (
                                            <FormationCard
                                                key={f.id}
                                                f={f}
                                                colKey={col.key}
                                                isBusy={actionLoading === f.id}
                                                onDragStart={f.statut === 'EN_ATTENTE' && actionLoading !== f.id ? handleDragStart : null}
                                                onApprove={() => handleApprove(f.id)}
                                                onReject={() => handleReject(f.id)}
                                                onDelete={() => setDeleteTarget(f.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {/* Delete confirmation overlay (portal to body for full-window blur) */}
            {deleteTarget && createPortal(
                <div className="gd-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="gd-confirm" onClick={e => e.stopPropagation()}>
                        <Trash2 size={36} className="gd-confirm-icon" />
                        <p className="gd-confirm-text">Êtes-vous sûr de vouloir supprimer cette formation définitivement ?</p>
                        <div className="gd-confirm-actions">
                            <button className="gd-btn-cancel" onClick={() => setDeleteTarget(null)}>Annuler</button>
                            <button
                                className={`gd-btn-danger ${actionLoading === deleteTarget ? 'gd-btn--busy' : ''}`}
                                onClick={handleDelete}
                                disabled={actionLoading === deleteTarget}
                            >
                                {actionLoading === deleteTarget ? (
                                    <><Loader2 size={15} className="spin" /> Suppression...</>
                                ) : (
                                    <><Trash2 size={15} /> Confirmer la suppression</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

function FormationCard({ f, colKey, isBusy, onDragStart, onApprove, onReject, onDelete }) {
    return (
        <div
            className={`gd-card card ${isBusy ? 'gd-card--busy' : ''} ${f.statut === 'ACTIVE' ? 'gd-card--fadeout' : ''}`}
            draggable={!!onDragStart && !isBusy}
            onDragStart={e => onDragStart && onDragStart(e, f)}
        >
            <div className="gd-card-top">
                <span className={`type-pill ${TYPE_PILL[f.typeFormation] || ''}`}>{TYPE_LABELS[f.typeFormation] || f.typeFormation}</span>
            </div>

            <div className="gd-card-body">
                <div className="gd-card-title">{f.titre}</div>
                <div className="gd-card-meta">
                    {f.reference && <span>Réf: {f.reference}</span>}
                    {f.dateDebut && <span>Début: {f.dateDebut}</span>}
                    {f.dateFin && <span>Fin: {f.dateFin}</span>}
                </div>
                {f.description && <p className="gd-card-desc">{f.description}</p>}
                <div className="gd-card-info">
                    {f.nbParticipants > 0 && (
                        <span><BookOpen size={12} /> {f.nbParticipants} participants</span>
                    )}
                    {f.lieu && <span><MapPin size={12} /> {f.lieu}</span>}
                </div>
            </div>

            {isBusy ? (
                <div className="gd-card-actions gd-card-actions--busy">
                    <Loader2 size={14} className="spin" />
                    <span>Mise à jour...</span>
                </div>
            ) : (
                <div className="gd-card-actions">
                    {colKey === 'EN_ATTENTE' && (
                        <>
                            <button className="gd-approve" onClick={onApprove}>
                                <Check size={13} /> Approuver
                            </button>
                            <button className="gd-reject" onClick={onReject}>
                                <X size={13} /> Rejeter
                            </button>
                        </>
                    )}
                    {colKey === 'ACTIVE' && (
                        <div className="gd-card-actions-row">
                            <span className="gd-active-msg"><Check size={13} /> Formation active</span>
                            <button className="gd-reject-sm" onClick={onReject}><X size={13} /> Rejeter</button>
                        </div>
                    )}
                    {colKey === 'REJETEE' && (
                        <button className="gd-delete" onClick={onDelete}>
                            <Trash2 size={13} /> Supprimer
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
