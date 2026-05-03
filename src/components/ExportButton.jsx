import { exportPalette } from '../utils/exportPalette'

function ExportButton({ targetId, colors }) {
  return (
    <button
      className="export-btn"
      onClick={() => exportPalette(targetId, colors)}
      title="Télécharger le nuancier"
      aria-label="Télécharger le nuancier"
    >
      ↓
    </button>
  )
}

export default ExportButton
