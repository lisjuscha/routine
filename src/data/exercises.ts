import type { Exercise } from '../types'

export const SEED_EXERCISES: Exercise[] = [
  // Nacken
  {
    id: 'nacken-seitneigung',
    name: 'Seitneigung Nacken',
    bilateral: true,
    category: 'Nacken',
    description: 'Ohr zur Schulter, Gegenseite leicht wegdrücken',
  },
  {
    id: 'nacken-chin-tuck',
    name: 'Chin Tuck',
    bilateral: false,
    category: 'Nacken',
    description: 'Kinn sanft zur Brust ziehen, Nacken lang machen',
  },
  {
    id: 'nacken-rotation',
    name: 'Nackenrotation',
    bilateral: true,
    category: 'Nacken',
    description: 'Kopf langsam zur Schulter drehen, Blick in die Ferne',
  },
  // Schultern
  {
    id: 'schultern-brustöffner',
    name: 'Brustöffner',
    bilateral: false,
    category: 'Schultern',
    description: 'Hände hinter dem Rücken falten, Brust öffnen und Schulterblätter zusammenziehen',
  },
  {
    id: 'schultern-querstretcher',
    name: 'Schulter-Querstretcher',
    bilateral: true,
    category: 'Schultern',
    description: 'Arm gerade über die Brust, Gegenseite drückt sanft dagegen',
  },
  // Rücken
  {
    id: 'ruecken-katze-kuh',
    name: 'Katze–Kuh',
    bilateral: false,
    category: 'Rücken',
    description: 'Im Vierfüßlerstand: Rücken rund machen (Katze), dann durchhängen (Kuh)',
  },
  {
    id: 'ruecken-seitbeuge',
    name: 'Seitliche Rumpfbeugung',
    bilateral: true,
    category: 'Rücken',
    description: 'Arm über den Kopf, zur Seite beugen und Flanke dehnen',
  },
  {
    id: 'ruecken-thoraxrotation',
    name: 'Thoraxrotation',
    bilateral: true,
    category: 'Rücken',
    description: 'Im Sitzen: Oberkörper drehen, Hände auf den Schultern',
  },
  // Hüfte
  {
    id: 'huefte-hüftbeuger',
    name: 'Hüftbeuger-Stretch',
    bilateral: true,
    category: 'Hüfte',
    description: 'Ausfallschritt, hinteres Knie auf dem Boden, Hüfte nach vorne schieben',
  },
  {
    id: 'huefte-90-90',
    name: '90-90-Stretch',
    bilateral: true,
    category: 'Hüfte',
    description: 'Beide Knie im 90-Grad-Winkel, aufrecht sitzen, Körper leicht nach vorne lehnen',
  },
  {
    id: 'huefte-taubenpose',
    name: 'Taubenpose',
    bilateral: true,
    category: 'Hüfte',
    description: 'Vorderbein quer, Oberkörper entweder aufrecht oder nach vorne abgelegt',
  },
  // Beine
  {
    id: 'beine-quadrizeps',
    name: 'Quadrizeps-Stretch',
    bilateral: true,
    category: 'Beine',
    description: 'Im Stehen Ferse zum Gesäß ziehen, Knie zusammen halten',
  },
  {
    id: 'beine-waden',
    name: 'Wadendehnung',
    bilateral: true,
    category: 'Beine',
    description: 'Ferse auf dem Boden, Zehen gegen die Wand, leicht nach vorne lehnen',
  },
  {
    id: 'beine-ischiokrural',
    name: 'Ischiokrural-Dehnung',
    bilateral: true,
    category: 'Beine',
    description: 'Bein gestreckt auf einer Erhöhung, Oberkörper aufrecht nach vorne lehnen',
  },
  {
    id: 'beine-piriformis',
    name: 'Piriformis-Stretch',
    bilateral: true,
    category: 'Beine',
    description: 'Auf dem Rücken liegend: Knöchel aufs andere Knie legen und Bein zur Brust ziehen',
  },
]
