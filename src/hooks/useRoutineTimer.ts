import { useState, useRef, useCallback, useEffect } from 'react'

interface Phase {
  duration: number
}

export interface TimerState {
  phaseIndex: number
  elapsedMs: number
  remainingMs: number
  totalElapsedMs: number
  totalRemainingMs: number
  isRunning: boolean
  isDone: boolean
}

export interface TimerControls {
  start: () => void
  pause: () => void
  resume: () => void
  skip: () => void
  back: () => void
  stop: () => void
}

export function useRoutineTimer(
  phases: Phase[],
  onComplete: () => void,
  onPhaseChange?: (newIndex: number) => void,
): [TimerState, TimerControls] {
  const [renderTick, setRenderTick] = useState(0)

  // All mutable timer state in refs to avoid stale closures in rAF
  const phaseIndexRef = useRef(0)
  const phaseStartRef = useRef(0)   // performance.now() when current phase started
  const pausedAtRef = useRef(0)     // performance.now() when paused; 0 = not paused
  const isRunningRef = useRef(false)
  const isDoneRef = useRef(false)
  const rafRef = useRef(0)
  const phasesRef = useRef(phases)
  const onCompleteRef = useRef(onComplete)
  const onPhaseChangeRef = useRef(onPhaseChange)

  useEffect(() => { phasesRef.current = phases }, [phases])
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])
  useEffect(() => { onPhaseChangeRef.current = onPhaseChange }, [onPhaseChange])

  // Compute totals for current render
  const totalDurationMs = phases.reduce((s, p) => s + p.duration * 1000, 0)
  const durationBeforeCurrentMs = phases
    .slice(0, phaseIndexRef.current)
    .reduce((s, p) => s + p.duration * 1000, 0)

  let currentElapsedMs = 0
  if (isRunningRef.current && phaseStartRef.current > 0) {
    currentElapsedMs = Math.min(
      performance.now() - phaseStartRef.current,
      (phases[phaseIndexRef.current]?.duration ?? 0) * 1000,
    )
  } else if (!isRunningRef.current && pausedAtRef.current > 0 && phaseStartRef.current > 0) {
    currentElapsedMs = Math.min(
      pausedAtRef.current - phaseStartRef.current,
      (phases[phaseIndexRef.current]?.duration ?? 0) * 1000,
    )
  }

  const phaseDurMs = (phases[phaseIndexRef.current]?.duration ?? 0) * 1000
  const totalElapsedMs = durationBeforeCurrentMs + currentElapsedMs
  const state: TimerState = {
    phaseIndex: phaseIndexRef.current,
    elapsedMs: currentElapsedMs,
    remainingMs: Math.max(0, phaseDurMs - currentElapsedMs),
    totalElapsedMs,
    totalRemainingMs: Math.max(0, totalDurationMs - totalElapsedMs),
    isRunning: isRunningRef.current,
    isDone: isDoneRef.current,
  }

  const startRaf = useCallback(() => {
    const tick = (now: number) => {
      if (!isRunningRef.current) return
      const elapsed = now - phaseStartRef.current
      const phase = phasesRef.current[phaseIndexRef.current]
      if (!phase) return
      const phaseDur = phase.duration * 1000

      if (elapsed >= phaseDur) {
        const nextIndex = phaseIndexRef.current + 1
        if (nextIndex >= phasesRef.current.length) {
          isRunningRef.current = false
          isDoneRef.current = true
          setRenderTick(t => t + 1)
          onCompleteRef.current()
          return
        }
        const overshoot = elapsed - phaseDur
        phaseIndexRef.current = nextIndex
        phaseStartRef.current = now - overshoot
        onPhaseChangeRef.current?.(nextIndex)
      }

      setRenderTick(t => t + 1)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = useCallback(() => {
    if (isRunningRef.current || isDoneRef.current) return
    phaseIndexRef.current = 0
    phaseStartRef.current = performance.now()
    pausedAtRef.current = 0
    isDoneRef.current = false
    isRunningRef.current = true
    onPhaseChangeRef.current?.(0)
    setRenderTick(t => t + 1)
    startRaf()
  }, [startRaf])

  const pause = useCallback(() => {
    if (!isRunningRef.current) return
    isRunningRef.current = false
    pausedAtRef.current = performance.now()
    cancelAnimationFrame(rafRef.current)
    setRenderTick(t => t + 1)
  }, [])

  const resume = useCallback(() => {
    if (isRunningRef.current || isDoneRef.current) return
    const pausedDuration = performance.now() - pausedAtRef.current
    phaseStartRef.current += pausedDuration
    pausedAtRef.current = 0
    isRunningRef.current = true
    setRenderTick(t => t + 1)
    startRaf()
  }, [startRaf])

  const skip = useCallback(() => {
    const nextIndex = phaseIndexRef.current + 1
    if (nextIndex >= phasesRef.current.length) {
      isRunningRef.current = false
      isDoneRef.current = true
      cancelAnimationFrame(rafRef.current)
      setRenderTick(t => t + 1)
      onCompleteRef.current()
      return
    }
    phaseIndexRef.current = nextIndex
    phaseStartRef.current = performance.now()
    pausedAtRef.current = 0
    onPhaseChangeRef.current?.(nextIndex)
    setRenderTick(t => t + 1)
    if (!isRunningRef.current) {
      isRunningRef.current = true
      startRaf()
    }
  }, [startRaf])

  const back = useCallback(() => {
    const now = performance.now()
    const elapsed = now - phaseStartRef.current
    if (elapsed > 3000 || phaseIndexRef.current === 0) {
      // restart current phase
      phaseStartRef.current = now
      pausedAtRef.current = 0
      onPhaseChangeRef.current?.(phaseIndexRef.current)
    } else {
      const prevIndex = phaseIndexRef.current - 1
      phaseIndexRef.current = prevIndex
      phaseStartRef.current = now
      pausedAtRef.current = 0
      onPhaseChangeRef.current?.(prevIndex)
    }
    setRenderTick(t => t + 1)
    if (!isRunningRef.current && !isDoneRef.current) {
      isRunningRef.current = true
      startRaf()
    }
  }, [startRaf])

  const stop = useCallback(() => {
    isRunningRef.current = false
    isDoneRef.current = false
    cancelAnimationFrame(rafRef.current)
    phaseIndexRef.current = 0
    phaseStartRef.current = 0
    pausedAtRef.current = 0
    setRenderTick(t => t + 1)
  }, [])

  // Cleanup on unmount
  useEffect(() => () => { cancelAnimationFrame(rafRef.current) }, [])

  // Suppress unused warning - renderTick only drives re-renders
  void renderTick

  return [state, { start, pause, resume, skip, back, stop }]
}
