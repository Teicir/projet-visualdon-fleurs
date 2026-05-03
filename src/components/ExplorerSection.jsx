import { forwardRef, useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useFlowerFilter } from '../hooks/useFlowerFilter'
import { updateAllLayers } from '../utils/updateSVGColors'
import MonthSlider from './MonthSlider.jsx'
import AltitudeSlider from './AltitudeSlider.jsx'
import SwatchGrid from './SwatchGrid.jsx'
import ExportButton from './ExportButton.jsx'
import FlowerModal from './FlowerModal.jsx'
import MontagneIllustration from '../illustrations/montagne.svg?react'
import PlaineIllustration from '../illustrations/plaine.svg?react'
import VilleIllustration from '../illustrations/ville.svg?react'

gsap.registerPlugin(ScrollTrigger)

const ExplorerSection = forwardRef(function ExplorerSection(_, ref) {
  const [altitude, setAltitude] = useState(1000)
  const [month, setMonth] = useState(6)
  const [selectedFlower, setSelectedFlower] = useState(null)

  const sectionRef = ref
  const montRef   = useRef(null)
  const plaineRef = useRef(null)
  const villeRef  = useRef(null)

  const { flowers, uniqueColors, dominantColors } = useFlowerFilter(altitude, month)

  useEffect(() => { updateAllLayers(flowers) }, [flowers])

  useEffect(() => {
    if (!sectionRef?.current) return
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

          {/* Haut-gauche : Couleurs dominantes */}
          <div className="panel panel-dominant">
            <div className="panel-dominant-header">
              <span className="panel-title">Couleurs dominantes</span>
              <ExportButton targetId="swatch-export-target" colors={uniqueColors} />
            </div>
            <div className="dominant-swatches">
              {dominantColors.map(color => (
                <div key={color} className="dominant-swatch" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>

          {/* Haut-droite : Altitude (slider vertical) */}
          <AltitudeSlider value={altitude} onChange={setAltitude} />

          {/* Bas-gauche : Saison */}
          <MonthSlider value={month} onChange={setMonth} />

          {/* Nuancier complet — centré */}
          <SwatchGrid
            uniqueColors={uniqueColors}
            flowers={flowers}
            onSwatchClick={setSelectedFlower}
          />
        </div>
      </div>

      <FlowerModal flower={selectedFlower} onClose={() => setSelectedFlower(null)} />
    </section>
  )
})

export default ExplorerSection
