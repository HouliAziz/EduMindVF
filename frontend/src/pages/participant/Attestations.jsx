import { Download, Archive, Clock, ChevronRight } from 'lucide-react'
import './Attestations.css'

const ATTESTATIONS = [
    { id: 1, titre: 'Management de Projet Agile', desc: 'Formation certifiante SFM Technologies sur les méthodologies Scrum et Kanban.', date: '14 Jan 2024', score: 94, statut: 'VALIDE' },
    { id: 2, titre: 'Sécurité Informatique & RGPD', desc: 'Sensibilisation aux risques numériques et conformité européenne des données.', date: '02 Déc 2023', score: 87, statut: 'VALIDE' },
    { id: 3, titre: 'Communication Digitale', desc: 'Votre attestation est en cours de génération après validation finale.', date: null, score: null, statut: 'EN_ATTENTE', progression: 80 },
    { id: 4, titre: 'Leadership & Management', desc: 'Développement des compétences managériales et gestion des conflits en équipe.', date: '15 Nov 2023', score: 91, statut: 'VALIDE' },
    { id: 5, titre: "Bases de la Finance d'Entreprise", desc: 'Comprendre les bilans, les comptes de résultats et les flux de trésorerie.', date: '10 Oct 2023', score: 78, statut: 'VALIDE' },
]

export default function Attestations() {
    const total = ATTESTATIONS.filter(a => a.statut === 'VALIDE').length
    const thisYear = ATTESTATIONS.filter(a => a.statut === 'VALIDE' && a.date?.includes('2024')).length
    const enAttente = ATTESTATIONS.filter(a => a.statut === 'EN_ATTENTE').length

    return (
        <div className="attestations-page">
            {/* Header */}
            <div className="att-header">
                <div>
                    <h1>Mes Attestations</h1>
                    <p>Gérez et téléchargez vos certifications obtenues durant votre parcours.</p>
                </div>
                <button className="btn btn-primary"><Download size={15} /> Tout exporter (ZIP)</button>
            </div>

            {/* Stats */}
            <div className="att-stats stagger">
                <div className="card att-stat">
                    <div className="att-stat-icon att-icon-navy"><Archive size={20} /></div>
                    <div>
                        <div className="att-stat-label">TOTAL OBTENUES</div>
                        <div className="att-stat-val">{total}</div>
                    </div>
                </div>
                <div className="card att-stat">
                    <div className="att-stat-icon att-icon-orange"><Download size={20} /></div>
                    <div>
                        <div className="att-stat-label">CETTE ANNÉE</div>
                        <div className="att-stat-val">{String(thisYear).padStart(2, '0')}</div>
                    </div>
                </div>
                <div className="card att-stat">
                    <div className="att-stat-icon att-icon-gray"><Clock size={20} /></div>
                    <div>
                        <div className="att-stat-label">EN ATTENTE</div>
                        <div className="att-stat-val">{String(enAttente).padStart(2, '0')}</div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="att-grid stagger">
                {ATTESTATIONS.map(a => <AttCard key={a.id} a={a} />)}

                {/* Promo card */}
                <div className="card att-promo">
                    <div className="att-promo-icon"><span>🎓</span></div>
                    <h3>Prêt pour la suite ?</h3>
                    <p>Parcourez notre catalogue et obtenez de nouvelles certifications pour booster votre carrière.</p>
                    <button className="btn btn-primary att-promo-btn">
                        Découvrir les formations <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="att-footer">
                <div className="att-footer-brand">
                    <strong>EduMind</strong>
                    <span>© 2024 SFM Technologies. Tous droits réservés.</span>
                </div>
                <div className="att-footer-links">
                    <a href="#">AIDE</a>
                    <a href="#">VIE PRIVÉE</a>
                    <a href="#">CONDITIONS</a>
                </div>
            </footer>
        </div>
    )
}

function AttCard({ a }) {
    if (a.statut === 'EN_ATTENTE') {
        return (
            <div className="card att-card att-pending">
                <div className="att-pending-icon"><Clock size={24} /></div>
                <h3>{a.titre}</h3>
                <p>{a.desc}</p>
                <div className="att-pending-bar">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${a.progression}%`, background: 'var(--orange)' }} />
                    </div>
                    <span>{a.progression}% Traitement</span>
                </div>
                <div className="att-available"><span>🔒</span> Disponible sous 24h</div>
            </div>
        )
    }

    const scoreColor = a.score >= 90 ? 'var(--success)' : a.score >= 75 ? 'var(--navy)' : 'var(--orange)'

    return (
        <div className="card att-card">
            <div className="att-card-top">
                <div className="att-seal">
                    <div className="att-seal-inner">✓</div>
                </div>
                <div className="att-date-label">
                    <span>Date d'obtention</span>
                    <strong>{a.date}</strong>
                </div>
            </div>

            <h3 className="att-card-title">{a.titre}</h3>
            <p className="att-card-desc">{a.desc}</p>

            <div className="att-score">
                <span>Score final</span>
                <strong style={{ color: scoreColor }}>{a.score}/100</strong>
            </div>

            <div className="att-card-footer">
                <button className="att-dl-btn"><Download size={13} /> Télécharger PDF</button>
                <span className="att-valid-badge">VALIDE</span>
            </div>
        </div>
    )
}
