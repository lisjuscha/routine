import { useState } from 'react'
import { Download, Upload } from 'lucide-react'
import type { AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { exportAllData, importAllData } from '../db'

interface SettingsPageProps {
  settings: AppSettings
  onUpdate: (s: AppSettings) => Promise<void>
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5">
      <span className="text-sm">{label}</span>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={[
        'w-12 h-7 rounded-full transition-colors relative',
        value ? 'bg-green-500' : 'bg-white/20',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
          value ? 'translate-x-5.5' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  )
}

function NumberInput({
  value,
  onChange,
  step = 1,
  min = 1,
  max = 120,
  unit = 's',
}: {
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  max?: number
  unit?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg"
      >
        −
      </button>
      <span className="text-sm tabular-nums w-12 text-center">{value} {unit}</span>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg"
      >
        +
      </button>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-5 pb-1">{title}</p>
  )
}

export function SettingsPage({ settings, onUpdate }: SettingsPageProps) {
  const [status, setStatus] = useState('')

  function set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    onUpdate({ ...settings, [key]: value })
  }

  async function handleExport() {
    try {
      const data = await exportAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `routine-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('Gespeichert')
    } catch { setStatus('Fehler beim Exportieren') }
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text()
      await importAllData(JSON.parse(text))
      setStatus('Wiederhergestellt — bitte Seite neu laden')
    } catch { setStatus('Ungültige Datei') }
  }

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold">Einstellungen</h1>
      </div>

      <div className="px-4 pb-10">
        {/* Stretching */}
        <SectionHeader title="Stretching" />
        <Row label="Kurz (pro Seite)">
          <NumberInput value={settings.durationKurz} onChange={v => set('durationKurz', v)} min={10} max={120} />
        </Row>
        <Row label="Mittel">
          <NumberInput value={settings.durationMittel} onChange={v => set('durationMittel', v)} min={10} max={120} />
        </Row>
        <Row label="Lang">
          <NumberInput value={settings.durationLang} onChange={v => set('durationLang', v)} min={10} max={120} />
        </Row>
        <Row label="Seitenwechsel-Pause">
          <NumberInput value={settings.pauseSideSwitch} onChange={v => set('pauseSideSwitch', v)} min={2} max={30} />
        </Row>
        <Row label="Übergangs-Pause">
          <NumberInput value={settings.pauseBetweenExercises} onChange={v => set('pauseBetweenExercises', v)} min={2} max={30} />
        </Row>

        {/* Breathing */}
        <SectionHeader title="Atmen" />
        <Row label="Einatmen">
          <NumberInput value={settings.breathInDuration} onChange={v => set('breathInDuration', v)} min={1} max={10} step={0.5} unit="s" />
        </Row>
        <Row label="Ausatmen">
          <NumberInput value={settings.breathOutDuration} onChange={v => set('breathOutDuration', v)} min={1} max={12} step={0.5} unit="s" />
        </Row>

        {/* General */}
        <SectionHeader title="Allgemein" />
        <Row label="Ton">
          <Toggle value={settings.soundEnabled} onChange={v => set('soundEnabled', v)} />
        </Row>
        <Row label="Vibration">
          <Toggle value={settings.vibrationEnabled} onChange={v => set('vibrationEnabled', v)} />
        </Row>
        <Row label="Bildschirm wach halten">
          <Toggle value={settings.wakeLockEnabled} onChange={v => set('wakeLockEnabled', v)} />
        </Row>
        <Row label="Übungsname ansagen">
          <Toggle value={settings.voiceAnnouncementEnabled} onChange={v => set('voiceAnnouncementEnabled', v)} />
        </Row>

        {/* Reset */}
        <button
          onClick={() => onUpdate({ ...DEFAULT_SETTINGS })}
          className="mt-4 text-sm text-red-400"
        >
          Einstellungen zurücksetzen
        </button>

        {/* Backup */}
        <SectionHeader title="Datensicherung" />
        <div className="flex gap-3 mt-2">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 rounded-xl py-3 text-sm"
          >
            <Download size={16} />
            Exportieren
          </button>
          <label className="flex-1 flex items-center justify-center gap-2 bg-white/10 rounded-xl py-3 text-sm cursor-pointer">
            <Upload size={16} />
            Importieren
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleImport(e.target.files[0]) }}
            />
          </label>
        </div>
        {status && <p className="text-xs text-gray-400 mt-2">{status}</p>}
      </div>
    </div>
  )
}
