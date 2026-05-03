import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useFlowerFilter } from '../hooks/useFlowerFilter'
import { updateAllLayers } from '../utils/updateSVGColors'
import MonthSlider from './MonthSlider.jsx'
import AltitudeSlider from './AltitudeSlider.jsx'
import ExportButton from './ExportButton.jsx'
import FlowerModal from './FlowerModal.jsx'
import MontagneIllustration from '../illustrations/montagne.svg?react'
import PlaineIllustration from '../illustrations/plaine.svg?react'
import VilleIllustration from '../illustrations/ville.svg?react'

gsap.registerPlugin(ScrollTrigger)

function ExplorerSection() {
  const [altitude, setAltitude] = useState(1000)
  const [month, setMonth] = useState(6)
  const [selectedFlower, setSelectedFlower] = useState(null)
  const [shapeToFlower, setShapeToFlower] = useState({})

  const sectionRef = useRef(null)
  const montRef    = useRef(null)
  const plaineRef  = useRef(null)
  const villeRef   = useRef(null)

  const { flowers, dominantColors, uniqueColors } = useFlowerFilter(altitude, month)

  // Mise à jour couleurs SVG + récupération du mapping forme → fleur
  useEffect(() => {
    const mapping = updateAllLayers(flowers)
    setShapeToFlower(mapping)
  }, [flowers])

  // Ajout des handlers de clic sur les formes SVG
  useEffect(() => {
    const cleanup = []
    Object.entries(shapeToFlower).forEach(([id, flower]) => {
      const el = document.getElementById(id)
      if (!el) return
      const handler = () => setSelectedFlower(flower)
      el.addEventListener('click', handler)
      el.style.cursor = 'pointer'
      cleanup.push(() => {
        el.removeEventListener('click', handler)
        el.style.cursor = ''
      })
    })
    return () => cleanup.forEach(fn => fn())
  }, [shapeToFlower])

  // Parallaxe GSAP
  useEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: 'top top', end: 'bottom bottom', scrub: 1.5 }
      gsap.to(montRef.current,   { y: '-8%',  ease: 'none', scrollTrigger: trigger })
      gsap.to(plaineRef.current, { y: '-18%', ease: 'none', scrollTrigger: trigger })
      gsap.to(villeRef.current,  { y: '-32%', ease: 'none', scrollTrigger: trigger })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="explorer-section" ref={sectionRef}>
      <div className="parallax-container">

        <div className="parallax-layer layer-montagne" ref={montRef}>
          <MontagneIllustration className="svg-layer" />
        </div>
        <div className="parallax-layer layer-plaine" ref={plaineRef}>
          <PlaineIllustration className="svg-layer" />
        </div>
        <div className="parallax-layer layer-ville" ref={villeRef}>
          <VilleIllustration className="svg-layer" />
        </div>

        <div className="controls-overlay">
          <div className="panel panel-dominant">
            <div className="panel-dominant-header">
              <span className="panel-title">Couleurs dominantes</span>
              <ExportButton targetId="dominant-export-target" colors={uniqueColors} />
            </div>
            <div className="dominant-swatches" id="dominant-export-target">
              {dominantColors.map(color => (
                <div key={color} className="dominant-swatch" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>

          <AltitudeSlider value={altitude} onChange={setAltitude} />
          <MonthSlider value={month} onChange={setMonth} />
        </div>
      </div>

      <FlowerModal flower={selectedFlower} onClose={() => setSelectedFlower(null)} />
    </section>
  )
}

export default ExplorerSection
