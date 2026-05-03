import html2canvas from 'html2canvas'

export async function exportPalette(targetId, colors) {
  try {
    const element = document.getElementById(targetId)
    if (!element) throw new Error('Element non trouvé')

    const canvas = await html2canvas(element, {
      backgroundColor: '#F0EEE8',
      scale: 2,
    })

    const link = document.createElement('a')
    link.download = `nuancier-fleurs-suisses-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (err) {
    console.warn('html2canvas échoué, fallback canvas', err)
    exportPaletteCanvas(colors)
  }
}

function exportPaletteCanvas(colors) {
  const SIZE = 80
  const COLS = 8
  const ROWS = Math.ceil(colors.length / COLS)
  const PADDING = 16

  const canvas = document.createElement('canvas')
  canvas.width  = COLS * SIZE + PADDING * 2
  canvas.height = ROWS * SIZE + PADDING * 2

  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#F0EEE8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  colors.forEach((color, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const x = PADDING + col * SIZE + SIZE / 2
    const y = PADDING + row * SIZE + SIZE / 2

    ctx.beginPath()
    ctx.arc(x, y, SIZE / 2 - 6, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  })

  const link = document.createElement('a')
  link.download = `nuancier-fleurs-suisses-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
