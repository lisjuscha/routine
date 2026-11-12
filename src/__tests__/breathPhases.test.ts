import { describe, it, expect } from 'vitest'
import { buildBreathPhases, totalBreathDuration } from '../utils/breathPhases'
import type { AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

const SETTINGS: AppSettings = DEFAULT_SETTINGS

describe('buildBreathPhases – total duration', () => {
  it('mini: exactly 30 s', () => {
    const phases = buildBreathPhases('mini', SETTINGS)
    expect(totalBreathDuration(phases)).toBe(30)
  })

  it('zwerchfell: exactly 180 s', () => {
    const phases = buildBreathPhases('zwerchfell', SETTINGS)
    expect(totalBreathDuration(phases)).toBe(180)
  })

  it('resonanz: exactly 300 s', () => {
    const phases = buildBreathPhases('resonanz', SETTINGS)
    expect(totalBreathDuration(phases)).toBe(300)
  })

  it('komplett: exactly 600 s', () => {
    const phases = buildBreathPhases('komplett', SETTINGS)
    expect(totalBreathDuration(phases)).toBe(600)
  })

  it('akut: exactly 120 s', () => {
    const phases = buildBreathPhases('akut', SETTINGS)
    expect(totalBreathDuration(phases)).toBe(120)
  })
})

describe('buildBreathPhases – akut phase order', () => {
  it('starts with a text phase', () => {
    const phases = buildBreathPhases('akut', SETTINGS)
    expect(phases[0].type).toBe('text')
    expect(phases[0].duration).toBe(15)
  })

  it('has breath cycles after the text phase', () => {
    const phases = buildBreathPhases('akut', SETTINGS)
    const breathPhases = phases.filter(p => p.type === 'in' || p.type === 'out')
    expect(breathPhases.length).toBeGreaterThan(0)
  })

  it('ends with grounding phases', () => {
    const phases = buildBreathPhases('akut', SETTINGS)
    const last = phases.at(-1)
    expect(last?.type).toBe('grounding')
  })

  it('grounding has 5 items of 3 s each = 15 s', () => {
    const phases = buildBreathPhases('akut', SETTINGS)
    const grounding = phases.filter(p => p.type === 'grounding')
    expect(grounding).toHaveLength(5)
    expect(grounding.reduce((s, p) => s + p.duration, 0)).toBe(15)
  })
})

describe('buildBreathPhases – komplett segment order', () => {
  it('first phase is rest (Ankommen)', () => {
    const phases = buildBreathPhases('komplett', SETTINGS)
    expect(phases[0].type).toBe('rest')
    expect(phases[0].segmentName).toBe('Ankommen')
  })

  it('last phase is rest (Abschluss)', () => {
    const phases = buildBreathPhases('komplett', SETTINGS)
    const last = phases.at(-1)
    expect(last?.type).toBe('rest')
    expect(last?.segmentName).toBe('Abschluss')
  })

  it('contains Zwerchfell and Resonanz segments', () => {
    const phases = buildBreathPhases('komplett', SETTINGS)
    const names = new Set(phases.map(p => p.segmentName))
    expect(names.has('Zwerchfell')).toBe(true)
    expect(names.has('Resonanz')).toBe(true)
  })
})
