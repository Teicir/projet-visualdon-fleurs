# Le Nuancier des Fleurs Suisses — Spécification Technique

> Site scrollytelling interactif permettant d'explorer les couleurs de la flore suisse par altitude et par mois de floraison.

---

## Table des matières

1. [Stack technique](#1-stack-technique)
2. [Structure du projet](#2-structure-du-projet)
3. [Données](#3-données)
4. [Architecture des composants](#4-architecture-des-composants)
5. [Page d'accueil — HeroSection](#5-page-daccueil--herosection)
6. [Page Explorateur — ExplorerSection](#6-page-explorateur--explorersection)
7. [Logique de filtrage](#7-logique-de-filtrage)
8. [Composant Nuancier](#8-composant-nuancier)
9. [Modale Fiche Détail](#9-modale-fiche-détail)
10. [Export du nuancier](#10-export-du-nuancier)
11. [Styles & Design System](#11-styles--design-system)
12. [Comportement Scrollytelling](#12-comportement-scrollytelling)
13. [Checklist d'implémentation](#13-checklist-dimplémentation)

---

## 1. Stack technique

| Choix | Justification |
|---|---|
| **React (Vite)** | Gestion d'état réactive pour les sliders et le filtrage en temps réel |
| **CSS Modules ou Tailwind** | Au choix — préférer CSS Modules pour le contrôle fin des animations |
| **Aucune dépendance de routing** | Site one-page scrollytelling, pas besoin de React Router |
| **`html2canvas` ou `dom-to-image`** | Export PNG du nuancier |
| **Intersection Observer API** | Déclenchement des animations au scroll |

Installation Vite + React :
```bash
npm create vite@latest nuancier-fleurs -- --template react
cd nuancier-fleurs
npm install
npm install html2canvas
```

---

## 2. Structure du projet

```
nuancier-fleurs/
├── public/
│   └── data/
│       └── fleurs.json              ← Copier ici le fichier JSON des fleurs
├── src/
│   ├── components/
│   │   ├── HeroSection.jsx          ← Page d'accueil avec grille de carrés
│   │   ├── ExplorerSection.jsx      ← Section principale avec sliders + nuancier
│   │   ├── ColorGrid.jsx            ← Grille de carrés colorés (hero)
│   │   ├── Swatch.jsx               ← Cercle de couleur cliquable
│   │   ├── SwatchGrid.jsx           ← Grille des cercles filtrés
│   │   ├── FlowerModal.jsx          ← Modale fiche détail d'une fleur
│   │   ├── AltitudeSlider.jsx       ← Slider altitude (300m–2500m)
│   │   ├── MonthSlider.jsx          ← Slider mois (Jan–Déc)
│   │   └── ExportButton.jsx         ← Bouton téléchargement nuancier
│   ├── hooks/
│   │   └── useFlowerFilter.js       ← Hook de filtrage des fleurs
│   ├── utils/
│   │   └── exportPalette.js         ← Logique d'export PNG
│   ├── data/
│   │   └── fleurs.js                ← Import + re-export du JSON
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
└── package.json
```

---

## 3. Données

### Format d'une entrée JSON

```json
{
  "nom": "Vergerette annuelle",
  "species": "Erigeron annuus",
  "famille": "Asteraceae",
  "couleur": "#E59400",
  "nb_occurrences": 111680,
  "altitude": {
    "min": 193,
    "max": 2539
  },
  "mois_floraison": [5, 6, 7, 8, 9, 10],
  "floraison_str": "Début : Les premières fleurs s'ouvrent vers mai...",
  "image": "https://commons.wikimedia.org/wiki/Special:FilePath/...",
  "description": "Venue d'Amérique du Nord...",
  "localisation": "En ville : ...\nEn plaine : ...\nEn montagne : ...",
  "fun_fact": "Chaque capitule est une colonie de 200 à 400 petites fleurs..."
}
```

### Import dans le projet

```js
// src/data/fleurs.js
import fleursData from '../../public/data/fleurs.json'
export default fleursData
```

---

## 4. Architecture des composants

```
App
├── HeroSection              ← Section 1 : hero scrollytelling
│   ├── ColorGrid            ← Grille animée de carrés colorés
│   └── HeroCTA              ← Titre + bouton "Commencer à explorer"
│
└── ExplorerSection          ← Section 2 : explorateur interactif
    ├── MountainBackground   ← Illustration SVG des montagnes (décorative)
    ├── Controls             ← Panneau de contrôles (haut gauche)
    │   ├── MonthSlider      ← Curseur mois Jan–Déc
    │   └── AltitudeSlider   ← Curseur altitude 300m–2500m
    ├── SwatchGrid           ← Nuancier filtré (cercles cliquables)
    │   └── Swatch × N       ← Un cercle par couleur unique
    ├── ExportButton         ← Bouton téléchargement (icône ↓)
    └── FlowerModal          ← Modale fiche détail (conditionnelle)
```

---

## 5. Page d'accueil — HeroSection

### Comportement

- Occupe **100vh** — plein écran
- Fond : **grille de petits carrés colorés** animés, couvrant toute la surface
- Au centre-gauche : bloc noir semi-transparent avec le titre et le CTA
- Au clic sur "Commencer à explorer" : scroll fluide vers `ExplorerSection`

### ColorGrid — Grille de carrés

**Principe :**
- Générer une grille de `N × M` carrés couvrant tout l'écran (taille fixe : 40–50px par carré)
- Chaque carré reçoit une couleur choisie aléatoirement parmi toutes les couleurs du JSON (`fleurs.map(f => f.couleur)`)
- Les couleurs sont tirées aléatoirement mais la distribution reflète la fréquence (les couleurs communes apparaissent plus souvent)

**Animation :**
- Au chargement : les carrés apparaissent avec un `animation-delay` échelonné (stagger) — effet de "remplissage" progressif
- En hover sur un carré : légère élévation (`transform: scale(1.1)`) et ombre portée
- Optionnel : légère animation de pulsation aléatoire sur quelques carrés pour donner vie à la grille

**Code de référence :**

```jsx
// src/components/ColorGrid.jsx
import fleursData from '../data/fleurs'

function ColorGrid() {
  const colors = fleursData.map(f => f.couleur)

  // Calculer le nombre de carrés nécessaires pour couvrir l'écran
  const SQUARE_SIZE = 44 // px
  const cols = Math.ceil(window.innerWidth / SQUARE_SIZE) + 1
  const rows = Math.ceil(window.innerHeight / SQUARE_SIZE) + 1
  const total = cols * rows

  // Générer le tableau de couleurs
  const squares = Array.from({ length: total }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.8, // secondes
  }))

  return (
    <div className="color-grid" style={{ '--cols': cols }}>
      {squares.map(sq => (
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
```

```css
/* ColorGrid CSS */
.color-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(var(--cols), 44px);
  gap: 0;
  overflow: hidden;
}

.color-square {
  width: 44px;
  height: 44px;
  opacity: 0;
  animation: squareReveal 0.3s ease forwards;
}

@keyframes squareReveal {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}

.color-square:hover {
  transform: scale(1.12);
  z-index: 2;
  transition: transform 0.15s ease;
}
```

### HeroCTA — Titre et bouton

```jsx
// Dans HeroSection.jsx
<div className="hero-cta">
  <h1>Le nuancier des<br />fleurs suisses.</h1>
  <button onClick={() => scrollToExplorer()}>
    Commencer à explorer
  </button>
</div>
```

```css
.hero-cta {
  position: absolute;
  left: 5%;
  top: 50%;
  transform: translateY(-50%);
  background: #000;
  color: #fff;
  padding: 2.5rem 3rem;
  max-width: 480px;
  border-radius: 4px;
  z-index: 10;
}

.hero-cta h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  font-family: 'Neue Haas Grotesk', 'Helvetica Neue', sans-serif;
}

.hero-cta button {
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  font-size: 0.85rem;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: background 0.2s, color 0.2s;
}

.hero-cta button:hover {
  background: #fff;
  color: #000;
}
```

---

## 6. Page Explorateur — ExplorerSection

### Layout général

- Occupe **100vh minimum** (ou plus selon le contenu)
- Fond : fond clair (`#F0EEE8`) avec illustration de montagnes en SVG en bas
- En haut à gauche : panneau de contrôles (sliders)
- En haut à droite : indicateur d'altitude
- Au centre : nuancier (cercles colorés)
- Bouton export en haut du nuancier

### MountainBackground

Illustration SVG décorative en bas de la section, similaire à la maquette :
- Plusieurs formes de montagnes superposées
- Les couleurs des montagnes changent dynamiquement selon le filtre actuel (utiliser les 4–5 couleurs dominantes du nuancier filtré)
- Lignes de hachures SVG sur les flancs pour la texture

```jsx
// src/components/MountainBackground.jsx
function MountainBackground({ dominantColors }) {
  // dominantColors : tableau des 4-5 premières couleurs du filtre actuel
  const [c1, c2, c3, c4, c5] = dominantColors

  return (
    <svg
      className="mountain-bg"
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMax slice"
    >
      {/* Montagne arrière-plan */}
      <polygon points="0,400 200,150 400,400" fill={c1 || '#D4A5A5'} />
      <polygon points="150,400 350,100 600,400" fill={c2 || '#C8A0C0'} />
      <polygon points="400,400 650,80 900,400"  fill={c3 || '#A0B8D4'} />
      <polygon points="700,400 950,120 1200,400" fill={c4 || '#C4B0A0'} />
      <polygon points="950,400 1100,200 1200,300 1200,400" fill={c5 || '#D4C0B0'} />
      {/* Lignes de hachures SVG sur les flancs */}
      {/* ... ajouter des <line> ou <path> pour les hachures */}
    </svg>
  )
}
```

> **Note :** Pour les hachures comme dans la maquette, utiliser des `<clipPath>` SVG + patterns de lignes diagonales.

---

## 7. Logique de filtrage

### Hook `useFlowerFilter`

```js
// src/hooks/useFlowerFilter.js
import { useMemo } from 'react'
import fleursData from '../data/fleurs'

/**
 * Filtre les fleurs selon l'altitude et le mois choisis.
 *
 * @param {number} altitude  - Altitude choisie en mètres (300–2500)
 * @param {number} month     - Mois choisi (1=Jan, 12=Déc)
 * @returns {Object} { flowers, uniqueColors, dominantColors }
 */
export function useFlowerFilter(altitude, month) {
  return useMemo(() => {
    const flowers = fleursData.filter(flower => {
      // Condition altitude : l'altitude choisie est dans la plage de la fleur
      const altOk =
        altitude >= flower.altitude.min &&
        altitude <= flower.altitude.max

      // Condition mois : le mois choisi est dans la liste de floraison
      const monthOk = flower.mois_floraison.includes(month)

      return altOk && monthOk
    })

    // Couleurs uniques (Set pour dédupliquer)
    const uniqueColors = [...new Set(flowers.map(f => f.couleur))]

    // Couleurs dominantes : les 6 premières (pour les cercles du panneau
    // et les montagnes)
    const dominantColors = uniqueColors.slice(0, 6)

    return { flowers, uniqueColors, dominantColors }
  }, [altitude, month])
}
```

### Utilisation dans ExplorerSection

```jsx
const [altitude, setAltitude] = useState(1000)  // défaut : 1000m
const [month, setMonth]       = useState(6)      // défaut : juin

const { flowers, uniqueColors, dominantColors } = useFlowerFilter(altitude, month)
```

---

## 8. Composant Nuancier

### SwatchGrid — Grille de cercles

```jsx
// src/components/SwatchGrid.jsx
function SwatchGrid({ uniqueColors, flowers, onSwatchClick }) {
  return (
    <div className="swatch-grid" id="swatch-export-target">
      {uniqueColors.map(color => {
        // Trouver la première fleur correspondant à cette couleur
        const flower = flowers.find(f => f.couleur === color)
        return (
          <Swatch
            key={color}
            color={color}
            flower={flower}
            onClick={() => onSwatchClick(flower)}
          />
        )
      })}
    </div>
  )
}
```

### Swatch — Cercle cliquable

```jsx
// src/components/Swatch.jsx
function Swatch({ color, flower, onClick }) {
  return (
    <button
      className="swatch"
      style={{ backgroundColor: color }}
      onClick={onClick}
      title={flower?.nom}
      aria-label={`Voir la fleur ${flower?.nom}`}
    />
  )
}
```

```css
.swatch-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 1rem;
  max-width: 600px;
}

.swatch {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.swatch:hover {
  transform: scale(1.18);
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
}

.swatch:active {
  transform: scale(0.95);
}
```

### Panneau "Couleurs dominantes"

Afficher les 6 premières couleurs du filtre en cercles légèrement plus grands, dans le panneau en haut à gauche (comme dans la maquette) :

```jsx
<div className="dominant-panel">
  <span className="panel-label">Couleurs dominantes</span>
  <ExportButton targetId="swatch-export-target" colors={uniqueColors} />
  <div className="dominant-swatches">
    {dominantColors.map(color => (
      <div
        key={color}
        className="dominant-swatch"
        style={{ backgroundColor: color }}
      />
    ))}
  </div>
</div>
```

---

## 9. Modale Fiche Détail

### FlowerModal — Structure

```jsx
// src/components/FlowerModal.jsx
function FlowerModal({ flower, onClose }) {
  if (!flower) return null

  // Fermer au clic sur le backdrop
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        {/* Bande de couleur en haut */}
        <div
          className="modal-color-band"
          style={{ backgroundColor: flower.couleur }}
        />

        {/* Contenu */}
        <div className="modal-body">

          {/* Image */}
          {flower.image && (
            <img
              src={flower.image}
              alt={flower.nom}
              className="modal-image"
              onError={e => { e.target.style.display = 'none' }}
            />
          )}

          {/* Nom */}
          <h2 className="modal-nom">{flower.nom}</h2>
          <p className="modal-species">{flower.species}</p>

          {/* Période de floraison */}
          <div className="modal-section">
            <h3>🌸 Floraison</h3>
            <p>{flower.mois_floraison.map(m => MOIS_LABELS[m]).join(' · ')}</p>
            <p className="modal-floraison-str">{flower.floraison_str}</p>
          </div>

          {/* Description */}
          <div className="modal-section">
            <h3>Description</h3>
            <p>{flower.description}</p>
          </div>

          {/* Localisation */}
          <div className="modal-section">
            <h3>📍 Où la trouver ?</h3>
            {flower.localisation.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {/* Altitude */}
          <div className="modal-section">
            <h3>⛰️ Altitude</h3>
            <p>{flower.altitude.min} m – {flower.altitude.max} m</p>
          </div>

          {/* Fun fact */}
          <div className="modal-section modal-funfact">
            <h3>💡 Le saviez-vous ?</h3>
            <p>{flower.fun_fact}</p>
          </div>

        </div>

        {/* Bouton fermer */}
        <button className="modal-close" onClick={onClose}>✕</button>

      </div>
    </div>
  )
}

const MOIS_LABELS = {
  1: 'Jan', 2: 'Fév', 3: 'Mar', 4: 'Avr', 5: 'Mai', 6: 'Juin',
  7: 'Juil', 8: 'Août', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Déc'
}
```

### CSS Modale

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.modal-card {
  background: #fff;
  border-radius: 12px;
  max-width: 480px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.25s ease;
}

.modal-color-band {
  height: 8px;
  border-radius: 12px 12px 0 0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.modal-nom {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0.2rem;
}

.modal-species {
  font-style: italic;
  color: #888;
  margin: 0 0 1.2rem;
  font-size: 0.9rem;
}

.modal-section {
  margin-bottom: 1.2rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.modal-section h3 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #999;
  margin-bottom: 0.4rem;
}

.modal-funfact {
  background: #f9f7f2;
  border-radius: 8px;
  padding: 1rem;
  border-top: none;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: rgba(0,0,0,0.08);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
```

---

## 10. Export du nuancier

### Logique d'export PNG

```js
// src/utils/exportPalette.js
import html2canvas from 'html2canvas'

/**
 * Exporte le nuancier affiché en PNG téléchargeable.
 * @param {string} targetId  - ID de l'élément DOM à capturer
 * @param {string[]} colors  - Tableau des couleurs hex (fallback si DOM échoue)
 */
export async function exportPalette(targetId, colors) {
  try {
    const element = document.getElementById(targetId)
    if (!element) throw new Error('Element non trouvé')

    const canvas = await html2canvas(element, {
      backgroundColor: '#F0EEE8',
      scale: 2, // haute résolution
    })

    const link = document.createElement('a')
    link.download = `nuancier-fleurs-suisses-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()

  } catch (err) {
    // Fallback : générer un canvas manuellement depuis les couleurs
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
```

### Composant ExportButton

```jsx
// src/components/ExportButton.jsx
import { exportPalette } from '../utils/exportPalette'

function ExportButton({ targetId, colors }) {
  return (
    <button
      className="export-btn"
      onClick={() => exportPalette(targetId, colors)}
      title="Télécharger le nuancier"
    >
      ↓
    </button>
  )
}
```

---

## 11. Styles & Design System

### Variables CSS globales

```css
:root {
  /* Couleurs système */
  --bg-hero:       #1a1a1a;
  --bg-explorer:   #F0EEE8;
  --bg-panel:      #ffffff;
  --text-primary:  #1a1a1a;
  --text-secondary:#888888;
  --border:        #e0ddd5;

  /* Typographie */
  --font-display: 'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --font-body:    Georgia, 'Times New Roman', serif;

  /* Espacements */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 32px;
  --space-xl: 64px;

  /* Animations */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### Typographie

- **Titres** : Helvetica Neue Bold / Neue Haas Grotesk — géométrique, suisse (clin d'œil au contexte)
- **Corps** : Georgia — contraste élégant avec les titres sans empattements
- **Labels UI** (sliders, boutons) : Helvetica Neue Regular, uppercase, letter-spacing élevé

### Sliders — Style personnalisé

Les sliders doivent être stylisés avec CSS custom pour correspondre à la maquette (fond blanc, curseur circulaire, ligne fine) :

```css
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 2px;
  background: #ddd;
  border-radius: 2px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #22c55e; /* vert comme dans la maquette */
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
```

---

## 12. Comportement Scrollytelling

### Structure de scroll

```jsx
// App.jsx
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
```

### Animation d'entrée de l'ExplorerSection

Utiliser `IntersectionObserver` pour déclencher l'apparition des éléments quand l'utilisateur scroll vers la section :

```js
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) setVisible(true)
    },
    { threshold: 0.2 }
  )
  if (ref.current) observer.observe(ref.current)
  return () => observer.disconnect()
}, [])
```

### Transitions des sliders

Quand l'utilisateur change le slider :
1. Le nuancier actuel **fade out** (opacity 0, durée 150ms)
2. Le filtrage est calculé
3. Les nouveaux cercles **fade in + scale** avec un stagger (délai croissant par cercle)

```css
.swatch {
  animation: swatchAppear 0.3s var(--ease-spring) both;
}

@keyframes swatchAppear {
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1); }
}
```

Pour le stagger en React :

```jsx
{uniqueColors.map((color, i) => (
  <Swatch
    key={color}
    color={color}
    style={{ animationDelay: `${i * 30}ms` }}
    ...
  />
))}
```

---

## 13. Checklist d'implémentation

### Phase 1 — Structure de base
- [ ] Initialiser le projet Vite + React
- [ ] Copier `fleurs.json` dans `public/data/`
- [ ] Créer `src/data/fleurs.js` avec l'import
- [ ] Créer `App.jsx` avec les deux sections

### Phase 2 — HeroSection
- [ ] Implémenter `ColorGrid` avec les carrés colorés
- [ ] Animer l'apparition des carrés au chargement
- [ ] Ajouter le bloc titre + bouton CTA
- [ ] Scroll fluide vers ExplorerSection au clic

### Phase 3 — Filtrage
- [ ] Implémenter `useFlowerFilter` avec les deux conditions
- [ ] Tester le filtrage dans la console
- [ ] Vérifier les cas limites (aucun résultat, un seul résultat)

### Phase 4 — ExplorerSection
- [ ] Implémenter `MonthSlider` (labels Jan–Déc)
- [ ] Implémenter `AltitudeSlider` (300m–2500m)
- [ ] Connecter les sliders au hook de filtrage
- [ ] Afficher `SwatchGrid` avec les couleurs filtrées
- [ ] Panneau "Couleurs dominantes" en haut à gauche
- [ ] Indicateur d'altitude en haut à droite

### Phase 5 — Interactivité
- [ ] Implémenter `FlowerModal` avec tous les champs
- [ ] Ouverture au clic sur un `Swatch`
- [ ] Fermeture au clic sur le backdrop ou le bouton ✕
- [ ] Fermeture avec la touche Echap
- [ ] Gestion des images cassées (`onError`)

### Phase 6 — Export
- [ ] Installer `html2canvas`
- [ ] Implémenter `exportPalette.js`
- [ ] Ajouter `ExportButton` dans l'interface
- [ ] Tester l'export sur différents filtres

### Phase 7 — Animations & polish
- [ ] Stagger des cercles à l'apparition
- [ ] Transition fade lors du changement de filtre
- [ ] Animation d'entrée de l'ExplorerSection au scroll
- [ ] MountainBackground avec couleurs dynamiques
- [ ] Hover states sur tous les éléments interactifs

### Phase 8 — Accessibilité & robustesse
- [ ] `aria-label` sur tous les boutons sans texte
- [ ] Navigation clavier dans la modale (focus trap)
- [ ] Message "Aucune fleur trouvée" si le filtre est vide
- [ ] Test sur mobile (layout responsive)

---

## Annexe — Labels des mois

```js
export const MOIS_LABELS = {
  1:  'Janvier',
  2:  'Février',
  3:  'Mars',
  4:  'Avril',
  5:  'Mai',
  6:  'Juin',
  7:  'Juillet',
  8:  'Août',
  9:  'Septembre',
  10: 'Octobre',
  11: 'Novembre',
  12: 'Décembre',
}

export const MOIS_COURTS = {
  1: 'Jan', 2: 'Fév', 3: 'Mar', 4: 'Avr',
  5: 'Mai', 6: 'Juin', 7: 'Juil', 8: 'Août',
  9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Déc',
}
```

---

*Généré le 1er mai 2026 — Le Nuancier des Fleurs Suisses*

---

## 14. Parallaxe SVG avec GSAP

### Installation

```bash
npm install gsap
```

GSAP est gratuit pour usage non-commercial. ScrollTrigger est inclus dans le package.

---

### Structure HTML des 3 couches SVG

```jsx
// src/components/ExplorerSection.jsx (structure parallaxe)

<section className="explorer-section" ref={sectionRef}>

  {/* Conteneur parallaxe — sticky pendant le scroll */}
  <div className="parallax-container" ref={parallaxRef}>

    {/* Couche 1 — Montagnes (arrière-plan, bouge lentement) */}
    <div className="parallax-layer layer-montagne" ref={montRef}>
      <MontagneSVG colors={dominantColors} />
    </div>

    {/* Couche 2 — Plaine (milieu) */}
    <div className="parallax-layer layer-plaine" ref={plaineRef}>
      <PlaineSVG colors={dominantColors} />
    </div>

    {/* Couche 3 — Ville (avant-plan, bouge vite) */}
    <div className="parallax-layer layer-ville" ref={villeRef}>
      <VilleSVG colors={dominantColors} />
    </div>

    {/* Interface par-dessus les SVG */}
    <div className="controls-overlay">
      {/* Sliders, nuancier, etc. */}
    </div>

  </div>

</section>
```

---

### CSS des couches

```css
.explorer-section {
  /* Hauteur généreuse pour que le scroll ait de l'espace */
  height: 300vh;
  position: relative;
}

.parallax-container {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

.parallax-layer {
  position: absolute;
  inset: 0;
  will-change: transform; /* optimisation GPU */
}

/* Ordre de z-index : montagne derrière, ville devant */
.layer-montagne { z-index: 1; }
.layer-plaine   { z-index: 2; }
.layer-ville    { z-index: 3; }

.controls-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none; /* les clics passent au travers sauf sur les éléments UI */
}

/* Re-activer les événements sur les éléments interactifs */
.controls-overlay button,
.controls-overlay input,
.controls-overlay .swatch {
  pointer-events: auto;
}

.parallax-layer svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

### GSAP ScrollTrigger — Parallaxe

```js
// src/hooks/useParallax.js
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Hook qui applique l'effet parallaxe sur les 3 couches SVG
 * via GSAP ScrollTrigger.
 *
 * @param {Object} refs - { sectionRef, montRef, plaineRef, villeRef }
 */
export function useParallax({ sectionRef, montRef, plaineRef, villeRef }) {
  useEffect(() => {
    const ctx = gsap.context(() => {

      // La section entière est le trigger
      const trigger = {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5, // 1.5 = léger lissage pour un mouvement fluide
      }

      // Montagne : bouge très peu (arrière-plan lointain)
      gsap.to(montRef.current, {
        y: '-8%',         // remonte de 8% de sa hauteur
        ease: 'none',
        scrollTrigger: trigger,
      })

      // Plaine : vitesse intermédiaire
      gsap.to(plaineRef.current, {
        y: '-18%',
        ease: 'none',
        scrollTrigger: trigger,
      })

      // Ville : bouge le plus (avant-plan proche)
      gsap.to(villeRef.current, {
        y: '-32%',
        ease: 'none',
        scrollTrigger: trigger,
      })

    }, sectionRef)

    // Nettoyage au démontage
    return () => ctx.revert()

  }, [])
}
```

---

### Nommage des formes SVG et changement de couleur

#### Convention de nommage dans Illustrator

Dans vos SVG, nommez chaque forme à coloriser avec un `id` structuré :

```
id="montagne-1"    → première zone de la couche montagne
id="montagne-2"    → deuxième zone
id="plaine-1"
id="plaine-2"
id="ville-1"
id="ville-2"
...
```

Si une forme ne doit pas changer de couleur (contours noirs, hachures), ne lui donnez pas d'`id` ou utilisez un préfixe différent (ex: `id="contour-1"`).

#### Export depuis Illustrator

Dans Illustrator, pour que les `id` des calques soient bien exportés :
1. **Fenêtre → Calques** — renommer chaque forme/groupe avec le nom souhaité
2. **Fichier → Exporter → Exporter sous... → SVG**
3. Options : cocher **"Utiliser les noms de calques Illustrator comme ID"**
4. Style : **"Inline"** (évite les conflits de classes CSS)

#### Fonction de mise à jour des couleurs

La logique est en deux temps :
1. **Filtrer écologiquement** — chaque couche ne reçoit que des couleurs de fleurs compatibles avec son altitude
2. **Assigner aléatoirement** — parmi ces couleurs compatibles, l'assignation aux formes numérotées est aléatoire à chaque changement de filtre

```js
// src/utils/updateSVGColors.js

/**
 * Met à jour les 3 couches SVG avec des couleurs écologiquement correctes
 * mais assignées aléatoirement aux formes.
 *
 * Règle : une fleur ne peut apparaître que dans les couches
 * correspondant à sa plage d'altitude réelle.
 *
 * @param {Array} flowers - Tableau complet des fleurs issues du filtre actuel
 */
export function updateAllLayers(flowers) {
  // Chaque couche filtre ses propres fleurs compatibles
  const montColors  = getColors(flowers.filter(f => f.altitude.max >= 1500))
  const plaineColors = getColors(flowers.filter(f => f.altitude.min <= 1500 && f.altitude.max >= 300))
  const villeColors  = getColors(flowers.filter(f => f.altitude.min <= 600))

  assignRandom(montColors,   'montagne', 8)
  assignRandom(plaineColors, 'plaine',   6)
  assignRandom(villeColors,  'ville',    5)
}

/** Extrait les couleurs uniques d'un tableau de fleurs */
function getColors(flowers) {
  return [...new Set(flowers.map(f => f.couleur))]
}

// Couleur de base des formes sans fleur associée — à ajuster selon votre SVG
const BASE_COLOR = '#F5F2EC'

/**
 * Assigne aléatoirement les couleurs aux formes SVG d'une couche.
 * - Si plus de couleurs que de formes : chaque forme reçoit une couleur unique (sans doublon)
 * - Si moins de couleurs que de formes : les formes restantes reviennent à BASE_COLOR
 *
 * Exemple : 8 formes + 3 couleurs → formes 1-3 colorées, formes 4-8 en beige
 * Exemple : 8 formes + 20 couleurs → 8 couleurs différentes, aucun beige
 */
function assignRandom(colors, prefix, count) {
  // Mélanger les couleurs aléatoirement (shuffle)
  const shuffled = [...colors].sort(() => Math.random() - 0.5)

  for (let i = 1; i <= count; i++) {
    const el = document.getElementById(`${prefix}-${i}`)
    if (!el) continue

    // shuffled[i-1] existe → couleur de fleur, sinon → couleur de base
    el.style.fill = shuffled[i - 1] ?? BASE_COLOR
    el.style.transition = 'fill 0.8s ease'
  }
}
```

> **Exemple concret :**
> - La Vergerette annuelle (193m–2539m) → peut apparaître dans les 3 couches
> - L'Arnica (1200m–2800m) → montagne et plaine uniquement, jamais en ville
> - Le Laurier cerise (0m–800m) → plaine et ville uniquement, jamais en montagne

#### Utilisation dans ExplorerSection

```jsx
import { useEffect } from 'react'
import { updateAllLayers } from '../utils/updateSVGColors'

// À chaque changement de filtre, on passe les fleurs brutes (pas les couleurs)
useEffect(() => {
  updateAllLayers(flowers) // flowers vient de useFlowerFilter()
}, [flowers])
```

---

### Animation GSAP au changement de couleur (optionnel)

Pour un effet plus sophistiqué, remplacer la transition CSS par GSAP avec un stagger :

```js
import gsap from 'gsap'

function assignRandomGSAP(colors, prefix, count) {
  if (!colors.length) return

  for (let i = 1; i <= count; i++) {
    const el = document.getElementById(`${prefix}-${i}`)
    if (!el) continue

    gsap.to(el, {
      fill: colors[Math.floor(Math.random() * colors.length)],
      duration: 0.8,
      delay: (i - 1) * 0.04, // stagger de 40ms entre chaque forme
      ease: 'power2.inOut',
    })
  }
}
```

---

### Résumé du flux de données

```
Sliders (altitude + mois)
         ↓
useFlowerFilter(altitude, mois) → flowers[]
         ↓
updateAllLayers(flowers)
         ↓
  ┌─────────────────────────────────────────┐
  │  filter(alt.max ≥ 1500) → montColors   │ → assignRandom → #montagne-1…8
  │  filter(300–1500m)      → plaineColors │ → assignRandom → #plaine-1…6
  │  filter(alt.min ≤ 600)  → villeColors  │ → assignRandom → #ville-1…5
  └─────────────────────────────────────────┘
         ↓
  Chaque forme reçoit une couleur aléatoire
  parmi celles écologiquement compatibles
  avec sa couche — résultat différent à chaque visite
```

---

### Checklist parallaxe à ajouter à la Phase 7

- [ ] Installer GSAP : `npm install gsap`
- [ ] Importer ScrollTrigger et l'enregistrer : `gsap.registerPlugin(ScrollTrigger)`
- [ ] Nommer toutes les formes dans Illustrator avant export (`montagne-1`, `plaine-1`...)
- [ ] Exporter les 3 SVG avec les IDs préservés
- [ ] Implémenter `useParallax` avec les 3 vitesses différentes
- [ ] Implémenter `updateAllLayers` et l'appeler avec `flowers` (pas `dominantColors`)
- [ ] Tester le scroll sur mobile (ScrollTrigger fonctionne différemment sur iOS)
- [ ] Vérifier que `will-change: transform` est bien sur les couches (performance)
- [ ] Ajouter `gsap.matchMedia()` pour désactiver le parallaxe sur mobile si besoin

