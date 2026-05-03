import { useMemo } from 'react'
import fleursData from '../data/fleurs'

export function useFlowerFilter(altitude, month) {
  return useMemo(() => {
    const flowers = fleursData.filter(flower => {
      const altOk = altitude >= flower.altitude.min && altitude <= flower.altitude.max
      const monthOk = flower.mois_floraison.includes(month)
      return altOk && monthOk
    })

    const uniqueColors = [...new Set(flowers.map(f => f.couleur))]
    const dominantColors = uniqueColors.slice(0, 6)

    return { flowers, uniqueColors, dominantColors }
  }, [altitude, month])
}
