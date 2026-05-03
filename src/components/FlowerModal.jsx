import { useEffect } from 'react'
import { MOIS_COURTS } from '../data/fleurs'

function FlowerModal({ flower, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!flower) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-color-band" style={{ backgroundColor: flower.couleur }} />

        <div className="modal-body">
          {flower.image && (
            <img
              src={flower.image}
              alt={flower.nom}
              className="modal-image"
              onError={e => { e.target.style.display = 'none' }}
            />
          )}

          <h2 className="modal-nom">{flower.nom}</h2>
          <p className="modal-species">{flower.species}</p>

          <div className="modal-section">
            <h3>Floraison</h3>
            <p>{flower.mois_floraison.map(m => MOIS_COURTS[m]).join(' · ')}</p>
            <p className="modal-floraison-str">{flower.floraison_str}</p>
          </div>

          <div className="modal-section">
            <h3>Description</h3>
            <p>{flower.description}</p>
          </div>

          <div className="modal-section">
            <h3>Où la trouver ?</h3>
            {flower.localisation.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          <div className="modal-section">
            <h3>Altitude</h3>
            <p>{flower.altitude.min} m – {flower.altitude.max} m</p>
          </div>

          <div className="modal-section modal-funfact">
            <h3>Le saviez-vous ?</h3>
            <p>{flower.fun_fact}</p>
          </div>
        </div>

        <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
      </div>
    </div>
  )
}

export default FlowerModal
