import { useState, useMemo, useRef } from 'react'
import { Plus, Pencil, Trash2, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import type { Exercise, ExerciseCategory, Preset, StretchDuration, AppSettings } from '../types'

interface StretchingPageProps {
  exercises: Exercise[]
  presets: Preset[]
  settings: AppSettings
  onStart: (selected: Exercise[], duration: StretchDuration) => void
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

export function StretchingPage({
  exercises, presets, settings,
  onStart,
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
  const [detailCategory, setDetailCategory] = useState<ExerciseCategory | null>(null)
  const [editExercise, setEditExercise] = useState<(Exercise & { isNew?: boolean }) | null>(null)
  const [editPresetName, setEditPresetName] = useState('')
  const [showSavePreset, setShowSavePreset] = useState(false)
  const touchStartX = useRef(0)

  const selected = useMemo(
    () => exercises.filter(e => selectedIds.has(e.id)),
    [exercises, selectedIds],
  )

  const categoryData = useMemo(() =>
    CATEGORIES.map(cat => {
      const items = exercises.filter(e => e.category === cat)
      const selectedCount = items.filter(e => selectedIds.has(e.id)).length
      return { cat, items, selectedCount }
    }).filter(g => g.items.length > 0),
  [exercises, selectedIds])

  const detailItems = useMemo(() =>
    detailCategory ? exercises.filter(e => e.category === detailCategory) : [],
  [exercises, detailCategory])

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

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx > 60 && touchStartX.current < 50) {
      setDetailCategory(null)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Slide container */}
      <div className="relative flex-1 overflow-hidden">

        {/* ── Main view: category tiles ── */}
        <div
          className="absolute inset-0 flex flex-col bg-[#f2f2f7] dark:bg-black transition-transform duration-300 ease-in-out"
          style={{ transform: detailCategory ? 'translateX(-100%)' : 'translateX(0)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <h1 className="text-2xl font-bold">Stretching</h1>
          </div>

          {/* Presets */}
          {presets.length > 0 && (
            <div className="px-4 mb-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {presets.map(p => (
                  <div key={p.id} className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => applyPreset(p)}
                      className="text-xs font-medium bg-white dark:bg-[#1c1c1e] rounded-full px-3 py-1"
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

          {/* Category tiles */}
          <div className="flex-1 overflow-y-auto px-4 overscroll-contain space-y-3 pb-3">
            {categoryData.map(({ cat, items, selectedCount }) => (
              <button
                key={cat}
                onClick={() => setDetailCategory(cat)}
                className="w-full bg-white dark:bg-[#1c1c1e] rounded-2xl px-4 py-4 flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-base font-semibold">{cat}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {selectedCount > 0
                      ? `${selectedCount} von ${items.length} ausgewählt`
                      : `${items.length} Übung${items.length !== 1 ? 'en' : ''}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedCount > 0 && (
                    <span className="min-w-[20px] h-5 rounded-full bg-[#0a84ff] text-white text-xs font-bold flex items-center justify-center px-1">
                      {selectedCount}
                    </span>
                  )}
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </button>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="px-4 pb-4 pt-3 space-y-3 bg-[#f2f2f7] dark:bg-black border-t border-gray-200 dark:border-[#38383a]">
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
                      ? 'bg-[#0a84ff] text-white'
                      : 'bg-white dark:bg-[#1c1c1e] text-[#1c1c1e] dark:text-white',
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
                  className="text-[#0a84ff]"
                >
                  Als Preset speichern
                </button>
              </div>
            )}

            <button
              onClick={() => onStart(selected, duration)}
              disabled={selected.length === 0}
              className="w-full py-4 rounded-2xl text-base font-bold bg-[#0a84ff] text-white disabled:opacity-30 transition-opacity"
            >
              Start
            </button>
          </div>
        </div>

        {/* ── Detail view: exercises ── */}
        <div
          className="absolute inset-0 flex flex-col bg-[#f2f2f7] dark:bg-black transition-transform duration-300 ease-in-out"
          style={{ transform: detailCategory ? 'translateX(0)' : 'translateX(100%)' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header */}
          <div className="flex items-center px-2 pt-4 pb-3 gap-1">
            <button
              onClick={() => setDetailCategory(null)}
              className="flex items-center gap-0.5 text-[#0a84ff] px-2 py-2"
            >
              <ChevronLeft size={22} />
              <span className="text-base">Zurück</span>
            </button>
            <h2 className="text-lg font-bold ml-1">{detailCategory}</h2>
          </div>

          {/* Exercise tiles */}
          <div className="flex-1 overflow-y-auto px-4 overscroll-contain pb-6">
            <div className="space-y-2">
              {detailItems.map(ex => {
                const isSelected = selectedIds.has(ex.id)
                return (
                  <div key={ex.id} className="flex items-stretch gap-2">
                    <button
                      onClick={() => toggleId(ex.id)}
                      className={[
                        'flex-1 rounded-2xl px-4 py-3 text-left flex items-center justify-between transition-colors min-h-[56px]',
                        isSelected
                          ? 'bg-[#0a84ff]/15 dark:bg-[#0a84ff]/20'
                          : 'bg-white dark:bg-[#1c1c1e]',
                      ].join(' ')}
                    >
                      <div>
                        <p className={`text-base font-medium ${isSelected ? 'text-[#0a84ff]' : ''}`}>{ex.name}</p>
                        {ex.bilateral && <p className="text-xs text-gray-400 mt-0.5">beide Seiten</p>}
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#0a84ff] flex items-center justify-center shrink-0 ml-3">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => setEditExercise({ ...ex })}
                      className="w-12 rounded-2xl bg-white dark:bg-[#1c1c1e] flex items-center justify-center text-gray-400"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setEditExercise({
                id: '',
                name: '',
                bilateral: false,
                category: detailCategory ?? 'Nacken',
                isNew: true,
              })}
              className="flex items-center gap-2 text-sm text-[#0a84ff] py-4 mt-1"
            >
              <Plus size={16} />
              Übung hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* Edit exercise modal */}
      {editExercise && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setEditExercise(null)}>
          <div
            className="w-full bg-[#1c1c1e] rounded-t-2xl p-6 pb-10 space-y-4"
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
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <input
                type="checkbox"
                checked={editExercise.bilateral}
                onChange={e => setEditExercise(prev => prev ? { ...prev, bilateral: e.target.checked } : null)}
                className="w-5 h-5 accent-[#0a84ff]"
              />
              Beide Seiten
            </label>
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
                className="flex-1 py-3 rounded-2xl bg-[#0a84ff] text-white font-bold disabled:opacity-30"
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
            className="w-full bg-[#1c1c1e] rounded-t-2xl p-6 pb-10 space-y-4"
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
              className="w-full py-3 rounded-2xl bg-[#0a84ff] text-white font-bold disabled:opacity-30"
            >
              Speichern
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
