import type { BreathPhase, AppSettings } from '../types'

type BreathSettings = Pick<AppSettings, 'breathInDuration' | 'breathOutDuration'>

function cycles(
  inDur: number,
  outDur: number,
  totalSec: number,
  segmentName?: string,
  holdDur = 0,
): BreathPhase[] {
  const cycleLen = inDur + holdDur + outDur
  const num = Math.floor(totalSec / cycleLen)
  const remainder = totalSec - num * cycleLen
  const result: BreathPhase[] = []
  for (let i = 0; i < num; i++) {
    result.push({ type: 'in', duration: inDur, label: 'Ein', segmentName })
    if (holdDur > 0) result.push({ type: 'hold', duration: holdDur, label: 'Halten', segmentName })
    result.push({ type: 'out', duration: outDur, label: 'Aus', segmentName })
  }
  if (remainder > 0) {
    result.push({ type: 'rest', duration: remainder, label: 'Ruhig atmen', segmentName })
  }
  return result
}

function groundingPhases(): BreathPhase[] {
  return [
    { type: 'grounding', duration: 3, label: '5 Dinge sehen', segmentName: 'Erdung' },
    { type: 'grounding', duration: 3, label: '4 Dinge hören', segmentName: 'Erdung' },
    { type: 'grounding', duration: 3, label: '3 Dinge fühlen', segmentName: 'Erdung' },
    { type: 'grounding', duration: 3, label: '2 Dinge riechen', segmentName: 'Erdung' },
    { type: 'grounding', duration: 3, label: '1 Ding schmecken', segmentName: 'Erdung' },
  ]
}

export function buildBreathPhases(programId: string, settings: BreathSettings): BreathPhase[] {
  const inDur = settings.breathInDuration
  const outDur = settings.breathOutDuration

  switch (programId) {
    case 'akut':
      return [
        { type: 'text', duration: 15, label: 'Ankommen', hint: 'Du musst nicht tiefer atmen. Das geht vorbei.' },
        ...cycles(4, 7, 60, 'Atmen'),
        { type: 'rest', duration: 30, label: 'Loslassen', hint: 'Schultern sinken lassen, Atmung klein und leise', segmentName: 'Entspannen' },
        ...groundingPhases(),
      ]

    case 'mini':
      return cycles(4, 6, 30, 'Mini')

    case 'zwerchfell':
      return cycles(4, 6, 180, 'Zwerchfell')

    case 'resonanz':
      return cycles(5, 5.5, 300, 'Resonanz')

    case 'komplett':
      return [
        { type: 'rest', duration: 60, label: 'Ankommen', hint: 'Ruhig ankommen, Schultern loslassen', segmentName: 'Ankommen' },
        ...cycles(4, 6, 180, 'Zwerchfell'),
        ...cycles(5, 5.5, 300, 'Resonanz'),
        { type: 'rest', duration: 60, label: 'Abschluss', hint: 'Spüre kurz nach', segmentName: 'Abschluss' },
      ]

    default:
      return cycles(inDur, outDur, 60, programId)
  }
}

export function totalBreathDuration(phases: BreathPhase[]): number {
  return phases.reduce((sum, p) => sum + p.duration, 0)
}
