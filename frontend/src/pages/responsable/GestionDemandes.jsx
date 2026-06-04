import { useState, useEffect, useCallback } from 'react'
import { Check, X, Clock, AlertCircle, User, Calendar, RefreshCw, Loader2, ShieldAlert } from 'lucide-react'
import { demandesAPI } from '../../services/api'
import './GestionDemandes.css'

const PRIORITE_STYLE = {
    URGENT: { cls: 'prio-urgent', label: 'Urgent' },
    NORMAL: { cls: 'prio-normal', label: 'Normal' },
    FAIBLE: { cls: 'prio-faible', label: 'Faible' },
}

const COLUMNS = [
    { key: 'EN_ATTENTE', label: 'En attente', icon: <Clock size={15} />, color: 'col-waiting' },
    { key: 'APPROUVEE', label: 'Approuvées', icon: <Check size={15} />, color: 'col-approved' },
    { key: 'REJETEE', label: 'Rejetées', icon: <X size={15} />, color: 'col-rejected' },
]

const AVATAR_COLORS = ['#1B3A7A', '#F26522', '#10b981', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b']

export default function GestionDemandes() {
    const [demandes, setDemandes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionLoading, setActionLoading] = useState(null) // ID of request being updated
    const [toast, setToast] = useState(null)

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }

    const fetchDemandes = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await demandesAPI.list()
            const rawDemandes = res.data || []
            
            // Map backend fields to frontend expectations
            const mapped = rawDemandes.map(d => {
                const name = d.demandeurNom || 'Collaborateur'
                // Get initials
                const parts = name.split(' ')
                const initials = parts.length > 1 
                    ? (parts[0][0] + parts[1][0]).toUpperCase()
                    : name.substring(0, 2).toUpperCase()

                // Stable color based on name characters
                const charSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                const color = AVATAR_COLORS[charSum % AVATAR_COLORS.length]

                // Map status values: VALIDE -> APPROUVEE, REFUSE -> REJETEE
                let status = 'EN_ATTENTE'
                if (d.statut === 'VALIDE') status = 'APPROUVEE'
                if (d.statut === 'REFUSE') status = 'REJETEE'

                return {
                    id: d.id,
                    demandeur: name,
                    avatar: initials,
                    avatarColor: color,
                    formation: d.titre || 'Formation inconnue',
                    justification: d.description || 'Aucune justification fournie.',
                    date: 'Récemment',
                    priorite: 'NORMAL', // Default fallback priority
                    statut: status
                }
            })
            setDemandes(mapped)
        } catch (err) {
            console.error('Error loading training requests:', err)
            setError('Impossible de charger les demandes de formation. Veuillez vérifier la connexion au serveur.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDemandes()
    }, [fetchDemandes])

    const handleMove = async (id, targetStatut) => {
        setActionLoading(id)
        
        // Map frontend status back to backend enum
        let apiStatut = 'EN_ATTENTE'
        if (targetStatut === 'APPROUVEE') apiStatut = 'VALIDE'
        if (targetStatut === 'REJETEE') apiStatut = 'REFUSE'

        try {
            await demandesAPI.updateStatus(id, apiStatut)
            
            // Update local state on success
            setDemandes(prev => prev.map(d => d.id === id ? { ...d, statut: targetStatut } : d))
            
            let message = "Demande mise en attente"
            if (targetStatut === 'APPROUVEE') message = "La demande a été approuvée (session planifiée automatiquement)."
            if (targetStatut === 'REJETEE') message = "La demande a été rejetée."
            
            showToast(message, 'success')
        } catch (err) {
            console.error('Error updating status:', err)
            showToast("Une erreur est survenue lors de la mise à jour de la demande.", 'error')
        } finally {
            setActionLoading(null)
        }
    }

    const totalMonth = demandes.length
    const approved = demandes.filter(d => d.statut === 'APPROUVEE').length
    const approvalRate = totalMonth > 0 ? Math.round((approved / totalMonth) * 100) : 0
    const pendingCount = demandes.filter(d => d.statut === 'EN_ATTENTE').length

    return (
        <div className="gd-page">
            {/* Toast feedback */}
            {toast && (
                <div className={`gd-toast gd-toast--${toast.type}`}>
                    {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="gd-header">
                <div>
                    <div className="breadcrumb">Tableau de bord &rsaquo; <span>Demandes</span></div>
                    <div className="gd-title-row">
                        <h1>Gestion des Demandes de Formation</h1>
                        <button className="gd-refresh-btn" onClick={fetchDemandes} title="Rafraîchir">
                            <RefreshCw size={14} className={loading ? 'spin' : ''} />
                        </button>
                    </div>
                    <p>Traitez les demandes de vos collaborateurs en temps réel.</p>
                </div>
            </div>

            {/* Loading & Error States */}
            {loading && demandes.length === 0 ? (
                <div className="gd-state">
                    <Loader2 size={36} className="spin gd-spinner" />
                    <p>Chargement des demandes de formation...</p>
                </div>
            ) : error ? (
                <div className="gd-state gd-state--error">
                    <AlertCircle size={36} />
                    <p>{error}</p>
                    <button className="gd-btn-retry" onClick={fetchDemandes}>
                        Réessayer
                    </button>
                </div>
            ) : (
                <>
                    {/* Stats bar */}
                    <div className="gd-stats stagger">
                        <div className="card gd-stat">
                            <div className="gd-stat-icon gd-icon-navy"><AlertCircle size={18} /></div>
                            <div>
                                <div className="gd-stat-label">Total demandes</div>
                                <div className="gd-stat-val">{totalMonth}</div>
                            </div>
                        </div>
                        <div className="card gd-stat">
                            <div className="gd-stat-icon gd-icon-orange"><Calendar size={18} /></div>
                            <div>
                                <div className="gd-stat-label">Ce mois</div>
                                <div className="gd-stat-val">{totalMonth}</div>
                            </div>
                        </div>
                        <div className="card gd-stat">
                            <div className="gd-stat-icon gd-icon-green"><Check size={18} /></div>
                            <div>
                                <div className="gd-stat-label">Taux d'approbation</div>
                                <div className="gd-stat-val">{approvalRate}%</div>
                            </div>
                        </div>
                        <div className="card gd-stat">
                            <div className="gd-stat-icon gd-icon-warn"><Clock size={18} /></div>
                            <div>
                                <div className="gd-stat-label">En attente</div>
                                <div className="gd-stat-val">{pendingCount}</div>
                            </div>
                        </div>
                    </div>

                    {/* Kanban board */}
                    <div className="gd-kanban">
                        {COLUMNS.map(col => {
                            const cards = demandes.filter(d => d.statut === col.key)
                            return (
                                <div key={col.key} className={`gd-column ${col.color}`}>
                                    {/* Column header */}
                                    <div className="gd-col-header">
                                        <div className="gd-col-title">
                                            {col.icon}
                                            <span>{col.label}</span>
                                        </div>
                                        <span className="gd-col-count">{cards.length}</span>
                                    </div>

                                    {/* Cards */}
                                    <div className="gd-cards">
                                        {cards.length === 0 && (
                                            <div className="gd-empty-col">
                                                <span>Aucune demande</span>
                                            </div>
                                        )}
                                        {cards.map(d => (
                                            <KanbanCard 
                                                key={d.id} 
                                                d={d} 
                                                onMove={handleMove} 
                                                colKey={col.key} 
                                                isBusy={actionLoading === d.id}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

function KanbanCard({ d, onMove, colKey, isBusy }) {
    const p = PRIORITE_STYLE[d.priorite] || PRIORITE_STYLE.NORMAL

    return (
        <div className={`gd-card card ${isBusy ? 'gd-card--busy' : ''}`}>
            {/* Top row */}
            <div className="gd-card-top">
                <span className={`prio-badge ${p.cls}`}>{p.label}</span>
                <span className="gd-card-date">{d.date}</span>
            </div>

            {/* User */}
            <div className="gd-card-user">
                <div className="gd-avatar" style={{ background: d.avatarColor }}>{d.avatar}</div>
                <div>
                    <div className="gd-card-name">{d.demandeur}</div>
                    <div className="gd-card-formation">{d.formation}</div>
                </div>
            </div>

            {/* Justification */}
            <p className="gd-card-justif">"{d.justification}"</p>

            {/* Actions */}
            {isBusy ? (
                <div className="gd-card-actions gd-card-actions--busy">
                    <Loader2 size={14} className="spin" />
                    <span>Mise à jour...</span>
                </div>
            ) : (
                <>
                    {colKey === 'EN_ATTENTE' && (
                        <div className="gd-card-actions">
                            <button className="gd-approve" onClick={() => onMove(d.id, 'APPROUVEE')}>
                                <Check size={13} /> Approuver
                            </button>
                            <button className="gd-reject" onClick={() => onMove(d.id, 'REJETEE')}>
                                <X size={13} /> Rejeter
                            </button>
                        </div>
                    )}

                    {colKey === 'APPROUVEE' && (
                        <div className="gd-card-actions">
                            <button className="gd-undo" onClick={() => onMove(d.id, 'EN_ATTENTE')}>
                                <Clock size={13} /> Mettre en attente
                            </button>
                        </div>
                    )}

                    {colKey === 'REJETEE' && (
                        <div className="gd-card-actions">
                            <button className="gd-undo" onClick={() => onMove(d.id, 'EN_ATTENTE')}>
                                <Clock size={13} /> Reconsidérer
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
