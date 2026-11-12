# Routine

Timer-App für Stretching und Atemübungen als Progressive Web App.

## Features

**Stretching**
- Übungen aus einer Liste auswählen, nach Kategorie gruppiert
- Länge wählen: Kurz (30 s), Mittel (45 s) oder Lang (60 s) pro Seite
- Übungen hinzufügen, bearbeiten und löschen
- Auswahl als benannte Presets speichern
- Timer läuft automatisch durch: bilaterale Übungen mit Seitenwechsel-Pause, Übergangspausen zwischen Übungen

**Atmen**
- Programme: Akut (2 min), Mini (30 s), Zwerchfellatmung (3 min), Resonanzatmung (5 min), Komplett (10 min)
- Atemkreis wächst beim Einatmen, schrumpft beim Ausatmen
- „Akut" ist von der Startseite aus mit einem Tap erreichbar

**Timer**
- Timestamp-basiert: funktioniert korrekt nach gesperrtem Bildschirm und Hintergrund-Tab
- Screen Wake Lock während einer Übung
- Optionaler Ton (Web Audio API) und Vibration
- Optionale Sprachansage des Übungsnamens (Web Speech API)

**PWA**
- Funktioniert nach dem ersten Laden vollständig offline
- Installierbar auf dem iPhone-Homescreen

**Datenschutz**
- Alle Daten bleiben lokal auf dem Gerät (IndexedDB)
- Kein Backend, keine Accounts, keine Analytics
- Export und Import als JSON-Datei

---

> **Hinweis zu den Atemübungen:** Diese Übungen ersetzen keine ärztliche Abklärung.
> Bei starker Atemnot, Brustschmerzen mit Ausstrahlung, bläulichen Lippen oder Ohnmacht sofort **112** rufen.

---

## App auf dem iPhone installieren

1. App im Safari öffnen: `https://<dein-username>.github.io/routine/`
2. Teilen-Symbol (Quadrat mit Pfeil nach oben) antippen
3. „Zum Home-Bildschirm" wählen
4. Namen bestätigen und „Hinzufügen" tippen

Die App ist danach im Vollbild ohne Browser-Leiste nutzbar.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Öffne `http://localhost:5173/routine/`.

## Build & Deploy

```bash
npm run build   # tsc -b && vite build → dist/
```

GitHub Actions deployed automatisch bei Push auf `main` nach GitHub Pages.

## Tests

```bash
npm test
```

Tests prüfen die beiden puren Phasen-Funktionen:
- Stretching: Seitenwechsel, Pausen, Gesamtdauer
- Atmen: Programmdauer stimmt exakt, Phasenreihenfolge bei „Akut" und „Komplett"
