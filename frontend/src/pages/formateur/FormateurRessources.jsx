import { useState, useEffect, useCallback } from 'react'
import { Upload, Trash2, Download, ChevronDown, ChevronUp, Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import api, { formateurAPI, documentsAPI } from '../../services/api'
import './FormateurRessources.css'

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
  return new Date(str).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function FormateurRessources() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [uploading, setUploading] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type) => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const load = (silent, onDone) => {
    if (!silent) setLoading(true)
    formateurAPI.ressources()
      .then(({ data }) => setGroups(data))
      .catch(() => {})
      .finally(() => {
        if (!silent) setLoading(false)
        if (onDone) onDone()
      })
  }

  useEffect(load, [])

  const handleUpload = async (formationId, file) => {
    setUploading(formationId)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('entiteType', 'Formation')
    formData.append('entiteId', formationId)
    formData.append('typeDocument', 'SUPPORT')
    try {
      await documentsAPI.upload(formData)
      load(true, () => showToast('Document ajouté.', 'success'))
    } catch (e) {
      alert("Erreur lors de l'upload.")
    }
    setUploading(null)
  }

  const handleDownload = async (doc) => {
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
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await formateurAPI.deleteRessource(deleteTarget.id)
      setDeleteTarget(null)
      load(true, () => showToast('Document supprimé.', 'error'))
    } catch (e) {
      alert('Erreur lors de la suppression.')
      setDeleteTarget(null)
    }
  }

  if (loading) {
    return (
      <div className="fr-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '10px', color: 'var(--gray-400)' }}>
        <Loader2 size={24} className="spin" />
        <span>Chargement des ressources...</span>
      </div>
    )
  }

  return (
    <div className="fr-page">
      {toast && (
        <div className={`fr-toast fr-toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
      <div className="fr-header">
        <div>
          <h1>Ressources</h1>
          <p>Ajoutez et gérez les supports de cours pour vos formations.</p>
        </div>
      </div>

      <div className="fr-list">
        {groups.length === 0 && (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '14px' }}>
            Aucune formation assignée.
          </div>
        )}

        {groups.map(g => {
          const isOpen = expanded === g.formation.id
          const docs = g.documents || []
          const totalDocs = docs.length
          return (
            <div key={g.formation.id} className="card fr-group">
              <div className="fr-group-head" onClick={() => setExpanded(isOpen ? null : g.formation.id)}>
                <div className="fr-group-info">
                  <FileText size={18} className="fr-group-icon" />
                  <div>
                    <div className="fr-group-title">{g.formation.titre}</div>
                    <div className="fr-group-count">{totalDocs} document{totalDocs > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="fr-group-actions">
                  <label className={`btn btn-navy fr-upload-btn ${uploading === g.formation.id ? 'disabled' : ''}`}>
                    <Upload size={14} />
                    {uploading === g.formation.id ? 'Upload...' : 'Ajouter'}
                    <input
                      type="file"
                      className="fr-file-input"
                      disabled={uploading === g.formation.id}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleUpload(g.formation.id, file)
                        e.target.value = ''
                      }}
                    />
                  </label>
                  <button className="fr-expand-btn">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="fr-docs">
                  {docs.length === 0 ? (
                    <div className="fr-docs-empty">Aucun document. Cliquez sur "Ajouter" pour en déposer un.</div>
                  ) : (
                    <table className="fr-doc-table">
                      <thead>
                        <tr>
                          <th>NOM</th>
                          <th>TYPE</th>
                          <th>DATE</th>
                          <th>TAILLE</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {docs.map(doc => {
                          const info = getFileInfo(doc.mimeType)
                          return (
                            <tr key={doc.id}>
                              <td>
                                <div className="fr-doc-name">
                                  <div className="fr-file-icon" style={{ background: info.color }}>{info.short}</div>
                                  <span>{doc.nomFichier}</span>
                                </div>
                              </td>
                              <td><span className="fr-type-badge">{doc.typeDocument}</span></td>
                              <td className="fr-date">{formatDate(doc.dateUpload)}</td>
                              <td className="fr-size">{formatTaille(doc.tailleBits)}</td>
                              <td>
                                <div className="fr-doc-actions">
                                  <button className="fr-action-btn" title="Télécharger" onClick={() => handleDownload(doc)}>
                                    <Download size={14} />
                                  </button>
                                  {doc.canDelete && (
                                    <button className="fr-action-btn fr-action-danger" title="Supprimer" onClick={() => setDeleteTarget(doc)}>
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {deleteTarget && (
        <div className="modal-box">
          <p>Supprimer <strong>{deleteTarget.nomFichier}</strong> ?</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Annuler</button>
            <button className="btn btn-danger" onClick={handleDelete}>Supprimer</button>
          </div>
        </div>
      )}
    </div>
  )
}