import { useState } from 'react'
import { Search, RefreshCw, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import './Documents.css'

const DOCS = [
    { id: 1, nom: 'Support_Cours_Management_V2.pdf', type: 'pdf', categorie: 'Supports', formation: 'Management Stratégique', date: '14 Mars 2024', taille: '4.2 MB' },
    { id: 2, nom: 'Convocation_Session_Avril.docx', type: 'docx', categorie: 'Convocations', formation: 'Management Stratégique', date: '10 Mars 2024', taille: '128 KB' },
    { id: 3, nom: 'Presentation_Transformation_Digitale.pptx', type: 'pptx', categorie: 'Supports', formation: 'IA et Business', date: '05 Mars 2024', taille: '12.5 MB' },
    { id: 4, nom: 'Attestation_Fin_Formation_2023.pdf', type: 'pdf', categorie: 'Attestations', formation: 'Soft Skills Mastery', date: '20 Jan 2024', taille: '850 KB' },
]

const FILTERS = ['Tous', 'Supports', 'Convocations', 'Attestations']

const FILE_COLORS = { pdf: '#ef4444', docx: '#3b82f6', pptx: '#f59e0b', xlsx: '#10b981' }
const FILE_ICONS = { pdf: 'PDF', docx: 'DOC', pptx: 'PPT', xlsx: 'XLS' }

export default function Documents() {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('Tous')

    const filtered = DOCS.filter(d =>
        (filter === 'Tous' || d.categorie === filter) &&
        d.nom.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="documents-page">
            {/* Breadcrumb */}
            <div className="breadcrumb">Ressources &rsaquo; <span>Mes Documents</span></div>

            {/* Header */}
            <div className="docs-header">
                <div>
                    <h1>Mes Documents</h1>
                    <p>Consultez et téléchargez vos supports de cours et documents administratifs.</p>
                </div>
                <div className="docs-header-actions">
                    <button className="btn btn-ghost"><RefreshCw size={14} /> Actualiser</button>
                    <button className="btn btn-navy"><Download size={14} /> Tout télécharger</button>
                </div>
            </div>

            {/* Search + filters */}
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
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
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
                            : filtered.map(doc => (
                                <tr key={doc.id}>
                                    <td>
                                        <div className="doc-name-cell">
                                            <div className="file-icon" style={{ background: FILE_COLORS[doc.type] }}>
                                                {FILE_ICONS[doc.type]}
                                            </div>
                                            <div>
                                                <div className="doc-filename">{doc.nom}</div>
                                                <div className="doc-categorie">{doc.categorie}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="formation-pill">{doc.formation}</span>
                                    </td>
                                    <td className="doc-date">{doc.date}</td>
                                    <td className="doc-taille">{doc.taille}</td>
                                    <td>
                                        <div className="doc-actions">
                                            <button className="doc-action-btn" title="Aperçu"><Eye size={16} /></button>
                                            <button className="doc-action-btn doc-download-btn" title="Télécharger"><Download size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="docs-pagination">
                    <span>Affichage de {filtered.length} sur {DOCS.length} documents</span>
                    <div className="pagination-btns">
                        <button className="page-icon-btn" disabled><ChevronLeft size={15} /></button>
                        <button className="page-btn active">1</button>
                        <button className="page-icon-btn"><ChevronRight size={15} /></button>
                    </div>
                </div>
            </div>
        </div>
    )
}
