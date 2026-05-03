import ColorGrid from './ColorGrid.jsx'

function HeroSection({ onCTAClick }) {
  return (
    <section className="hero-section">
      <ColorGrid />
      <div className="hero-cta">
        <h1>Le nuancier des<br />fleurs suisses.</h1>
        <button onClick={onCTAClick}>Commencer à explorer</button>
      </div>
    </section>
  )
}

export default HeroSection
