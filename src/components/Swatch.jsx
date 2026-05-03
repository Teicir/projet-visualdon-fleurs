function Swatch({ color, flower, onClick, style }) {
  return (
    <button
      className="swatch"
      style={{ backgroundColor: color, ...style }}
      onClick={onClick}
      title={flower?.nom}
      aria-label={`Voir la fleur ${flower?.nom}`}
    />
  )
}

export default Swatch
