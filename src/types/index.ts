export type ExerciseCategory = 'Nacken' | 'Schultern' | 'Rücken' | 'Hüfte' | 'Beine'

export interface Exercise {
  id: string
  name: string
  bilateral: boolean
  description?: string
  category: ExerciseCategory
}

export interface Preset {
  id: string
  name: string
  exerciseIds: string[]
  createdAt: string
}

export type StretchDuration = 'kurz' | 'mittel' | 'lang'

export interface AppSettings {
  // Stretching
  durationKurz: number
  durationMittel: number
  durationLang: number
  pauseSideSwitch: number
  pauseBetweenExercises: number
  // Breathing
  breathInDuration: number
  breathOutDuration: number
  // General
  soundEnabled: boolean
  vibrationEnabled: boolean
  wakeLockEnabled: boolean
  voiceAnnouncementEnabled: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  durationKurz: 30,
  durationMittel: 45,
  durationLang: 60,
  pauseSideSwitch: 5,
  pauseBetweenExercises: 5,
  breathInDuration: 4,
  breathOutDuration: 7,
  soundEnabled: true,
  vibrationEnabled: true,
  wakeLockEnabled: true,
  voiceAnnouncementEnabled: false,
}

// ──────────────────────────────
// Stretching phases
// ──────────────────────────────

export type StretchPhaseType = 'exercise' | 'side-switch' | 'transition'

export interface StretchPhase {
  type: StretchPhaseType
  duration: number
  exerciseName: string
  exerciseIndex: number  // 1-based
  totalExercises: number
  side?: 1 | 2
  nextExerciseName?: string
}

// ──────────────────────────────
// Breathing phases
// ──────────────────────────────

export type BreathPhaseType = 'in' | 'out' | 'hold' | 'pause' | 'text' | 'rest' | 'grounding'

export interface BreathPhase {
  type: BreathPhaseType
  duration: number
  label: string
  hint?: string
  segmentName?: string
}

export interface BreathProgram {
  id: string
  name: string
  totalDurationSec: number
  description?: string
  isAkut?: boolean
}

// ──────────────────────────────
// App state
// ──────────────────────────────

export type AppTab = 'stretching' | 'atmen' | 'einstellungen'
