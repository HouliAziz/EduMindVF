import { useState } from 'react'
import { Star, Send, Calendar, MapPin } from 'lucide-react'
import './Evaluation.css'

const CRITERES = [
    { key: 'contenu', label: 'Contenu', desc: 'Qualité et densité des informations.' },
    { key: 'pedagogie', label: 'Pédagogie', desc: "Méthode d'enseignement du formateur." },
    { key: 'logistique', label: 'Logistique', desc: 'Locaux, plateformes et organisation.' },
    { key: 'pertinence', label: 'Pertinence', desc: 'Utilité pour votre poste actuel.' },
    { key: 'documents', label: 'Documents', desc: 'Clarté et accessibilité des supports fournis.' },
]

export default function Evaluation() {
    const [noteGlobale, setNoteGlobale] = useState(0)
    const [hoverGlobale, setHoverGlobale] = useState(0)
    const [scores, setScores] = useState({ contenu: 4.5, pedagogie: 5.0, logistique: 3.5, pertinence: 4.0, documents: 4.5 })
    const [commentaire, setCommentaire] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const setScore = (key, val) => setScores(s => ({ ...s, [key]: val }))

    const handleSubmit = () => {
        if (noteGlobale === 0) return
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <div className="eval-success">
                <div className="eval-success-icon">✓</div>
                <h2>Évaluation envoyée !</h2>
                <p>Merci pour votre retour. Il contribue à améliorer nos formations.</p>
                <button className="btn btn-navy" onClick={() => setSubmitted(false)}>Retour</button>
            </div>
        )
    }

    return (
        <div className="evaluation-page">
            {/* Formation info */}
            <div className="eval-formation-info">
                <h1>Advanced Management & Leadership</h1>
                <div className="eval-meta">
                    <span><Calendar size={13} /> 14 Oct - 18 Oct, 2023</span>
                    <span><MapPin size={13} /> Dr. Sarah Jenkins</span>
                    <span className="eval-etape">ÉTAPE 1/2</span>
                </div>
                <div className="eval-progress-bar">
                    <div className="eval-progress-fill" style={{ width: '50%' }} />
                </div>
            </div>

            {/* Note globale */}
            <div className="card eval-card">
                <h2 className="eval-section-title">Note Globale</h2>
                <p className="eval-section-sub">Comment évaluez-vous votre expérience globale de cette formation ?</p>
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(n => (
                        <button
                            key={n}
                            className={`star-btn ${n <= (hoverGlobale || noteGlobale) ? 'filled' : ''}`}
                            onClick={() => setNoteGlobale(n)}
                            onMouseEnter={() => setHoverGlobale(n)}
                            onMouseLeave={() => setHoverGlobale(0)}
                        >
                            <Star size={36} />
                        </button>
                    ))}
                </div>
                {noteGlobale > 0 && (
                    <p className="star-label">
                        {['', 'Très insatisfait', 'Insatisfait', 'Neutre', 'Satisfait', 'Très satisfait'][noteGlobale]}
                    </p>
                )}
            </div>

            {/* Critères détaillés */}
            <div className="card eval-card">
                <h2 className="eval-section-title">Critères Détaillés</h2>
                <p className="eval-section-sub">Placez votre évaluation pour chaque aspect de la session.</p>
                <div className="criteres-grid">
                    {CRITERES.map(c => (
                        <div key={c.key} className="critere-item">
                            <div className="critere-header">
                                <div>
                                    <span className="critere-label">{c.label}</span>
                                    <span className="critere-desc">{c.desc}</span>
                                </div>
                                <span className="critere-score">{scores[c.key].toFixed(1)}</span>
                            </div>
                            <div className="critere-slider-wrap">
                                <input
                                    type="range" min={0} max={5} step={0.5}
                                    value={scores[c.key]}
                                    onChange={e => setScore(c.key, parseFloat(e.target.value))}
                                    className="critere-slider"
                                />
                                <div className="slider-track-fill" style={{ width: `${(scores[c.key] / 5) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Commentaires */}
            <div className="card eval-card">
                <h2 className="eval-section-title">Commentaires Libres</h2>
                <p className="eval-section-sub">Partagez votre expérience, vos suggestions ou vos points forts.</p>
                <textarea
                    className="eval-textarea"
                    placeholder="Tapez votre message ici..."
                    value={commentaire}
                    onChange={e => setCommentaire(e.target.value)}
                    rows={5}
                />
            </div>

            {/* Submit */}
            <div className="eval-submit-row">
                <button
                    className="btn btn-primary eval-submit-btn"
                    onClick={handleSubmit}
                    disabled={noteGlobale === 0}
                >
                    Envoyer l'évaluation <Send size={15} />
                </button>
            </div>
        </div>
    )
}
