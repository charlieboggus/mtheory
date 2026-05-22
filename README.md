# mtheory

A desktop guitar theory tool built with Electron and React. Explore scales on a fretboard, browse chord voicings with diagram boxes, and visualize intervals across all six strings.

---

## Features

### Scale Explorer

Select any root note and scale type to see the scale mapped across a 12-fret fretboard. Notes are color-coded by interval degree (root, third, fifth, seventh). A companion Chords tab lists all diatonic chords in the scale as a table — click any chord to open it in the Chord Diagrams view.

### Chord Diagrams

Pick a root and chord quality to generate every practical fingering on a standard-tuned guitar. Voicings are organized by inversion and drawn as chord box diagrams with note labels on each dot. Covers triads, 7th chords, extended chords (9th through 13th), and altered dominants (7b9, 7#9, 7#11, 7b9#11, 7#9#11, 7b13, 7alt).

### Interval Explorer

Choose a root note and interval (unison through octave) to see all instances of that interval highlighted on the fretboard. Root occurrences appear in amber, target interval occurrences in pink, with a count of how many positions exist.

---

## Development

**Prerequisites:** Node.js 18+, pnpm

```bash
pnpm install
pnpm dev
```

This starts Vite with HMR and launches the Electron window automatically.

---

## Build

```bash
pnpm build
```

Runs TypeScript type-checking, builds the web bundle, and packages the Electron app via `electron-builder`. Output lands in `release/`.

**macOS** produces a `.dmg`. **Windows** produces an NSIS installer.

---

## Other Scripts

| Command | Description |
|---|---|
| `pnpm typecheck` | Type-check without emitting files |
| `pnpm test` | Run the test suite once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm preview` | Preview the production web build locally |

---

## Project Structure

```
electron/          Electron main process and preload script
src/
  components/      React components (fretboard, chord box, chord fingerings, etc.)
  theory/          Pure music theory modules (scales, chords, voicings, intervals)
  lib/             Shared utilities
```

### Theory Modules

All music theory lives in `src/theory/` as pure functions with no React dependencies.

| Module | Responsibility |
|---|---|
| `scales.ts` | 40+ scale definitions, note spelling with correct letter names, fretboard map builder |
| `chords.ts` | Diatonic chord extraction from any scale, 50+ chord quality patterns, Roman numeral labels |
| `voicings.ts` | Exhaustive guitar voicing generator — enumerates all valid 6-string combinations subject to playability constraints |
| `intervals.ts` | 13 interval definitions (unison through octave) and interval fretboard map builder |
| `types.ts` | Shared TypeScript types |

### Voicing Generator

Rather than a hand-coded chord library, `generateVoicings()` brute-forces every valid fingering for a given chord across all 12 hand positions. A voicing passes if it:

- Uses at least 3 strings
- Contains at least one instance of every required chord tone
- Has fretted notes spanning no more than 3 frets
- Requires no more than 4 fingers
- Has at most one muted string within the played span

Results are sorted by lowest hand position, then by finger count.

### Note Spelling

Scale notes are spelled using letter-degree templates so that D major produces F# rather than Gb, and C# major produces E# rather than F. Extended chord tones use above-octave semitone values (b9=13, #9=15, #11=18, b13=20) to preserve correct enharmonic spelling in chord diagrams and fretboard labels.

---

## Stack

- **Electron** 33 — desktop shell
- **React** 18 + **TypeScript** 5 — UI
- **Vite** 5 + `vite-plugin-electron` — build and dev server
- **Tailwind CSS** 3 + **Radix UI** — styling and accessible primitives
- **electron-builder** — packaging and distribution
- **vitest** — test runner

---

## App ID

`dev.boggus.mtheory`
