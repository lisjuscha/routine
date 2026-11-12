import type { Exercise, StretchPhase, StretchDuration, AppSettings } from '../types'

type SettingsNeeded = Pick<
  AppSettings,
  'durationKurz' | 'durationMittel' | 'durationLang' | 'pauseSideSwitch' | 'pauseBetweenExercises'
>

export function buildStretchingPhases(
  exercises: Exercise[],
  duration: StretchDuration,
  settings: SettingsNeeded,
): StretchPhase[] {
  const exerciseSec =
    duration === 'kurz' ? settings.durationKurz
    : duration === 'mittel' ? settings.durationMittel
    : settings.durationLang

  const total = exercises.length
  const phases: StretchPhase[] = []

  exercises.forEach((ex, i) => {
    const exerciseIndex = i + 1
    const isLast = i === total - 1
    const nextName = isLast ? undefined : exercises[i + 1].name

    if (ex.bilateral) {
      phases.push({
        type: 'exercise',
        duration: exerciseSec,
        exerciseName: ex.name,
        exerciseIndex,
        totalExercises: total,
        side: 1,
        nextExerciseName: ex.name,
      })
      phases.push({
        type: 'side-switch',
        duration: settings.pauseSideSwitch,
        exerciseName: ex.name,
        exerciseIndex,
        totalExercises: total,
      })
      phases.push({
        type: 'exercise',
        duration: exerciseSec,
        exerciseName: ex.name,
        exerciseIndex,
        totalExercises: total,
        side: 2,
        nextExerciseName: nextName,
      })
    } else {
      phases.push({
        type: 'exercise',
        duration: exerciseSec,
        exerciseName: ex.name,
        exerciseIndex,
        totalExercises: total,
        nextExerciseName: nextName,
      })
    }

    if (!isLast) {
      phases.push({
        type: 'transition',
        duration: settings.pauseBetweenExercises,
        exerciseName: ex.name,
        exerciseIndex,
        totalExercises: total,
        nextExerciseName: nextName,
      })
    }
  })

  return phases
}

export function totalStretchingDuration(phases: StretchPhase[]): number {
  return phases.reduce((sum, p) => sum + p.duration, 0)
}
