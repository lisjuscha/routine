import { Activity, Wind, Settings } from 'lucide-react'
import type { AppTab } from '../types'

interface BottomNavProps {
  active: AppTab
  onChange: (tab: AppTab) => void
}

const TABS: { id: AppTab; icon: typeof Activity; label: string }[] = [
  { id: 'stretching',    icon: Activity,  label: 'Stretching' },
  { id: 'atmen',         icon: Wind,      label: 'Atmen' },
  { id: 'einstellungen', icon: Settings,  label: 'Einstellungen' },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="shrink-0 bg-white dark:bg-black border-t border-gray-200 dark:border-[#38383a]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={[
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-green-500 dark:text-green-400'
                  : 'text-gray-400 dark:text-[#8e8e93]',
              ].join(' ')}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
