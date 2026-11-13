import type { Exercise } from '../types'

export const SEED_EXERCISES: Exercise[] = [
  // ── Nacken ───────────────────────────────────────────────────────────────
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
    description: 'Kinn sanft zur Brust ziehen, Nacken lang machen, Hinterkopf nach oben',
  },
  {
    id: 'nacken-rotation',
    name: 'Nackenrotation',
    bilateral: true,
    category: 'Nacken',
    description: 'Kopf langsam zur Schulter drehen, Kinn leicht absenken',
  },

  // ── Schultern (Volleyball) ───────────────────────────────────────────────
  {
    id: 'schultern-tuerrahmen',
    name: 'Türrahmen-Stretch',
    bilateral: true,
    category: 'Schultern',
    description: 'Arm 90° am Türrahmen anlehnen, Körper langsam wegdrehen bis Brust + Schulter vorne ziehen',
  },
  {
    id: 'schultern-aussenrotation',
    name: 'Außenrotations-Stretch',
    bilateral: true,
    category: 'Schultern',
    description: 'Ellbogen 90° an Wand, Unterarm flach am Türrahmen – Oberkörper wegdrehen bis vordere Schulter zieht',
  },
  {
    id: 'schultern-latissimus',
    name: 'Latissimus-Stretch',
    bilateral: true,
    category: 'Schultern',
    description: 'Arm gestreckt auf Schulterhöhe an Wand/Stange, Körper seitlich wegdrücken bis Lat und Achsel ziehen',
  },
  {
    id: 'schultern-brustöffner',
    name: 'Brustöffner',
    bilateral: false,
    category: 'Schultern',
    description: 'Hände hinter dem Rücken falten, Schulterblätter zusammenziehen, Brust öffnen',
  },

  // ── Rücken ───────────────────────────────────────────────────────────────
  {
    id: 'ruecken-jefferson-curl',
    name: 'Jefferson Curl',
    bilateral: false,
    category: 'Rücken',
    description: 'Im Stehen Wirbel für Wirbel nach unten rollen, Kinn zur Brust, Hände hängen – Wirbelsäule lang machen',
  },
  {
    id: 'ruecken-katze-kuh',
    name: 'Katze–Kuh',
    bilateral: false,
    category: 'Rücken',
    description: 'Vierfüßlerstand: Rücken rund machen (Kinn zur Brust), dann durchhängen und Kopf heben',
  },
  {
    id: 'ruecken-thoraxrotation',
    name: 'Thoraxrotation',
    bilateral: true,
    category: 'Rücken',
    description: 'Im Schneidersitz Hände auf Schultern, Ellbogen nach vorne – Oberkörper drehen ohne Hüfte mitzunehmen',
  },
  {
    id: 'ruecken-seitbeuge',
    name: 'Seitliche Rumpfbeugung',
    bilateral: true,
    category: 'Rücken',
    description: 'Arm über den Kopf strecken, zur Seite beugen – Flanke und seitliche Wirbelsäule dehnen',
  },

  // ── Rücken (Fortsetzung) ─────────────────────────────────────────────────
  {
    id: 'ruecken-world-greatest',
    name: "World's Greatest Stretch",
    bilateral: true,
    category: 'Rücken',
    description: 'Ausfallschritt: Hand innen neben den Fuss setzen, dann Arm zur Decke drehen – Hüfte, Brustwirbelsäule und Schulter in einer Bewegung',
  },
  {
    id: 'ruecken-bretzel',
    name: 'Bretzel',
    bilateral: true,
    category: 'Rücken',
    description: 'Seitenlage: unteres Knie 90° angewinkelt, oberes Knie mit Gegenseiten-Hand zum Boden drücken, oberer Arm öffnet nach hinten – Schulter bleibt am Boden',
  },

  // ── Hüfte (ATG / KOT) ───────────────────────────────────────────────────
  {
    id: 'huefte-couch-stretch',
    name: 'Couch Stretch',
    bilateral: true,
    category: 'Hüfte',
    description: 'Hinteres Knie am Boden, Fuss an Wand oder Stuhl hochgestellt – Hüfte gerade nach vorne schieben, Gesäß anspannen',
  },
  {
    id: 'huefte-90-90',
    name: '90-90-Stretch',
    bilateral: true,
    category: 'Hüfte',
    description: 'Beide Knie im 90°-Winkel, aufrecht sitzen – Oberkörper leicht nach vorne, Hüfte öffnen',
  },
  {
    id: 'huefte-taubenpose',
    name: 'Taubenpose',
    bilateral: true,
    category: 'Hüfte',
    description: 'Vorderbein quer, hinteres Bein gestreckt – Oberkörper aufrecht oder nach vorne abgelegt',
  },
  {
    id: 'huefte-hip-cars',
    name: 'Hip CARs',
    bilateral: true,
    category: 'Hüfte',
    description: 'Im Stehen: Knie hochziehen, nach außen rotieren, nach hinten strecken, zurück – voller Kreisbogen ohne Oberkörperbewegung',
  },

  {
    id: 'huefte-frosch',
    name: 'Frosch-Stretch',
    bilateral: false,
    category: 'Hüfte',
    description: 'Kniend, Knie weit nach außen, Füsse hinter den Knien – Hüfte gleichmäßig nach hinten absenken, Leiste öffnet sich',
  },
  {
    id: 'huefte-cossack',
    name: 'Cossack Squat',
    bilateral: true,
    category: 'Hüfte',
    description: 'Breiter Stand, ein Knie tief beugen, anderes Bein gestreckt – Fuß des gestreckten Beins zeigt nach oben, Leiste dehnen',
  },

  // ── Beine (ATG / KOT) ───────────────────────────────────────────────────
  {
    id: 'beine-knie-zehe-drill',
    name: 'Knie-über-Zehe-Drill',
    bilateral: true,
    category: 'Beine',
    description: 'Fuss flach am Boden, Knie so weit wie möglich über die Zehe schieben – Knöchelmobilität steigern',
  },
  {
    id: 'beine-atg-split-squat',
    name: 'ATG Split Squat',
    bilateral: true,
    category: 'Beine',
    description: 'Tiefer Ausfallschritt, vorderes Knie weit über die Zehe – Knöchel, Knie und Hüftbeuger gleichzeitig dehnen',
  },
  {
    id: 'beine-elephant-walk',
    name: 'Elephant Walk',
    bilateral: false,
    category: 'Beine',
    description: 'Gehen mit gestreckten Beinen, Oberkörper hängt nach unten – Hamstrings und Waden durch Bewegung dehnen',
  },
  {
    id: 'beine-soleus-stretch',
    name: 'Soleus-Stretch',
    bilateral: true,
    category: 'Beine',
    description: 'Fuss an Wand, Knie gebogen – Ferse bleibt am Boden, langsam nach vorne drücken bis tiefer Wadenziehen',
  },
  {
    id: 'beine-pancake',
    name: 'Pancake',
    bilateral: false,
    category: 'Beine',
    description: 'Spreizsitz, Oberkörper gerade nach vorne legen – Brust zum Boden, Beine aktiv ausgestreckt halten',
  },
  {
    id: 'beine-reverse-nordic',
    name: 'Reverse Nordic',
    bilateral: false,
    category: 'Beine',
    description: 'Kniend, Füsse fixiert – Oberkörper langsam nach hinten sinken lassen, Quadrizeps unter Kontrolle dehnen',
  },
]
