import { useState, useCallback, useMemo } from 'react'
import { BottomNav } from './components/BottomNav'
import { StretchingPage } from './pages/StretchingPage'
import { StretchingTimerScreen } from './pages/StretchingTimerScreen'
import { BreathingPage } from './pages/BreathingPage'
import { BreathingTimerScreen } from './pages/BreathingTimerScreen'
import { SettingsPage } from './pages/SettingsPage'
import { useAppData } from './hooks/useAppData'
import { buildStretchingPhases } from './utils/stretchingPhases'
import { BREATH_PROGRAMS } from './data/breathPrograms'
import type { AppTab, Exercise, StretchDuration, StretchPhase, BreathProgram } from './types'

type Overlay =
  | { kind: 'stretch-timer'; phases: StretchPhase[]; exerciseCount: number }
  | { kind: 'breath-timer'; program: BreathProgram }
  | { kind: 'stretch-done'; totalSec: number; exerciseCount: number }
  | { kind: 'breath-done' }
  | null

export default function App() {
  const [tab, setTab] = useState<AppTab>(() =>
    (localStorage.getItem('active-tab') as AppTab | null) ?? 'stretching'
  )
  const [overlay, setOverlay] = useState<Overlay>(null)
  const data = useAppData()

  function changeTab(t: AppTab) {
    setTab(t)
    localStorage.setItem('active-tab', t)
  }

  const handleStartStretching = useCallback((selected: Exercise[], duration: StretchDuration) => {
    const phases = buildStretchingPhases(selected, duration, data.settings)
    setOverlay({ kind: 'stretch-timer', phases, exerciseCount: selected.length })
  }, [data.settings])

  const handleStartBreathing = useCallback((program: BreathProgram) => {
    setOverlay({ kind: 'breath-timer', program })
  }, [])

  const handleAkut = useCallback(() => {
    const akut = BREATH_PROGRAMS.find(p => p.isAkut)!
    setOverlay({ kind: 'breath-timer', program: akut })
  }, [])

  const stretchingPage = useMemo(() => (
    <StretchingPage
      exercises={data.exercises}
      presets={data.presets}
      settings={data.settings}
      onStart={handleStartStretching}
      onAkut={handleAkut}
      onSaveExercise={data.saveExercise}
      onRemoveExercise={data.removeExercise}
      onSavePreset={data.savePreset}
      onRemovePreset={data.removePreset}
    />
  ), [data, handleStartStretching, handleAkut])

  if (!data.ready) {
    return (
      <div className="h-dvh flex items-center justify-center bg-black">
        <p className="text-gray-500 text-sm">Lädt…</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto h-dvh flex flex-col overflow-hidden bg-[#f2f2f7] dark:bg-black" style={{ paddingTop: 'var(--safe-top)' }}>
      {/* Active tabs */}
      <main className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
        {tab === 'stretching' && stretchingPage}
        {tab === 'atmen' && (
          <BreathingPage onStart={handleStartBreathing} onAkut={handleAkut} />
        )}
        {tab === 'einstellungen' && (
          <SettingsPage settings={data.settings} onUpdate={data.updateSettings} />
        )}
      </main>

      <BottomNav active={tab} onChange={changeTab} />

      {/* Fullscreen overlays */}
      {overlay?.kind === 'stretch-timer' && (
        <StretchingTimerScreen
          phases={overlay.phases}
          settings={data.settings}
          onDone={totalSec => setOverlay({ kind: 'stretch-done', totalSec, exerciseCount: overlay.exerciseCount })}
          onAbort={() => setOverlay(null)}
        />
      )}

      {overlay?.kind === 'breath-timer' && (
        <BreathingTimerScreen
          program={overlay.program}
          settings={data.settings}
          onDone={() => setOverlay({ kind: 'breath-done' })}
          onAbort={() => setOverlay(null)}
        />
      )}

      {overlay?.kind === 'stretch-done' && (
        <DoneScreen
          title="Geschafft"
          lines={[
            `${overlay.exerciseCount} Übungen`,
            formatDuration(overlay.totalSec),
          ]}
          onRepeat={() => setOverlay(null)}
          repeatLabel="Nochmal"
          onBack={() => setOverlay(null)}
        />
      )}

      {overlay?.kind === 'breath-done' && (
        <DoneScreen
          title="Fertig"
          lines={['Spüre kurz nach, ob die Schultern lockerer sind.']}
          onRepeat={() => setOverlay(null)}
          repeatLabel="Nochmal"
          onBack={() => setOverlay(null)}
        />
      )}
    </div>
  )
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')} min`
}

interface DoneScreenProps {
  title: string
  lines: string[]
  onRepeat: () => void
  repeatLabel: string
  onBack: () => void
}

function DoneScreen({ title, lines, onRepeat, repeatLabel, onBack }: DoneScreenProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black gap-6"
      style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="text-center">
        <p className="text-4xl font-bold mb-4">{title}</p>
        {lines.map((line, i) => (
          <p key={i} className="text-gray-400">{line}</p>
        ))}
      </div>
      <div className="flex flex-col gap-3 w-full px-8">
        <button
          onClick={onRepeat}
          className="w-full py-4 rounded-2xl bg-green-500 text-black font-bold"
        >
          {repeatLabel}
        </button>
        <button
          onClick={onBack}
          className="w-full py-4 rounded-2xl bg-white/10 font-medium"
        >
          Zurück zur Auswahl
        </button>
      </div>
    </div>
  )
}
