import { useEffect, useRef, useCallback, useMemo } from 'react'
import { Pause, Play, X } from 'lucide-react'
import { TimerRing } from '../components/TimerRing'
import { BreathCircle } from '../components/BreathCircle'
import { useRoutineTimer } from '../hooks/useRoutineTimer'
import type { BreathPhase, BreathProgram, AppSettings } from '../types'
import { buildBreathPhases } from '../utils/breathPhases'

interface BreathingTimerScreenProps {
  program: BreathProgram
  settings: AppSettings
  onDone: () => void
  onAbort: () => void
}

const PHASE_COLORS: Record<string, string> = {
  in: '#0a84ff',
  hold: '#5e5ce6',
  out: '#64d2ff',
  pause: 'rgba(255,255,255,0.3)',
  text: '#ff9f0a',
  rest: 'rgba(255,255,255,0.3)',
  grounding: '#30d158',
}

export function BreathingTimerScreen({ program, settings, onDone, onAbort }: BreathingTimerScreenProps) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const phases: BreathPhase[] = useMemo(
    () => buildBreathPhases(program.id, settings),
    [program.id, settings],
  )

  const handleComplete = useCallback(() => {
    wakeLockRef.current?.release()
    onDone()
  }, [onDone])

  const [timerState, controls] = useRoutineTimer(phases, handleComplete)

  useEffect(() => {
    if (!settings.wakeLockEnabled) return
    navigator.wakeLock?.request('screen')
      .then(lock => { wakeLockRef.current = lock })
      .catch(() => { /* not supported */ })
    return () => { wakeLockRef.current?.release() }
  }, [settings.wakeLockEnabled])

  useEffect(() => { controls.start() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const phase = phases[timerState.phaseIndex]
  if (!phase) return null

  const phaseProgress = timerState.elapsedMs / (phase.duration * 1000)
  const totalProgress = timerState.totalElapsedMs / (program.totalDurationSec * 1000)
  const remainingSec = Math.ceil(timerState.remainingMs / 1000)
  const totalRemainingSec = Math.ceil(timerState.totalRemainingMs / 1000)
  const ringColor = PHASE_COLORS[phase.type] ?? '#ffffff'

  const totalMin = Math.floor(totalRemainingSec / 60)
  const totalSec = totalRemainingSec % 60
  const totalStr = `${totalMin}:${String(totalSec).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black" style={{ paddingTop: 'var(--safe-top)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-base font-semibold">{program.name}</p>
          {phase.segmentName && phase.segmentName !== program.name && (
            <p className="text-xs text-white/40">{phase.segmentName}</p>
          )}
        </div>
        <button
          onClick={onAbort}
          className="text-white/60 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Abbrechen"
        >
          <X size={20} />
        </button>
      </div>

      {/* Breath circle + outer progress ring */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
          {/* Outer progress ring */}
          <div className="absolute inset-0">
            <TimerRing
              progress={totalProgress}
              size={280}
              strokeWidth={6}
              color="rgba(255,255,255,0.25)"
              trackColor="rgba(255,255,255,0.06)"
            />
          </div>

          {/* Breath circle fills inside */}
          <div className="absolute" style={{ inset: 16 }}>
            <BreathCircle
              phaseType={phase.type}
              progress={phaseProgress}
              reducedMotion={reducedMotion}
            />
          </div>

          {/* Center text */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="text-4xl font-thin tabular-nums" style={{ color: ringColor }}>
              {remainingSec}
            </p>
            <p className="text-lg font-semibold mt-1">{phase.label}</p>
            <p className="text-sm text-white/30 mt-1">{totalStr}</p>
          </div>
        </div>

        {/* Hint */}
        {phase.hint && (
          <p className="text-sm text-white/50 text-center px-8 leading-relaxed max-w-xs">
            {phase.hint}
          </p>
        )}

        {/* Dizziness tip — always visible during breath cycles */}
        {(phase.type === 'in' || phase.type === 'out' || phase.type === 'hold') && (
          <p className="text-xs text-white/25 text-center px-8 max-w-xs">
            Bei Schwindel oder Kribbeln: kürzer und leiser atmen und eine Pause einlegen.
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 pb-12">
        <button
          onClick={timerState.isRunning ? controls.pause : controls.resume}
          className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center"
          aria-label={timerState.isRunning ? 'Pausieren' : 'Fortsetzen'}
        >
          {timerState.isRunning
            ? <Pause size={32} fill="white" strokeWidth={0} />
            : <Play size={32} fill="white" strokeWidth={0} />
          }
        </button>
      </div>
    </div>
  )
}
