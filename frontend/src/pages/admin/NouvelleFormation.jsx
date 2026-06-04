import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ArrowRight, Check, X, Info, Loader2, Upload } from 'lucide-react'
import { formationsAPI, participantsAPI, inscriptionsAPI, documentsAPI } from '../../services/api'
import './NouvelleFormation.css'

const STEPS = [
  { id: 1, label: 'Informations' },
  { id: 2, label: 'Participants' },
  { id: 3, label: 'Logistique' },
  { id: 4, label: 'Documents' },
  { id: 5, label: 'Récapitulatif' },
]

const DOMAINES = ['Management & Leadership', 'Informatique', 'Soft Skills', 'Juridique', 'Finance', 'Marketing', 'RH', 'Autre']
const ALLOWED_EXTENSIONS = ['pdf', 'pptx', 'docx', 'doc', 'xlsx']
const MAX_FILE_SIZE = 20 * 1024 * 1024

export default function NouvelleFormation({ formationToEdit, onBack, onToast }) {
  const isEditMode = !!formationToEdit

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const todayStr = () => new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    titre: '',
    domaine: 'Management & Leadership',
    dateDebut: '',
    dateFin: '',
    type: 'INTERNE',
    publics: ['Managers', 'Direction'],
    objectifs: '',
    description: '',
    prixParticipant: 0,
    estimParticipants: 0,
    budgetAlloue: 0,
  })
  const [tagInput, setTagInput] = useState('')
  const [dateError, setDateError] = useState('')

  const [eligibleParticipants, setEligibleParticipants] = useState([])
  const [selectedParticipants, setSelectedParticipants] = useState([])
  const [initialInscriptions, setInitialInscriptions] = useState([]) // { participantId, inscriptionId }[]
  const [loadingParticipants, setLoadingParticipants] = useState(false)

  const [salle, setSalle] = useState('')
  const [selectedEquipements, setSelectedEquipements] = useState(['Vidéoprojecteur', 'Connexion Wi-Fi dédiée'])

  const LOGISTICS_ITEMS = ['Pause café', 'Restauration', 'Logement', 'Transport', 'Location des salles', 'Autre']
  const [logisticsItems, setLogisticsItems] = useState(
    Object.fromEntries(LOGISTICS_ITEMS.map(item => [item, { checked: false, montant: 0 }]))
  )

  const [pendingFiles, setPendingFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)

  const [loadingDetails, setLoadingDetails] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (!formationToEdit) return

    const fetchDetails = async () => {
      setLoadingDetails(true)
      try {
        const [detailRes, inscritsRes] = await Promise.all([
          formationsAPI.get(formationToEdit.id),
          participantsAPI.byFormation(formationToEdit.id),
        ])
        const f = detailRes.data
        setForm({
          titre: f.titre || '',
          domaine: f.domaine || 'Management & Leadership',
          dateDebut: f.dateDebut || '',
          dateFin: f.dateFin || '',
          type: f.typeFormation || 'INTERNE',
          publics: f.publicCible ? f.publicCible.split(', ').map(t => t.trim()) : [],
          objectifs: f.objectifs || '',
          description: f.description || '',
          prixParticipant: f.prixParticipant || 0,
          estimParticipants: 0,
          budgetAlloue: f.budgetAlloue || 0,
        })
        setSalle(f.lieu || '')
        if (f.equipements) setSelectedEquipements(f.equipements)
        if (f.logistics) {
          setLogisticsItems(prev => {
            const next = { ...prev }
            Object.entries(f.logistics).forEach(([k, v]) => {
              if (next[k]) next[k] = { checked: true, montant: v }
            })
            return next
          })
        }
        if (f.documents) {
          setPendingFiles(f.documents.map(d => ({ ...d, name: d.nomFichier, uploaded: true, id: d.id })))
        }
        const inscrits = Array.isArray(inscritsRes.data) ? inscritsRes.data : []
        const enrolledIds = inscrits.map(p => p.participant?.id).filter(Boolean)
        const inscriptions = inscrits
          .filter(p => p.participant?.id)
          .map(p => ({ participantId: p.participant.id, inscriptionId: p.inscriptionId }))
        setSelectedParticipants(enrolledIds)
        setInitialInscriptions(inscriptions)
        set('estimParticipants', enrolledIds.length)
      } catch (err) {
        console.error('Failed to load formation details:', err)
      } finally {
        setLoadingDetails(false)
      }
    }
    fetchDetails()
  }, [formationToEdit])

  const fetchEligibleParticipants = useCallback(async () => {
    setLoadingParticipants(true)
    try {
      const res = await participantsAPI.eligible(form.type)
      setEligibleParticipants(res.data || [])
    } catch (err) {
      console.error('Error fetching eligible participants:', err)
    } finally {
      setLoadingParticipants(false)
    }
  }, [form.type])

  const handleTypeChange = (newType) => {
    if (newType === form.type) return
    set('type', newType)
    setSelectedParticipants([])
  }

  useEffect(() => { fetchEligibleParticipants() }, [fetchEligibleParticipants])
  useEffect(() => { set('estimParticipants', selectedParticipants.length) }, [selectedParticipants])

  useEffect(() => {
    if (form.dateDebut && form.dateFin && form.dateFin < form.dateDebut) {
      setDateError('La date de fin doit être postérieure à la date de début.')
    } else {
      setDateError('')
    }
  }, [form.dateDebut, form.dateFin])

  const dureeJours = (() => {
    if (form.dateDebut && form.dateFin && form.dateFin >= form.dateDebut) {
      const d1 = new Date(form.dateDebut)
      const d2 = new Date(form.dateFin)
      return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)) + 1
    }
    return 0
  })()

  const revenuTotal = form.prixParticipant * form.estimParticipants
  const marge = form.budgetAlloue > 0 ? (((revenuTotal - form.budgetAlloue) / form.budgetAlloue) * 100).toFixed(1) : 0
  const margePositive = marge > 0

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      if (!form.publics.includes(tagInput.trim())) set('publics', [...form.publics, tagInput.trim()])
      setTagInput('')
    }
  }
  const removeTag = (t) => set('publics', form.publics.filter(p => p !== t))

  // ── File handlers ──
  const validateFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      alert(`Format non autorisé. Acceptés: ${ALLOWED_EXTENSIONS.join(', ')}`)
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      alert(`Fichier trop volumineux. Maximum 20Mo.`)
      return false
    }
    return true
  }

  const handleFileInput = (e) => {
    Array.from(e.target.files).forEach(f => {
      if (validateFile(f)) {
        if (!pendingFiles.some(p => p.name === f.name && p.size === f.size)) {
          setPendingFiles(prev => [...prev, { file: f, name: f.name, size: f.size, uploaded: false }])
        }
      }
    })
    e.target.value = ''
  }

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(false)
    Array.from(e.dataTransfer.files).forEach(f => {
      if (validateFile(f)) {
        if (!pendingFiles.some(p => p.name === f.name && p.size === f.size)) {
          setPendingFiles(prev => [...prev, { file: f, name: f.name, size: f.size, uploaded: false }])
        }
      }
    })
  }

  const removeFile = (idx) => setPendingFiles(prev => prev.filter((_, i) => i !== idx))

  const uploadPendingFiles = async (formationId) => {
    const toUpload = pendingFiles.filter(p => !p.uploaded && p.file)
    if (toUpload.length === 0) return
    setUploadingFiles(true)
    const results = []
    for (const p of toUpload) {
      const fd = new FormData()
      fd.append('entiteType', 'Formation')
      fd.append('entiteId', formationId)
      fd.append('typeDocument', 'SUPPORT_PEDAGOGIQUE')
      fd.append('file', p.file)
      try {
        const res = await documentsAPI.upload(fd)
        results.push({ id: res.data.id, nomFichier: res.data.nomFichier, uploaded: true })
      } catch (err) {
        console.error('Upload failed:', p.name, err)
      }
    }
    if (results.length > 0) {
      setPendingFiles(prev => prev.map(p => {
        const match = results.find(r => r.nomFichier === p.name)
        return match ? { ...p, ...match } : p
      }))
    }
    setUploadingFiles(false)
  }

  // ── Submit ──
  const handleSubmit = async () => {
    if (!form.titre.trim()) { setSubmitError('Le titre est requis.'); setStep(1); return }
    if (!form.dateDebut || !form.dateFin) { setSubmitError('Les dates de début et fin sont requises.'); setStep(1); return }
    if (dateError) { setSubmitError(dateError); setStep(1); return }
    if (form.dateDebut && form.dateFin && form.dateFin < form.dateDebut) { setSubmitError('La date de fin doit être après la date de début.'); setStep(1); return }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const dto = {
        titre: form.titre.trim(),
        description: form.objectifs.trim() || `Formation ${form.titre.trim()}`,
        objectifs: form.objectifs.trim() || `Objectifs de ${form.titre.trim()}`,
        publicCible: form.publics.join(', ') || 'Tous publics',
        domaine: form.domaine,
        dateDebut: form.dateDebut,
        dateFin: form.dateFin,
        dureeJours: dureeJours || 1,
        typeFormation: form.type,
        modeSession: 'SUR_SITE',
        lieu: salle,
        equipements: selectedEquipements,
        logistics: Object.fromEntries(Object.entries(logisticsItems).filter(([_, v]) => v.checked).map(([k, v]) => [k, v.montant])),
        budgetAlloue: form.budgetAlloue || null,
        prixParticipant: form.prixParticipant || null,
        statut: formationToEdit?.statut || 'EN_ATTENTE',
      }

      let targetFormationId = null

      if (isEditMode) {
        await formationsAPI.update(formationToEdit.id, dto)
        targetFormationId = formationToEdit.id
      } else {
        const res = await formationsAPI.create(dto)
        targetFormationId = res.data.id
      }

      // Sync inscriptions
      if (isEditMode) {
        const toRemove = initialInscriptions.filter(ins => !selectedParticipants.includes(ins.participantId))
        if (toRemove.length > 0) {
          await Promise.all(toRemove.map(ins =>
            inscriptionsAPI.supprimer(ins.inscriptionId).catch(() => {})
          ))
        }
        const toAdd = selectedParticipants.filter(id => !initialInscriptions.some(ins => ins.participantId === id))
        if (toAdd.length > 0) {
          await Promise.all(toAdd.map(pid =>
            inscriptionsAPI.ajouter({ formationId: targetFormationId, participantId: pid, montantPaye: form.prixParticipant })
          ))
        }
      } else if (selectedParticipants.length > 0) {
        await Promise.all(selectedParticipants.map(pid =>
          inscriptionsAPI.ajouter({ formationId: targetFormationId, participantId: pid, montantPaye: form.prixParticipant })
        ))
      }

      // Upload documents
      await uploadPendingFiles(targetFormationId)

      if (onToast) onToast({ type: 'success', message: isEditMode ? 'Formation modifiée avec succès !' : 'Formation créée avec succès !' })
      onBack()
    } catch (err) {
      const detail = err.response?.data?.details || err.response?.data?.error || 'Erreur lors de l\'enregistrement.'
      setSubmitError(detail)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="nouvelle-formation">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={16} /> Retour aux formations
      </button>
      <h1 className="nf-title">{isEditMode ? 'Modifier le Programme' : 'Nouveau Programme'}</h1>

      <div className="stepper">
        {STEPS.map((s, i) => (
          <div key={s.id} className={`step-item ${step === s.id ? 'active' : step > s.id ? 'done' : ''}`}>
            <div className="step-circle" onClick={() => step > s.id && setStep(s.id)}>
              {step > s.id ? <Check size={14} /> : s.id}
            </div>
            <span className="step-label">{s.label}</span>
            {i < STEPS.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      {isEditMode && loadingDetails && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10, color: 'var(--gray-400)' }}>
          <Loader2 size={24} className="spin" /><span>Chargement des détails…</span>
        </div>
      )}
      {!loadingDetails && (
      <div className="nf-body">
        <div className="nf-form card">
          {/* Step 1: Informations */}
          {step === 1 && (
            <div className="form-section">
              <h2><span className="step-num">1</span> Détails de la Formation</h2>

              <div className="field-group">
                <label>Titre de la Formation</label>
                <input type="text" placeholder="Ex: Leadership et Intelligence Emotionnelle"
                  value={form.titre} onChange={e => set('titre', e.target.value)} />
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Domaine</label>
                  <select value={form.domaine} onChange={e => set('domaine', e.target.value)}>
                    {DOMAINES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label>Type de Formation</label>
                  <div className="type-selector">
                    <label className={`type-option ${form.type === 'INTERNE' ? 'selected' : ''}`}>
                      <input type="radio" name="type" value="INTERNE" checked={form.type === 'INTERNE'}
                        onChange={() => handleTypeChange('INTERNE')} />
                      Interne
                    </label>
                    <label className={`type-option ${form.type === 'EXTERNE' ? 'selected' : ''}`}>
                      <input type="radio" name="type" value="EXTERNE" checked={form.type === 'EXTERNE'}
                        onChange={() => handleTypeChange('EXTERNE')} />
                      Externe (Payant)
                    </label>
                  </div>
                </div>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Date de début</label>
                  <input type="date" value={form.dateDebut}
                    onChange={e => { set('dateDebut', e.target.value); setDateError('') }}
                    min={!isEditMode ? todayStr() : undefined} />
                </div>
                <div className="field-group">
                  <label>Date de fin</label>
                  <input type="date" value={form.dateFin}
                    onChange={e => { set('dateFin', e.target.value); setDateError('') }}
                    min={form.dateDebut || (!isEditMode ? todayStr() : undefined)} />
                </div>
              </div>
              {dateError && <p style={{ color: '#dc2626', fontSize: 12, margin: '-8px 0 0' }}>{dateError}</p>}
              {dureeJours > 0 && !dateError && (
                <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: '-8px 0 0' }}>
                  Durée calculée : <strong>{dureeJours} jour{dureeJours > 1 ? 's' : ''}</strong>
                </p>
              )}

              <div className="field-group">
                <label>Public Cible</label>
                <div className="tag-input-wrap">
                  {form.publics.map(t => (
                    <span key={t} className="tag">{t}<button onClick={() => removeTag(t)}><X size={11} /></button></span>
                  ))}
                  <input placeholder="Ajouter un tag..." value={tagInput}
                    onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} />
                </div>
              </div>

              <div className="field-group">
                <label>Objectifs Pédagogiques</label>
                <textarea placeholder="Quels sont les résultats attendus ?"
                  value={form.objectifs} onChange={e => set('objectifs', e.target.value)} rows={4} />
              </div>
            </div>
          )}

          {/* Step 2: Participants */}
          {step === 2 && (
            <div className="form-section">
              <h2><span className="step-num">2</span> Sélection des Participants</h2>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '4px' }}>
                Sélectionnez les participants éligibles pour cette formation <strong>({form.type === 'INTERNE' ? 'Employés Internes' : 'Clients Externes'})</strong>.
              </p>
              {loadingParticipants ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '10px', color: 'var(--gray-400)' }}>
                  <Loader2 size={24} className="spin" /><span>Chargement...</span>
                </div>
              ) : eligibleParticipants.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--gray-400)', background: 'var(--gray-50)', borderRadius: '8px', border: '1px dashed var(--gray-200)', fontSize: '13.5px' }}>
                  Aucun participant éligible pour le type {form.type === 'INTERNE' ? 'Interne' : 'Externe'}.
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {eligibleParticipants.map(p => {
                    const isSelected = selectedParticipants.includes(p.id)
                    return (
                      <label key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                        border: isSelected ? '1.5px solid var(--navy)' : '1.5px solid var(--gray-200)',
                        borderRadius: '8px', cursor: 'pointer',
                        background: isSelected ? 'rgba(27,58,122,0.02)' : 'var(--white)',
                        transition: 'all 0.15s'
                      }}>
                        <input type="checkbox" checked={isSelected}
                          onChange={() => {
                            if (isSelected) setSelectedParticipants(selectedParticipants.filter(id => id !== p.id))
                            else setSelectedParticipants([...selectedParticipants, p.id])
                          }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--gray-800)' }}>
                            {p.utilisateur?.prenom} {p.utilisateur?.nom}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--gray-400)' }}>
                            {p.utilisateur?.email} {p.entreprise ? `• ${p.entreprise}` : ''}
                          </div>
                        </div>
                        <span style={{
                          padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                          background: p.type === 'EMPLOYE' ? '#eff6ff' : '#faf5ff',
                          color: p.type === 'EMPLOYE' ? '#1d4ed8' : '#7e22ce'
                        }}>
                          {p.type === 'EMPLOYE' ? 'Employé' : 'Client'}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Logistique */}
          {step === 3 && (
            <div className="form-section">
              <h2><span className="step-num">3</span> Configuration Logistique</h2>
              <div className="field-group">
                <label>Salle / Lieu de la Formation</label>
                <input type="text" placeholder="Ex: Salle B, Site Principal ou URL Teams"
                  value={salle} onChange={e => setSalle(e.target.value)} />
              </div>
              <div className="field-group">
                <label>Équipements Requis</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                  {['Vidéoprojecteur', 'Tableau Blanc Interactif', 'Supports de cours imprimés',
                    'Ordinateurs stagiaires', 'Connexion Wi-Fi dédiée', 'Visioconférence'].map(eq => {
                    const isChecked = selectedEquipements.includes(eq)
                    return (
                      <label key={eq} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--gray-700)' }}>
                        <input type="checkbox" checked={isChecked}
                          onChange={() => {
                            if (isChecked) setSelectedEquipements(selectedEquipements.filter(e => e !== eq))
                            else setSelectedEquipements([...selectedEquipements, eq])
                          }} />
                        {eq}
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="field-group" style={{ marginTop: '8px' }}>
                <label>Services & Prestations</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  {LOGISTICS_ITEMS.map(item => {
                    const li = logisticsItems[item]
                    return (
                      <div key={item} onClick={() => {
                        setLogisticsItems(prev => ({
                          ...prev,
                          [item]: { ...prev[item], checked: !prev[item].checked }
                        }))
                      }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                          borderRadius: '8px', border: li.checked ? '1.5px solid var(--navy)' : '1.5px solid var(--gray-200)',
                          background: li.checked ? '#f0f4ff' : '#fff', cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                          border: li.checked ? 'none' : '2px solid var(--gray-300)',
                          background: li.checked ? 'var(--navy)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {li.checked && <Check size={12} color="#fff" />}
                        </div>
                        <span style={{ flex: 1, fontSize: '13px', fontWeight: li.checked ? 600 : 400, color: li.checked ? 'var(--navy)' : 'var(--gray-700)' }}>
                          {item}
                        </span>
                        {li.checked && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={e => e.stopPropagation()}>
                            <input type="number" placeholder="0" min="0"
                              value={li.montant || ''}
                              onChange={e => {
                                setLogisticsItems(prev => ({
                                  ...prev,
                                  [item]: { ...prev[item], montant: +e.target.value || 0 }
                                }))
                              }}
                              style={{
                                width: '90px', padding: '5px 8px', border: '1.5px solid var(--gray-200)',
                                borderRadius: '6px', fontSize: '13px', textAlign: 'right',
                              }} />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-500)', minWidth: '14px' }}>€</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div className="form-section">
              <h2><span className="step-num">4</span> Supports de Cours</h2>
              <div className="field-group">
                <label>Fichiers (.pdf, .pptx, .docx)</label>
                <div className="nf-file-upload">
                  <input type="file" id="file-input" multiple
                    accept=".pdf,.pptx,.docx,.doc,.xlsx"
                    onChange={handleFileInput} style={{ display: 'none' }} />
                  <div className="upload-dropzone" onDragEnter={handleDrag} onDragLeave={handleDrag}
                    onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input').click()}
                    style={{
                      cursor: 'pointer', background: dragActive ? '#f3f4f6' : 'var(--white)',
                      border: dragActive ? '2px dashed var(--navy)' : '2px dashed var(--gray-300)',
                      padding: '20px', borderRadius: '8px', textAlign: 'center', transition: 'all 0.2s'
                    }}>
                    <Upload size={24} style={{ color: 'var(--gray-400)', marginBottom: 6 }} />
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-500)', fontWeight: 500 }}>
                      Glissez-déposez ou cliquez pour parcourir
                    </p>
                    <span style={{ fontSize: '11px', color: 'var(--gray-400)' }}>PDF, PPTX, DOCX — Max 20Mo</span>
                  </div>
                  {pendingFiles.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {pendingFiles.map((p, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '6px',
                          border: '1px solid var(--gray-100)', fontSize: '12.5px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {p.uploaded && <Check size={14} style={{ color: 'var(--success)' }} />}
                            <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>{p.name}</span>
                            <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                              {p.size ? `${(p.size / 1024 / 1024).toFixed(1)}Mo` : ''}
                            </span>
                          </div>
                          <button type="button" onClick={() => removeFile(i)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Récapitulatif */}
          {step === 5 && (
            <div className="form-section">
              <h2><span className="step-num">5</span> Récapitulatif</h2>
              <div className="recap">
                <div className="recap-row"><span>Titre</span><strong>{form.titre || '—'}</strong></div>
                <div className="recap-row"><span>Type</span><strong>{form.type}</strong></div>
                <div className="recap-row"><span>Domaine</span><strong>{form.domaine}</strong></div>
                <div className="recap-row"><span>Période</span><strong>{form.dateDebut} → {form.dateFin} ({dureeJours}j)</strong></div>
                <div className="recap-row"><span>Public cible</span><strong>{form.publics.join(', ') || 'Aucun'}</strong></div>
                <div className="recap-row"><span>Participants</span><strong>{selectedParticipants.length} inscrits</strong></div>
                <div className="recap-row"><span>Lieu</span><strong>{salle || 'Non spécifié'}</strong></div>
                <div className="recap-row"><span>Équipements</span><strong>{selectedEquipements.join(', ') || 'Aucun'}</strong></div>
                <div className="recap-row"><span>Services</span><strong>{Object.entries(logisticsItems).filter(([_, v]) => v.checked).map(([k, v]) => `${k} (${v.montant}€)`).join(', ') || 'Aucun'}</strong></div>
                <div className="recap-row"><span>Documents</span><strong>{pendingFiles.filter(f => f.uploaded || f.file).length} fichier(s)</strong></div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="nf-nav">
            <button className="btn btn-ghost" onClick={() => step > 1 ? setStep(s => s - 1) : onBack()}>
              <ArrowLeft size={15} /> {step > 1 ? 'Précédent' : 'Annuler'}
            </button>
            {step < 5
              ? <button className="btn btn-navy" onClick={() => setStep(s => s + 1)}>
                  Suivant <ArrowRight size={15} />
                </button>
              : <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting
                    ? <><Loader2 size={15} className="spin" /> Enregistrement…</>
                    : <><Check size={15} /> {isEditMode ? 'Enregistrer' : 'Créer la formation'}</>
                  }
                </button>
            }
          </div>
          {submitError && (
            <div style={{ color: '#dc2626', fontSize: 13, padding: '8px 0 0', textAlign: 'center' }}>
              ⚠️ {submitError}
            </div>
          )}
        </div>

        {/* Right: finance */}
        <div className="nf-finance">
          <div className="card finance-card">
            <h3>Analyse Financière</h3>
            <div className="finance-field">
              <label>Budget Alloué</label>
              <div className="finance-value-row">
                <input type="number" value={form.budgetAlloue}
                  onChange={e => set('budgetAlloue', +e.target.value)} className="finance-input" />
                <span className="finance-unit">€</span>
              </div>
              <div className="finance-bar">
                <div className="finance-bar-fill" style={{ width: margePositive ? '100%' : '50%' }} />
              </div>
            </div>
            <div className="finance-field">
              <label>Prix par Participant</label>
              <div className="finance-value-row">
                <input type="number" value={form.prixParticipant}
                  onChange={e => set('prixParticipant', +e.target.value)} className="finance-input" />
                <span className="finance-unit">€</span>
              </div>
            </div>
            <div className="finance-field">
              <label>Estimation Participants</label>
              <input type="number" value={form.estimParticipants} readOnly
                className="finance-input-full" style={{ background: '#f9fafb', cursor: 'not-allowed' }} />
            </div>
            <div className="finance-divider" />
            <div className="finance-result">
              <div className="finance-result-row">
                <span>Revenu Total Est.</span>
                <strong>{revenuTotal.toLocaleString('fr-FR')} €</strong>
              </div>
              <div className={`marge-badge ${margePositive ? 'marge-pos' : 'marge-neg'}`}>
                <span>Marge</span>
                <strong>{margePositive ? '+' : ''}{marge}%</strong>
              </div>
            </div>
          </div>
          {form.type === 'EXTERNE' && (
            <div className="card info-card">
              <Info size={16} className="info-icon" />
              <p>Formation <strong>Externe</strong> — revenus par inscription payante.</p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  )
}
