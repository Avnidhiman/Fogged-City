import { useEffect, useRef } from 'react'
import { VERT, FRAG } from './cloudShader'

const PART_MS = 4600

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
  return s
}

/**
 * Full-screen WebGL cloud sky. `parting` triggers the one-time curtain opening.
 * `front` puts it above the UI (intro) or behind it (afterwards).
 * Idle rendering is throttled (~20fps) because the motion is deliberately near-imperceptible.
 */
export default function SkyClouds({ parting, front }) {
  const canvasRef = useRef(null)
  const state = useRef({ parting: false, start: null })
  state.current.parting = parting

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false })
    if (!gl) return
    let raf
    try {
      const prog = gl.createProgram()
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
      gl.linkProgram(prog)
      gl.useProgram(prog)
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(prog, 'a')
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
      const uRes = gl.getUniformLocation(prog, 'uRes')
      const uTime = gl.getUniformLocation(prog, 'uTime')
      const uPart = gl.getUniformLocation(prog, 'uPart')

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const t0 = performance.now()
      let last = 0

      const draw = (now) => {
        raf = requestAnimationFrame(draw)
        const s = state.current
        if (s.parting && s.start == null) s.start = now
        const k = s.parting ? (reduce ? 1 : Math.min(1, (now - s.start) / PART_MS)) : 0
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
        if (!(s.parting && k < 1) && now - last < 50) return
        last = now

        const w = Math.min(960, Math.round(canvas.clientWidth * 0.55))
        const h = Math.round(w * canvas.clientHeight / Math.max(1, canvas.clientWidth))
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
        gl.viewport(0, 0, w, h)
        gl.uniform2f(uRes, w, h)
        gl.uniform1f(uTime, reduce ? 0 : (now - t0) / 1000)
        gl.uniform1f(uPart, e)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      }
      raf = requestAnimationFrame(draw)
    } catch (err) {
      console.warn('Cloud shader unavailable, continuing without it:', err)
    }
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} className={`sky${front ? ' sky--front' : ''}`} aria-hidden="true" />
}
