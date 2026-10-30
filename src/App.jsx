import { useEffect, useState } from 'react'
import './index.css' // global styles for this scene (previously imported by main.jsx)
import SkyClouds from './components/SkyClouds'
import CloudIntro from './components/CloudIntro'
import DelhiScene from './components/DelhiScene'
import { useAmbientSound } from './hooks/useAmbientSound'

export default function App() {
  // 'covered' -> clouds hold, 'parting' -> curtain opens, 'done' -> intro overlay removed
  const [phase, setPhase] = useState('covered')
  const audio = useAmbientSound()
  const { start } = audio

  useEffect(() => {
    const ms = phase === 'covered' ? 2800 : phase === 'parting' ? 4800 : null
    if (ms === null) return
    const t = setTimeout(() => setPhase(phase === 'covered' ? 'parting' : 'done'), ms)
    return () => clearTimeout(t)
  }, [phase])

  // Browsers only allow sound after a user gesture, so the hum starts on the first click.
  useEffect(() => {
    window.addEventListener('pointerdown', start, { once: true })
    return () => window.removeEventListener('pointerdown', start)
  }, [start])

  return (
    <>
      <SkyClouds parting={phase !== 'covered'} front={phase !== 'done'} />
      <DelhiScene revealed={phase !== 'covered'} audio={audio} />
      {phase !== 'done' && (
        <CloudIntro parting={phase === 'parting'} onSkip={() => setPhase((p) => (p === 'covered' ? 'parting' : p))} />
      )}
    </>
  )
}
