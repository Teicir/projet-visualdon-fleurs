import gsap from 'gsap'

const BASE_COLOR = '#F5F2EC'

function assignRandomGSAP(flowers, prefix, count, shapeToFlower) {
  const shuffled = [...flowers].sort(() => Math.random() - 0.5)

  for (let i = 1; i <= count; i++) {
    const el = document.getElementById(`${prefix}-${i}`)
    if (!el) continue

    const flower = shuffled[i - 1] ?? null
    const fillColor = flower ? flower.couleur : BASE_COLOR

    gsap.to(el, {
      fill: fillColor,
      duration: 0.8,
      delay: (i - 1) * 0.04,
      ease: 'power2.inOut',
    })

    if (flower) shapeToFlower[`${prefix}-${i}`] = flower
  }
}

export function updateAllLayers(flowers) {
  const montFlowers   = flowers.filter(f => f.altitude.max >= 1500)
  const plaineFlowers = flowers.filter(f => f.altitude.min <= 1500 && f.altitude.max >= 300)
  const villeFlowers  = flowers.filter(f => f.altitude.min <= 600)

  const shapeToFlower = {}

  assignRandomGSAP(montFlowers,   'montagne', 20, shapeToFlower)
  assignRandomGSAP(plaineFlowers, 'plaine',   35, shapeToFlower)
  assignRandomGSAP(villeFlowers,  'ville',    31, shapeToFlower)

  return shapeToFlower
}
