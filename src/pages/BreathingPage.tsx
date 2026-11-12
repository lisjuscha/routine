import { Clock } from 'lucide-react'
import type { BreathProgram } from '../types'
import { BREATH_PROGRAMS } from '../data/breathPrograms'

interface BreathingPageProps {
  onStart: (program: BreathProgram) => void
  onAkut: () => void
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s === 0 ? `${m} min` : `${m}:${String(s).padStart(2, '0')} min`
}

const NON_AKUT = BREATH_PROGRAMS.filter(p => !p.isAkut)
const AKUT_PROGRAM = BREATH_PROGRAMS.find(p => p.isAkut)!

export function BreathingPage({ onStart, onAkut }: BreathingPageProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold">Atmen</h1>
        <button
          onClick={onAkut}
          className="text-xs font-semibold text-blue-400 bg-blue-400/10 rounded-full px-3 py-1"
        >
          Akut
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 overscroll-contain space-y-3">
        {/* Akut large button */}
        <button
          onClick={onAkut}
          className="w-full bg-blue-600 rounded-2xl p-5 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{AKUT_PROGRAM.name}</p>
              <p className="text-sm text-blue-200 mt-1">{AKUT_PROGRAM.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatDuration(AKUT_PROGRAM.totalDurationSec)}</p>
            </div>
          </div>
        </button>

        {/* Other programs */}
        {NON_AKUT.map(program => (
          <button
            key={program.id}
            onClick={() => onStart(program)}
            className="w-full bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 text-left flex items-center justify-between"
          >
            <div>
              <p className="text-base font-semibold">{program.name}</p>
              {program.description && (
                <p className="text-sm text-gray-400 mt-0.5">{program.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400 shrink-0 ml-4">
              <Clock size={14} />
              <span>{formatDuration(program.totalDurationSec)}</span>
            </div>
          </button>
        ))}

      </div>
    </div>
  )
}
