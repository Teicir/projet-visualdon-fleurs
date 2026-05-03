const ALT_MAX = 3786
const ALT_MIN = 300

function AltitudeSlider({ value }) {
  const pct = 100 - ((value - ALT_MIN) / (ALT_MAX - ALT_MIN)) * 100

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
            min={ALT_MIN}
            max={ALT_MAX}
            step={1}
            value={value}
            readOnly
            onChange={() => {}}
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
