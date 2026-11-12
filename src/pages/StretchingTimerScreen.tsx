import { useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, SkipForward, Pause, Play, X } from 'lucide-react'
import { TimerRing } from '../components/TimerRing'
import { useRoutineTimer } from '../hooks/useRoutineTimer'
import type { StretchPhase, AppSettings } from '../types'

interface StretchingTimerScreenProps {
  phases: StretchPhase[]
  settings: AppSettings
  onDone: (totalSec: number) => void
  onAbort: () => void
}

function playSound(type: 'phase' | 'tick', enabled: boolean) {
  if (!enabled) return
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    if (type === 'phase') {
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
      osc.start()
      osc.stop(ctx.currentTime + 0.25)
    } else {
      osc.frequency.setValueAtTime(660, ctx.currentTime)
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    }
  } catch { /* AudioContext not available */ }
}

function vibrate(enabled: boolean) {
  if (enabled && navigator.vibrate) navigator.vibrate(40)
}

export function StretchingTimerScreen({ phases, settings, onDone, onAbort }: StretchingTimerScreenProps) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const prevPhaseIndexRef = useRef(-1)
  const prevRemainingSecRef = useRef(-1)
  const startTimeRef = useRef(performance.now())

  const handleComplete = useCallback(() => {
    const totalSec = Math.round((performance.now() - startTimeRef.current) / 1000)
    wakeLockRef.current?.release()
    onDone(totalSec)
  }, [onDone])

  const handlePhaseChange = useCallback((_newIndex: number) => {
    playSound('phase', settings.soundEnabled)
    vibrate(settings.vibrationEnabled)
    if (settings.voiceAnnouncementEnabled) {
      const phase = phases[_newIndex]
      if (phase?.type === 'exercise') {
        const utterance = new SpeechSynthesisUtterance(phase.exerciseName)
        utterance.lang = 'de-DE'
        speechSynthesis.speak(utterance)
      }
    }
  }, [settings, phases])

  const [timerState, controls] = useRoutineTimer(phases, handleComplete, handlePhaseChange)

  // Acquire wake lock
  useEffect(() => {
    if (!settings.wakeLockEnabled) return
    navigator.wakeLock?.request('screen')
      .then(lock => { wakeLockRef.current = lock })
      .catch(() => { /* not supported */ })
    return () => { wakeLockRef.current?.release() }
  }, [settings.wakeLockEnabled])

  // Auto-start on mount
  useEffect(() => { controls.start() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown ticks in last 3 seconds
  useEffect(() => {
    const remainingSec = Math.ceil(timerState.remainingMs / 1000)
    const phase = phases[timerState.phaseIndex]
    if (
      phase?.type === 'exercise' &&
      remainingSec <= 3 &&
      remainingSec > 0 &&
      remainingSec !== prevRemainingSecRef.current
    ) {
      playSound('tick', settings.soundEnabled)
    }
    prevRemainingSecRef.current = remainingSec
    prevPhaseIndexRef.current = timerState.phaseIndex
  })

  const phase = phases[timerState.phaseIndex]
  if (!phase) return null

  const progress = timerState.elapsedMs / (phase.duration * 1000)
  const remainingSec = Math.ceil(timerState.remainingMs / 1000)
  const isExercise = phase.type === 'exercise'
  const isPause = phase.type === 'side-switch' || phase.type === 'transition'

  const ringColor = isPause ? '#ff9f0a' : '#0a84ff'

  let topLabel = phase.exerciseName
  let subLabel = ''
  if (phase.type === 'side-switch') {
    topLabel = 'Seitenwechsel'
    subLabel = `→ ${phase.exerciseName}`
  } else if (phase.type === 'transition') {
    topLabel = 'Pause'
    subLabel = phase.nextExerciseName ? `→ ${phase.nextExerciseName}` : ''
  } else if (isExercise && phase.side !== undefined) {
    subLabel = `Seite ${phase.side} von 2`
  }

  const exerciseProgress = `Übung ${phase.exerciseIndex} von ${phase.totalExercises}`

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black" style={{ paddingTop: 'var(--safe-top)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={controls.back}
          className="text-white/60 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Zurück"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-sm text-white/40">{exerciseProgress}</span>
        <button
          onClick={onAbort}
          className="text-white/60 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Abbrechen"
        >
          <X size={20} />
        </button>
      </div>

      {/* Ring */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <TimerRing progress={progress} size={280} strokeWidth={14} color={ringColor}>
          <span className="text-6xl font-thin tabular-nums">{remainingSec}</span>
          <div
            className="text-center px-4 mt-2"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="text-xl font-semibold">{topLabel}</p>
            {subLabel && <p className="text-sm text-white/50 mt-1">{subLabel}</p>}
          </div>
        </TimerRing>

        {phase.nextExerciseName && isExercise && (
          <p className="text-sm text-white/30">
            Danach: {phase.nextExerciseName}
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
        <button
          onClick={controls.skip}
          className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center"
          aria-label="Überspringen"
        >
          <SkipForward size={22} />
        </button>
      </div>
    </div>
  )
}
