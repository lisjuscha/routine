import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { Exercise, Preset, AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { SEED_EXERCISES } from '../data/exercises'

interface RoutineDB extends DBSchema {
  exercises: { key: string; value: Exercise }
  presets: { key: string; value: Preset }
  settings: { key: string; value: AppSettings }
}

let dbInstance: IDBPDatabase<RoutineDB> | null = null

export async function getDB(): Promise<IDBPDatabase<RoutineDB>> {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<RoutineDB>('routine', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('exercises', { keyPath: 'id' })
        db.createObjectStore('presets', { keyPath: 'id' })
        db.createObjectStore('settings', { keyPath: 'id' as never })
      }
      if (oldVersion < 2) {
        // Replace all seed exercises with the new KOT-based set.
        // Custom exercises (IDs not starting with known prefixes) are preserved.
        const OLD_SEED_IDS = new Set([
          'nacken-seitneigung','nacken-chin-tuck','nacken-rotation',
          'schultern-brustöffner','schultern-querstretcher',
          'ruecken-katze-kuh','ruecken-seitbeuge','ruecken-thoraxrotation',
          'huefte-hüftbeuger','huefte-90-90','huefte-taubenpose',
          'beine-quadrizeps','beine-waden','beine-ischiokrural','beine-piriformis',
        ])
        const store = db.transaction('exercises', 'readwrite').objectStore('exercises')
        void (async () => {
          const all = await store.getAll()
          const toDelete = all.filter((e: Exercise) => OLD_SEED_IDS.has(e.id))
          await Promise.all(toDelete.map((e: Exercise) => store.delete(e.id)))
          await Promise.all(SEED_EXERCISES.map(e => store.put(e)))
        })()
      }
    },
  })
  await seedIfEmpty(dbInstance)
  return dbInstance
}

async function seedIfEmpty(db: IDBPDatabase<RoutineDB>) {
  const count = await db.count('exercises')
  if (count === 0) {
    const tx = db.transaction('exercises', 'readwrite')
    await Promise.all(SEED_EXERCISES.map(e => tx.store.put(e)))
    await tx.done
  }
}

// Exercises
export async function getAllExercises(): Promise<Exercise[]> {
  return (await getDB()).getAll('exercises')
}
export async function putExercise(e: Exercise): Promise<void> {
  await (await getDB()).put('exercises', e)
}
export async function deleteExercise(id: string): Promise<void> {
  await (await getDB()).delete('exercises', id)
}

// Presets
export async function getAllPresets(): Promise<Preset[]> {
  return (await getDB()).getAll('presets')
}
export async function putPreset(p: Preset): Promise<void> {
  await (await getDB()).put('presets', p)
}
export async function deletePreset(id: string): Promise<void> {
  await (await getDB()).delete('presets', id)
}

// Settings — stored as single record with key 'app'
export async function getSettings(): Promise<AppSettings> {
  const db = await getDB()
  const stored = await db.get('settings', 'app' as never)
  return stored ?? { ...DEFAULT_SETTINGS }
}
export async function putSettings(s: AppSettings): Promise<void> {
  await (await getDB()).put('settings', { ...s, id: 'app' } as unknown as AppSettings)
}

// Backup
export async function exportAllData() {
  const db = await getDB()
  const [exercises, presets, settings] = await Promise.all([
    db.getAll('exercises'),
    db.getAll('presets'),
    db.getAll('settings'),
  ])
  return { version: 1, exportedAt: new Date().toISOString(), exercises, presets, settings }
}

export async function importAllData(raw: unknown): Promise<void> {
  const data = raw as Awaited<ReturnType<typeof exportAllData>>
  const db = await getDB()
  const stores = ['exercises', 'presets', 'settings'] as const
  const clearTx = db.transaction(stores, 'readwrite')
  await Promise.all(stores.map(s => clearTx.objectStore(s).clear()))
  await clearTx.done
  const writeTx = db.transaction(stores, 'readwrite')
  await Promise.all([
    ...(data.exercises ?? []).map((e: Exercise) => writeTx.objectStore('exercises').put(e)),
    ...(data.presets ?? []).map((p: Preset) => writeTx.objectStore('presets').put(p)),
    ...(data.settings ?? []).map((s: AppSettings) => writeTx.objectStore('settings').put(s)),
  ])
  await writeTx.done
}
