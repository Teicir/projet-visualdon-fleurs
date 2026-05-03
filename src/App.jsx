import { useRef } from 'react'
import HeroSection from './components/HeroSection.jsx'
import ExplorerSection from './components/ExplorerSection.jsx'

function App() {
  const explorerRef = useRef(null)

  const scrollToExplorer = () => {
    explorerRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main>
      <HeroSection onCTAClick={scrollToExplorer} />
      <ExplorerSection ref={explorerRef} />
    </main>
  )
}

export default App
