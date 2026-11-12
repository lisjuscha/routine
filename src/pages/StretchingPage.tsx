import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import type { Exercise, ExerciseCategory, Preset, StretchDuration, AppSettings } from '../types'

interface StretchingPageProps {
  exercises: Exercise[]
  presets: Preset[]
  settings: AppSettings
  onStart: (selected: Exercise[], duration: StretchDuration) => void
  onAkut: () => void
  onSaveExercise: (e: Exercise) => Promise<void>
  onRemoveExercise: (id: string) => Promise<void>
  onSavePreset: (p: Preset) => Promise<void>
  onRemovePreset: (id: string) => Promise<void>
}

const CATEGORIES: ExerciseCategory[] = ['Nacken', 'Schultern', 'Rücken', 'Hüfte', 'Beine']
const DURATION_LABELS: Record<StretchDuration, string> = { kurz: 'Kurz', mittel: 'Mittel', lang: 'Lang' }

function computeEstimate(selected: Exercise[], duration: StretchDuration, settings: AppSettings): string {
  const perSide = duration === 'kurz' ? settings.durationKurz : duration === 'mittel' ? settings.durationMittel : settings.durationLang
  const totalSec = selected.reduce((sum, ex) => {
    const sides = ex.bilateral ? 2 : 1
    return sum + sides * perSide + (sides - 1) * settings.pauseSideSwitch
  }, 0) + Math.max(0, selected.length - 1) * settings.pauseBetweenExercises
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return s === 0 ? `${m} min` : `${m}:${String(s).padStart(2, '0')} min`
}

const BLANK_EXERCISE: Omit<Exercise, 'id'> = { name: '', bilateral: false, category: 'Nacken' }

export function StretchingPage({
  exercises, presets, settings,
  onStart, onAkut,
  onSaveExercise, onRemoveExercise,
  onSavePreset, onRemovePreset,
}: StretchingPageProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('stretching-selected') ?? '[]') as string[]) }
    catch { return new Set() }
  })
  const [duration, setDuration] = useState<StretchDuration>(() =>
    (localStorage.getItem('stretching-duration') as StretchDuration | null) ?? 'mittel'
  )
  const [collapsed, setCollapsed] = useState<Set<ExerciseCategory>>(new Set())
  const [editExercise, setEditExercise] = useState<(Exercise & { isNew?: boolean }) | null>(null)
  const [editPresetName, setEditPresetName] = useState('')
  const [showSavePreset, setShowSavePreset] = useState(false)

  const selected = useMemo(
    () => exercises.filter(e => selectedIds.has(e.id)),
    [exercises, selectedIds],
  )

  function toggleId(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem('stretching-selected', JSON.stringify([...next]))
      return next
    })
  }

  function applyPreset(p: Preset) {
    const next = new Set(p.exerciseIds)
    setSelectedIds(next)
    localStorage.setItem('stretching-selected', JSON.stringify([...next]))
  }

  async function handleSaveExercise() {
    if (!editExercise || !editExercise.name.trim()) return
    const id = editExercise.isNew ? crypto.randomUUID() : editExercise.id
    await onSaveExercise({ ...editExercise, id, name: editExercise.name.trim() })
    setEditExercise(null)
  }

  async function handleSavePreset() {
    if (!editPresetName.trim()) return
    await onSavePreset({
      id: crypto.randomUUID(),
      name: editPresetName.trim(),
      exerciseIds: [...selectedIds],
      createdAt: new Date().toISOString(),
    })
    setShowSavePreset(false)
    setEditPresetName('')
  }

  const grouped = useMemo(() =>
    CATEGORIES.map(cat => ({
      cat,
      items: exercises.filter(e => e.category === cat),
    })).filter(g => g.items.length > 0),
  [exercises])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold">Stretching</h1>
        <button
          onClick={onAkut}
          className="text-xs font-semibold text-blue-400 bg-blue-400/10 rounded-full px-3 py-1"
        >
          Akut
        </button>
      </div>

      {/* Presets */}
      {presets.length > 0 && (
        <div className="px-4 mb-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {presets.map(p => (
              <div key={p.id} className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => applyPreset(p)}
                  className="text-xs font-medium bg-white/10 rounded-full px-3 py-1"
                >
                  {p.name}
                </button>
                <button onClick={() => onRemovePreset(p.id)} className="text-gray-500 p-1">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto px-4 overscroll-contain">
        {grouped.map(({ cat, items }) => (
          <div key={cat} className="mb-2">
            <button
              onClick={() => setCollapsed(prev => {
                const n = new Set(prev)
                n.has(cat) ? n.delete(cat) : n.add(cat)
                return n
              })}
              className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 w-full"
            >
              {collapsed.has(cat) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              {cat}
            </button>
            {!collapsed.has(cat) && (
              <div className="space-y-1">
                {items.map(ex => (
                  <div
                    key={ex.id}
                    className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-3"
                  >
                    <input
                      type="checkbox"
                      id={`ex-${ex.id}`}
                      checked={selectedIds.has(ex.id)}
                      onChange={() => toggleId(ex.id)}
                      className="w-5 h-5 accent-green-400 rounded"
                    />
                    <label
                      htmlFor={`ex-${ex.id}`}
                      className="flex-1 text-sm cursor-pointer"
                    >
                      {ex.name}
                      {ex.bilateral && (
                        <span className="ml-2 text-xs text-gray-500">beide Seiten</span>
                      )}
                    </label>
                    <button
                      onClick={() => setEditExercise({ ...ex })}
                      className="text-gray-500 p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() => setEditExercise({ ...BLANK_EXERCISE, id: '', isNew: true })}
          className="flex items-center gap-2 text-sm text-green-400 py-3 mt-1 mb-4"
        >
          <Plus size={16} />
          Übung hinzufügen
        </button>
      </div>

      {/* Duration + Start */}
      <div className="px-4 pb-4 space-y-3 bg-black/80 dark:bg-black/80 pt-3 border-t border-white/10">
        <div className="flex gap-2">
          {(['kurz', 'mittel', 'lang'] as StretchDuration[]).map(d => (
            <button
              key={d}
              onClick={() => {
                setDuration(d)
                localStorage.setItem('stretching-duration', d)
              }}
              className={[
                'flex-1 py-2 rounded-xl text-sm font-semibold transition-colors',
                duration === d
                  ? 'bg-green-500 text-black'
                  : 'bg-white/10 text-white',
              ].join(' ')}
            >
              {DURATION_LABELS[d]}
            </button>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{selected.length} Übungen · {computeEstimate(selected, duration, settings)}</span>
            <button
              onClick={() => setShowSavePreset(true)}
              className="text-blue-400"
            >
              Als Preset speichern
            </button>
          </div>
        )}

        <button
          onClick={() => onStart(selected, duration)}
          disabled={selected.length === 0}
          className="w-full py-4 rounded-2xl text-base font-bold bg-green-500 text-black disabled:opacity-30 transition-opacity"
        >
          Start
        </button>
      </div>

      {/* Edit exercise modal */}
      {editExercise && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setEditExercise(null)}>
          <div
            className="w-full bg-[#1c1c1e] dark:bg-[#1c1c1e] rounded-t-2xl p-6 pb-10 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">
              {editExercise.isNew ? 'Neue Übung' : 'Übung bearbeiten'}
            </h2>
            <input
              className="w-full bg-white/10 rounded-xl px-4 py-3 text-sm outline-none"
              placeholder="Name"
              value={editExercise.name}
              onChange={e => setEditExercise(prev => prev ? { ...prev, name: e.target.value } : null)}
              autoFocus
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editExercise.bilateral}
                  onChange={e => setEditExercise(prev => prev ? { ...prev, bilateral: e.target.checked } : null)}
                  className="w-5 h-5 accent-green-400"
                />
                Beide Seiten
              </label>
            </div>
            <select
              value={editExercise.category}
              onChange={e => setEditExercise(prev => prev ? { ...prev, category: e.target.value as ExerciseCategory } : null)}
              className="w-full bg-white/10 rounded-xl px-4 py-3 text-sm outline-none appearance-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-3">
              {!editExercise.isNew && (
                <button
                  onClick={async () => { await onRemoveExercise(editExercise.id); setEditExercise(null) }}
                  className="flex-none p-3 rounded-xl bg-red-500/20 text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button
                onClick={handleSaveExercise}
                disabled={!editExercise.name.trim()}
                className="flex-1 py-3 rounded-2xl bg-green-500 text-black font-bold disabled:opacity-30"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save preset modal */}
      {showSavePreset && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setShowSavePreset(false)}>
          <div
            className="w-full bg-[#1c1c1e] dark:bg-[#1c1c1e] rounded-t-2xl p-6 pb-10 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">Preset speichern</h2>
            <input
              className="w-full bg-white/10 rounded-xl px-4 py-3 text-sm outline-none"
              placeholder="Name des Presets"
              value={editPresetName}
              onChange={e => setEditPresetName(e.target.value)}
              autoFocus
            />
            <button
              onClick={handleSavePreset}
              disabled={!editPresetName.trim()}
              className="w-full py-3 rounded-2xl bg-green-500 text-black font-bold disabled:opacity-30"
            >
              Speichern
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
