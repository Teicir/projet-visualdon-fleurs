import gsap from 'gsap'

const BASE_COLOR = '#F5F2EC'

// Persiste les assignations entre les appels : shapeId -> flower
const shapeAssignments = {}

function assignRandomGSAP(flowers, prefix, count, shapeToFlower) {
  // Séparer les formes déjà colorées des spots libres
  const freeIndices = []
  for (let i = 1; i <= count; i++) {
    const id = `${prefix}-${i}`
    if (shapeAssignments[id]) {
      shapeToFlower[id] = shapeAssignments[id]
    } else {
      freeIndices.push(i)
    }
  }

  // Exclure les fleurs déjà utilisées et mélanger le reste
  const usedFlowers = new Set(Object.values(shapeAssignments))
  const available = flowers.filter(f => !usedFlowers.has(f)).sort(() => Math.random() - 0.5)

  freeIndices.forEach((i, idx) => {
    const id = `${prefix}-${i}`
    const el = document.getElementById(id)
    if (!el) return

    const flower = available[idx] ?? null
    const fillColor = flower ? flower.couleur : BASE_COLOR

    gsap.to(el, {
      fill: fillColor,
      duration: 0.8,
      delay: idx * 0.04,
      ease: 'power2.inOut',
    })

    if (flower) {
      shapeAssignments[id] = flower
      shapeToFlower[id] = flower
    }
  })
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
