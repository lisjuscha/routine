import type { AppTab } from '../types'

interface BottomNavProps {
  active: AppTab
  onChange: (tab: AppTab) => void
}

const TABS: { id: AppTab; label: string }[] = [
  { id: 'stretching', label: 'Stretching' },
  { id: 'atmen', label: 'Atmen' },
  { id: 'einstellungen', label: 'Einstellungen' },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="flex bg-black/90 dark:bg-black/90 light:bg-white/90 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            'flex-1 py-3 text-xs font-medium transition-colors',
            active === tab.id
              ? 'text-green-400'
              : 'text-gray-500 dark:text-gray-500',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
