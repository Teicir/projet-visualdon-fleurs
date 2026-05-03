import gsap from 'gsap'

const BASE_COLOR = '#F5F2EC'

function getColors(flowers) {
  return [...new Set(flowers.map(f => f.couleur))]
}

function assignRandomGSAP(colors, prefix, count) {
  const shuffled = [...colors].sort(() => Math.random() - 0.5)

  for (let i = 1; i <= count; i++) {
    const el = document.getElementById(`${prefix}-${i}`)
    if (!el) continue

    gsap.to(el, {
      fill: shuffled[i - 1] ?? BASE_COLOR,
      duration: 0.8,
      delay: (i - 1) * 0.04,
      ease: 'power2.inOut',
    })
  }
}

export function updateAllLayers(flowers) {
  const montColors   = getColors(flowers.filter(f => f.altitude.max >= 1500))
  const plaineColors = getColors(flowers.filter(f => f.altitude.min <= 1500 && f.altitude.max >= 300))
  const villeColors  = getColors(flowers.filter(f => f.altitude.min <= 600))

  assignRandomGSAP(montColors,   'montagne', 20)
  assignRandomGSAP(plaineColors, 'plaine',   35)
  assignRandomGSAP(villeColors,  'ville',    31)
}
