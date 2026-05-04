import { useState, useEffect } from 'react'

function parseLocalisation(str) {
  if (!str) return []
  return str.split('\n').filter(Boolean).map(line => {
    const sep = line.indexOf(' : ')
    if (sep === -1) return { label: null, text: line }
    return { label: line.slice(0, sep), text: line.slice(sep + 3) }
  })
}

function FlowerModal({ flowers, onClose }) {
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => { setActiveTab(0) }, [flowers])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!flowers || flowers.length === 0) return null

  const flower = flowers[activeTab] ?? flowers[0]
  const locations = parseLocalisation(flower.localisation)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        <div className="modal-tabs">
          {flowers.map((f, i) => (
            <button
              key={f.nom}
              className={`modal-tab${i === activeTab ? ' modal-tab--active' : ''}`}
              style={i === activeTab ? { '--tab-color': f.couleur } : {}}
              onClick={() => setActiveTab(i)}
            >
              {f.nom}
            </button>
          ))}
        </div>

        <div className="modal-body">
          <div className="modal-top">
            {flower.image && (
              <img
                src={flower.image}
                alt={flower.nom}
                className="modal-image"
                onError={e => { e.target.style.display = 'none' }}
              />
            )}
            <p className="modal-description">{flower.description}</p>
          </div>

          {locations.length > 0 && (
            <div className="modal-localisation">
              <h3 className="modal-localisation-title">Où le trouver ?&nbsp; 🔭</h3>
              {locations.map((loc, i) => (
                <div key={i} className="modal-location-block">
                  {loc.label && <strong className="modal-location-label">{loc.label}</strong>}
                  <p className="modal-location-text">{loc.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
      </div>
    </div>
  )
}

export default FlowerModal
