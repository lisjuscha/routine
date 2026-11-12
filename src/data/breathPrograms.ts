import type { BreathProgram } from '../types'

export const BREATH_PROGRAMS: BreathProgram[] = [
  {
    id: 'akut',
    name: 'Akut',
    totalDurationSec: 120,
    description: 'Schnelle Hilfe bei Anspannung',
    isAkut: true,
  },
  {
    id: 'mini',
    name: 'Mini',
    totalDurationSec: 30,
    description: '3 Atemzüge zum Ankommen',
  },
  {
    id: 'zwerchfell',
    name: 'Zwerchfellatmung',
    totalDurationSec: 180,
    description: 'Ruhige, tiefe Bauchatmung',
  },
  {
    id: 'resonanz',
    name: 'Resonanzatmung',
    totalDurationSec: 300,
    description: 'Kohärentes Atmen für Balance',
  },
  {
    id: 'komplett',
    name: 'Komplett',
    totalDurationSec: 600,
    description: 'Ankommen · Zwerchfell · Resonanz · Abschluss',
  },
]
