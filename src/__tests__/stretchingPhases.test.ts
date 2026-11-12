import { describe, it, expect } from 'vitest'
import { buildStretchingPhases, totalStretchingDuration } from '../utils/stretchingPhases'
import type { Exercise } from '../types'
import { DEFAULT_SETTINGS } from '../types'

const SETTINGS = DEFAULT_SETTINGS
// kurz=30, mittel=45, lang=60, pauseSideSwitch=5, pauseBetweenExercises=5

const UNI: Exercise = { id: 'u1', name: 'Chin Tuck', bilateral: false, category: 'Nacken' }
const BIL: Exercise = { id: 'b1', name: 'Seitneigung', bilateral: true, category: 'Nacken' }

describe('buildStretchingPhases', () => {
  it('single unilateral: one exercise phase, no pause at end', () => {
    const phases = buildStretchingPhases([UNI], 'kurz', SETTINGS)
    expect(phases).toHaveLength(1)
    expect(phases[0].type).toBe('exercise')
    expect(phases[0].duration).toBe(30)
    expect(phases[0].side).toBeUndefined()
  })

  it('single bilateral: side1 + side-switch + side2, no trailing pause', () => {
    const phases = buildStretchingPhases([BIL], 'kurz', SETTINGS)
    expect(phases).toHaveLength(3)
    expect(phases[0].type).toBe('exercise')
    expect(phases[0].side).toBe(1)
    expect(phases[1].type).toBe('side-switch')
    expect(phases[1].duration).toBe(5)
    expect(phases[2].type).toBe('exercise')
    expect(phases[2].side).toBe(2)
  })

  it('two unilateral: exercise, transition, exercise — no trailing transition', () => {
    const UNI2: Exercise = { id: 'u2', name: 'Katze Kuh', bilateral: false, category: 'Rücken' }
    const phases = buildStretchingPhases([UNI, UNI2], 'kurz', SETTINGS)
    expect(phases).toHaveLength(3)
    expect(phases[0].type).toBe('exercise')
    expect(phases[1].type).toBe('transition')
    expect(phases[1].duration).toBe(5)
    expect(phases[2].type).toBe('exercise')
  })

  it('bilateral + unilateral total duration is correct', () => {
    // BIL kurz: 30 + 5 + 30 = 65, then transition 5, then UNI 30 = 100
    const phases = buildStretchingPhases([BIL, UNI], 'kurz', SETTINGS)
    expect(totalStretchingDuration(phases)).toBe(100)
  })

  it('mittel duration applies correctly', () => {
    const phases = buildStretchingPhases([UNI], 'mittel', SETTINGS)
    expect(phases[0].duration).toBe(45)
  })

  it('lang duration applies correctly', () => {
    const phases = buildStretchingPhases([UNI], 'lang', SETTINGS)
    expect(phases[0].duration).toBe(60)
  })

  it('exerciseIndex is 1-based and totalExercises is correct', () => {
    const UNI2: Exercise = { id: 'u2', name: 'Test', bilateral: false, category: 'Rücken' }
    const phases = buildStretchingPhases([UNI, UNI2], 'kurz', SETTINGS)
    const exercisePhases = phases.filter(p => p.type === 'exercise')
    expect(exercisePhases[0].exerciseIndex).toBe(1)
    expect(exercisePhases[0].totalExercises).toBe(2)
    expect(exercisePhases[1].exerciseIndex).toBe(2)
  })

  it('nextExerciseName is undefined for the last exercise', () => {
    const phases = buildStretchingPhases([UNI], 'kurz', SETTINGS)
    expect(phases.at(-1)?.nextExerciseName).toBeUndefined()
  })
})
