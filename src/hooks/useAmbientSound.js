import { useCallback, useEffect, useRef, useState } from 'react'

const VOLUME = 0.25

/**
 * A low, atmospheric hum generated with the Web Audio API.
 * No audio file means no broken paths, no loading, no licensing.
 *
 * Browsers refuse to play sound before the user interacts with the page,
 * so nothing is created until start() is called from a tap/click/key press.
 * Every audio call is wrapped in try/catch so a failure can never take the
 * visuals down with it.
 */
export function useAmbientSound() {
  const ctxRef = useRef(null)
  const masterRef = useRef(null)
  const mutedRef = useRef(false)
  const [muted, setMuted] = useState(false)

  const start = useCallback(() => {
    try {
      if (!ctxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) return
        const ctx = new AudioCtx()

        const master = ctx.createGain()
        master.gain.value = 0

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 220

        // Three drones: two slightly detuned (creates a slow, eerie beating) + a fifth above
        ;[
          { f: 55, type: 'sawtooth', gain: 0.18 },
          { f: 55.4, type: 'sawtooth', gain: 0.18 },
          { f: 82.5, type: 'sine', gain: 0.25 },
        ].forEach(({ f, type, gain }) => {
          const osc = ctx.createOscillator()
          const g = ctx.createGain()
          osc.type = type
          osc.frequency.value = f
          g.gain.value = gain
          osc.connect(g)
          g.connect(filter)
          osc.start()
        })

        // Very slow wobble on the filter so the hum "breathes"
        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.value = 0.07
        lfoGain.gain.value = 60
        lfo.connect(lfoGain)
        lfoGain.connect(filter.frequency)
        lfo.start()

        filter.connect(master)
        master.connect(ctx.destination)

        ctxRef.current = ctx
        masterRef.current = master
        master.gain.setTargetAtTime(mutedRef.current ? 0 : VOLUME, ctx.currentTime, 2.5)
      }
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    } catch (err) {
      console.warn('Ambient sound unavailable:', err)
    }
  }, [])

  const toggleMute = useCallback(() => {
    start()
    mutedRef.current = !mutedRef.current
    setMuted(mutedRef.current)
    const ctx = ctxRef.current
    const master = masterRef.current
    if (ctx && master) {
      master.gain.setTargetAtTime(mutedRef.current ? 0 : VOLUME, ctx.currentTime, 0.3)
    }
  }, [start])

  useEffect(() => {
    return () => {
      try { ctxRef.current?.close() } catch { /* ignore */ }
    }
  }, [])

  return { start, toggleMute, muted }
}
