import { useEffect, useRef } from 'react'
import type { BreathPhaseType } from '../types'

interface BreathCircleProps {
  phaseType: BreathPhaseType
  progress: number
  reducedMotion: boolean
}

const PHASE_COLORS: Record<string, string> = {
  in: '#0a84ff',
  hold: '#5e5ce6',
  out: '#64d2ff',
  pause: 'rgba(255,255,255,0.15)',
  text: 'rgba(255,255,255,0.1)',
  rest: 'rgba(255,255,255,0.12)',
  grounding: 'rgba(255,255,255,0.15)',
}

function getRadius(phaseType: BreathPhaseType, progress: number, reducedMotion: boolean): number {
  if (reducedMotion) return 44
  if (phaseType === 'in') return 40 + progress * 50
  if (phaseType === 'hold') return 90
  if (phaseType === 'out') return 90 - progress * 50
  return 40
}

export function BreathCircle({ phaseType, progress, reducedMotion }: BreathCircleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const color = PHASE_COLORS[phaseType] ?? PHASE_COLORS.rest
  const radius = getRadius(phaseType, progress, reducedMotion)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const size = canvas.offsetWidth
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, size, size)
    const cx = size / 2
    const cy = size / 2
    const r = (radius / 100) * (size / 2)
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    grad.addColorStop(0, color)
    grad.addColorStop(1, 'transparent')
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
  }, [color, radius])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      aria-hidden="true"
    />
  )
}
