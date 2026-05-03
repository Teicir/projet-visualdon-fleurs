import { useMemo } from 'react'
import fleursData from '../data/fleurs'

function ColorGrid() {
  const SQUARE_SIZE = 44
  const colors = fleursData.map(f => f.couleur)

  const squares = useMemo(() => {
    const cols = Math.ceil(window.innerWidth / SQUARE_SIZE) + 1
    const rows = Math.ceil(window.innerHeight / SQUARE_SIZE) + 1
    const total = cols * rows
    return {
      cols,
      items: Array.from({ length: total }, (_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.8,
      })),
    }
  }, [])

  return (
    <div className="color-grid" style={{ '--cols': squares.cols }}>
      {squares.items.map(sq => (
        <div
          key={sq.id}
          className="color-square"
          style={{
            backgroundColor: sq.color,
            animationDelay: `${sq.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default ColorGrid
