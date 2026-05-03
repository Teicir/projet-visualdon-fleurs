import { MOIS_LABELS } from '../data/fleurs'

function MonthSlider({ value, onChange }) {
  return (
    <div className="panel panel-saison">
      <span className="panel-label-small">Saison</span>
      <span className="saison-month">{MOIS_LABELS[value]}</span>
      <div className="saison-slider-row">
        <input
          id="month-slider"
          type="range"
          min={1}
          max={12}
          step={1}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
        />
      </div>
      <div className="slider-ticks">
        <span>Jan</span>
        <span>Déc</span>
      </div>
    </div>
  )
}

export default MonthSlider
