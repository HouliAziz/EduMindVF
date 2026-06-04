import { useState, useEffect } from 'react'
import { Search, Download, Eye, Loader2 } from 'lucide-react'
import api, { participantsAPI } from '../../services/api'
import './Documents.css'

const FILTERS = ['Tous', 'SUPPORT', 'CONVOCATION', 'ATTESTATION']

const MIME_ICONS = {
    'application/pdf': { short: 'PDF', color: '#ef4444' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { short: 'DOC', color: '#3b82f6' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { short: 'PPT', color: '#f59e0b' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { short: 'XLS', color: '#10b981' },
}

function getFileInfo(mimeType) {
    return MIME_ICONS[mimeType] || { short: 'FILE', color: '#6b7591' }
}

function formatTaille(bits) {
    if (!bits) return '—'
    const bytes = parseInt(bits)
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(str) {
    if (!str) return '—'
    const d = new Date(str)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const FILTER_LABELS = { 'Tous': 'Tous', 'SUPPORT': 'Supports', 'CONVOCATION': 'Convocations', 'ATTESTATION': 'Attestations' }

export default function Documents() {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('Tous')
    const [docs, setDocs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        participantsAPI.documents()
            .then(({ data }) => setDocs(data || []))
            .catch(err => console.error('Documents API error:', err))
            .finally(() => setLoading(false))
    }, [])

    const filtered = docs.filter(d => {
        const matchFilter = filter === 'Tous' || d.typeDocument === filter
        const matchSearch = d.nomFichier?.toLowerCase().includes(search.toLowerCase()) ||
            (d.formation?.toLowerCase() || '').includes(search.toLowerCase())
        return matchFilter && matchSearch
    })

    if (loading) {
        return (
            <div className="documents-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '10px', color: 'var(--gray-400)' }}>
                <Loader2 size={24} className="spin" />
                <span>Chargement...</span>
            </div>
        )
    }

    return (
        <div className="documents-page">
            <div className="breadcrumb">Ressources › <span>Mes Documents</span></div>

            <div className="docs-header">
                <div>
                    <h1>Mes Documents</h1>
                    <p>Consultez et téléchargez vos supports de cours et documents administratifs.</p>
                </div>
            </div>

            <div className="docs-toolbar card">
                <div className="docs-search">
                    <Search size={14} />
                    <input
                        placeholder="Rechercher un document par nom ou formation..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="docs-filters">
                    <span className="filter-label">FILTRER PAR :</span>
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            className={`filter-chip ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {FILTER_LABELS[f]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card docs-table-card">
                <table className="docs-table">
                    <thead>
                        <tr>
                            <th>NOM DU DOCUMENT</th>
                            <th>FORMATION</th>
                            <th>DATE D'AJOUT</th>
                            <th>TAILLE</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0
                            ? <tr><td colSpan={5} className="docs-empty">Aucun document trouvé</td></tr>
                            : filtered.map(doc => {
                                const info = getFileInfo(doc.mimeType)
                                return (
                                    <tr key={doc.id}>
                                        <td>
                                            <div className="doc-name-cell">
                                                <div className="file-icon" style={{ background: info.color }}>
                                                    {info.short}
                                                </div>
                                                <div>
                                                    <div className="doc-filename">{doc.nomFichier}</div>
                                                    <div className="doc-categorie">{doc.typeDocument}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="formation-pill">{doc.formation || '—'}</span>
                                        </td>
                                        <td className="doc-date">{formatDate(doc.dateUpload)}</td>
                                        <td className="doc-taille">{formatTaille(doc.tailleBits)}</td>
                                        <td>
                                            <div className="doc-actions">
                                                <button className="doc-action-btn doc-download-btn" title="Télécharger" onClick={async () => {
                                                    try {
                                                        const res = await api.get(`/documents/${doc.id}`, { responseType: 'blob' })
                                                        const url = URL.createObjectURL(res.data)
                                                        const a = document.createElement('a')
                                                        a.href = url
                                                        a.download = doc.nomFichier
                                                        document.body.appendChild(a)
                                                        a.click()
                                                        document.body.removeChild(a)
                                                        URL.revokeObjectURL(url)
                                                    } catch (err) {
                                                        console.error('Download failed:', err)
                                                    }
                                                }}>
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>

                <div className="docs-pagination">
                    <span>Affichage de {filtered.length} sur {docs.length} document{docs.length > 1 ? 's' : ''}</span>
                </div>
            </div>
        </div>
    )
}
