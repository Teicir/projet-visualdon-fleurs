function AltitudeSlider({ value, onChange }) {
  const pct = 100 - ((value - 300) / (2500 - 300)) * 100

  return (
    <div className="panel panel-altitude">
      <span className="panel-title">Altitude</span>
      <div className="altitude-body">
        <div className="altitude-track-area">
          <div className="altitude-current-indicator" style={{ top: `${pct}%` }}>
            <span className="altitude-dot" />
            <span className="altitude-current-label">{value}m</span>
          </div>
          <div className="altitude-track-line" />
          <input
            type="range"
            className="altitude-range"
            min={300}
            max={2500}
            step={50}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
          />
        </div>
        <div className="altitude-min-mark">
          <span className="altitude-corner">└</span>
          <span className="altitude-min-label">300m</span>
        </div>
      </div>
    </div>
  )
}

export default AltitudeSlider
