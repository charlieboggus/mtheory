import type { NoteName, ChordResult } from './types'
import { noteIndex } from './scales'
import type { ScaleResult } from './types'

// ── Chord quality patterns ─────────────────────────────────────────────────────

const CHORD_QUALITIES: Array<[number[], string]> = [
  // 7-note (13th chords)
  [[0,2,4,5,7,9,11], 'maj13'],
  [[0,2,4,5,7,9,10], '13'],
  [[0,2,3,5,7,9,10], 'm13'],
  [[0,2,3,5,7,9,11], 'm(maj13)'],
  // 6-note (altered dominants)
  [[0,1,4,6,7,10], '7b9#11'],
  [[0,3,4,6,7,10], '7#9#11'],
  // 6-note (11th chords)
  [[0,2,4,5,7,11], 'maj11'],
  [[0,2,4,5,7,10], '11'],
  [[0,2,3,5,7,10], 'm11'],
  [[0,2,3,5,7,11], 'm(maj11)'],
  // 5-note (9th chords)
  [[0,2,4,7,11], 'maj9'],
  [[0,2,4,7,10], '9'],
  [[0,2,3,7,10], 'm9'],
  [[0,2,3,7,11], 'm(maj9)'],
  [[0,2,4,8,11], 'maj9#5'],
  [[0,2,4,8,10], '9#5'],
  [[0,2,3,6,10], 'm9b5'],
  // 5-note (altered dominants — mod-12 reduced for pattern matching)
  [[0,1,4,7,10], '7b9'],   // b9=13%12=1
  [[0,3,4,7,10], '7#9'],   // #9=15%12=3
  [[0,4,6,7,10], '7#11'],  // #11=18%12=6
  [[0,4,7,8,10], '7b13'],  // b13=20%12=8
  [[0,1,4,8,10], '7alt'],  // b9=1, b13=8, no 5th
  // 4-note (7th chords + add/6th chords)
  [[0,4,7,11], 'maj7'],
  [[0,4,7,10], '7'],
  [[0,3,7,10], 'm7'],
  [[0,3,7,11], 'm(maj7)'],
  [[0,4,8,11], 'maj7#5'],
  [[0,4,8,10], '7#5'],
  [[0,3,6,10], 'm7b5'],
  [[0,3,6,9],  'dim7'],
  [[0,2,7,10], '7sus2'],
  [[0,5,7,10], '7sus4'],
  [[0,2,4,7],  'add9'],
  [[0,2,3,7],  'madd9'],
  [[0,4,7,9],  '6'],
  [[0,3,7,9],  'm6'],
  // Triads
  [[0,4,7], ''],
  [[0,3,7], 'm'],
  [[0,4,8], 'aug'],
  [[0,3,6], 'dim'],
  [[0,5,7], 'sus4'],
  [[0,2,7], 'sus2'],
]

function intervalsFromRoot(notes: NoteName[]): number[] | null {
  try {
    const rootPos = noteIndex(notes[0]) % 12
    const ivs = notes.map(n => {
      const pos = noteIndex(n) % 12
      return (pos - rootPos + 12) % 12
    })
    return [...new Set(ivs)].sort((a, b) => a - b)
  } catch {
    return null
  }
}

function nameChord(root: NoteName, intervals: number[]): string | null {
  for (const [pattern, suffix] of CHORD_QUALITIES) {
    if (
      pattern.length === intervals.length &&
      pattern.every((v, i) => v === intervals[i])
    ) {
      return `${root}${suffix}`
    }
  }
  return null
}

// ── Roman numeral labeling ─────────────────────────────────────────────────────

const NUMERALS = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']

function romanNumeral(degree: number, quality: string): string {
  const r = NUMERALS[degree - 1]
  if (quality.startsWith('dim7') || quality.startsWith('dim')) return r.toLowerCase() + '°'
  if (quality.startsWith('m7b5')) return r.toLowerCase() + 'ø'
  if (quality.startsWith('maj')) return r
  if (quality.startsWith('m(maj')) return r.toLowerCase()
  if (quality.startsWith('m')) return r.toLowerCase()
  return r
}

// ── Diatonic chord builder ─────────────────────────────────────────────────────

export function buildDiatonicChords(scale: ScaleResult): ChordResult[] {
  const { notes } = scale
  const n = notes.length
  const chords: ChordResult[] = []

  for (let i = 0; i < n; i++) {
    let found = false
    for (const size of [7, 6, 5, 4, 3]) {
      const chordNotes = Array.from({ length: size }, (_, j) => notes[(i + j * 2) % n])
      const intervals = intervalsFromRoot(chordNotes)
      if (!intervals) continue
      const name = nameChord(chordNotes[0], intervals)
      if (name) {
        const root = chordNotes[0]
        const quality = name.slice(root.length)
        chords.push({
          degree: i + 1,
          roman: romanNumeral(i + 1, quality),
          name,
          notes: chordNotes,
          quality,
        })
        found = true
        break
      }
    }
    if (!found) {
      chords.push({
        degree: i + 1,
        roman: NUMERALS[i],
        name: '?',
        notes: [notes[i]],
        quality: '?',
      })
    }
  }

  return chords
}
