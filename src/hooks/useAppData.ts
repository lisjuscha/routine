import { useState, useEffect, useCallback } from 'react'
import type { Exercise, Preset, AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import {
  getAllExercises, putExercise, deleteExercise,
  getAllPresets, putPreset, deletePreset,
  getSettings, putSettings,
} from '../db'

interface AppData {
  ready: boolean
  exercises: Exercise[]
  presets: Preset[]
  settings: AppSettings
  saveExercise: (e: Exercise) => Promise<void>
  removeExercise: (id: string) => Promise<void>
  savePreset: (p: Preset) => Promise<void>
  removePreset: (id: string) => Promise<void>
  updateSettings: (s: AppSettings) => Promise<void>
}

export function useAppData(): AppData {
  const [ready, setReady] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [presets, setPresets] = useState<Preset[]>([])
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    Promise.all([getAllExercises(), getAllPresets(), getSettings()]).then(
      ([exs, prs, set]) => {
        setExercises(exs)
        setPresets(prs)
        setSettings(set)
        setReady(true)
      },
    )
  }, [])

  const saveExercise = useCallback(async (e: Exercise) => {
    await putExercise(e)
    setExercises(await getAllExercises())
  }, [])

  const removeExercise = useCallback(async (id: string) => {
    await deleteExercise(id)
    setExercises(prev => prev.filter(e => e.id !== id))
  }, [])

  const savePreset = useCallback(async (p: Preset) => {
    await putPreset(p)
    setPresets(await getAllPresets())
  }, [])

  const removePreset = useCallback(async (id: string) => {
    await deletePreset(id)
    setPresets(prev => prev.filter(p => p.id !== id))
  }, [])

  const updateSettings = useCallback(async (s: AppSettings) => {
    await putSettings(s)
    setSettings(s)
  }, [])

  return { ready, exercises, presets, settings, saveExercise, removeExercise, savePreset, removePreset, updateSettings }
}
