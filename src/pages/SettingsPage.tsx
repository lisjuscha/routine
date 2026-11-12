import type { AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

interface SettingsPageProps {
  settings: AppSettings
  onUpdate: (s: AppSettings) => Promise<void>
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5 gap-3">
      <span className="text-sm min-w-0">{label}</span>
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
      className={`relative flex-none rounded-full transition-colors duration-200 ${value ? 'bg-[#0a84ff]' : 'bg-[#e5e5ea] dark:bg-[#48484a]'}`}
      style={{ width: 51, height: 31 }}
    >
      <span
        className="absolute bg-white rounded-full shadow-md transition-transform duration-200"
        style={{
          top: 2,
          left: 2,
          width: 27,
          height: 27,
          transform: value ? 'translateX(20px)' : 'translateX(0)',
        }}
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
        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-lg"
      >
        −
      </button>
      <span className="text-sm tabular-nums w-14 text-center">{value} {unit}</span>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-lg"
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
  function set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    onUpdate({ ...settings, [key]: value })
  }

  return (
    <div className="flex flex-col overflow-x-hidden">
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
          className="mt-6 text-sm text-red-400"
        >
          Einstellungen zurücksetzen
        </button>
      </div>
    </div>
  )
}
