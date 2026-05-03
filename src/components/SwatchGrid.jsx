import Swatch from './Swatch.jsx'

function SwatchGrid({ uniqueColors, flowers, onSwatchClick }) {
  if (uniqueColors.length === 0) {
    return (
      <div className="swatch-grid swatch-grid--empty">
        <p className="swatch-empty-msg">Aucune fleur pour ces critères.</p>
      </div>
    )
  }

  return (
    <div className="swatch-grid" id="swatch-export-target">
      {uniqueColors.map((color, i) => {
        const flower = flowers.find(f => f.couleur === color)
        return (
          <Swatch
            key={color}
            color={color}
            flower={flower}
            onClick={() => onSwatchClick(flower)}
            style={{ animationDelay: `${i * 30}ms` }}
          />
        )
      })}
    </div>
  )
}

export default SwatchGrid
