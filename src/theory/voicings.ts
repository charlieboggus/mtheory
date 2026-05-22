import { noteIndex } from './scales'
import type { NoteName } from './types'

// Chord quality → semitone intervals from root.
// Suffix strings match what buildDiatonicChords produces so clicking a scale
// chord navigates directly here without re-parsing.
export const CHORD_QUALITIES: Record<string, number[]> = {
  '':          [0, 4, 7],
  'm':         [0, 3, 7],
  'dim':       [0, 3, 6],
  'aug':       [0, 4, 8],
  'sus2':      [0, 2, 7],
  'sus4':      [0, 5, 7],
  '7':         [0, 4, 7, 10],
  'maj7':      [0, 4, 7, 11],
  'm7':        [0, 3, 7, 10],
  'm(maj7)':   [0, 3, 7, 11],
  '7#5':       [0, 4, 8, 10],
  'maj7#5':    [0, 4, 8, 11],
  'm7b5':      [0, 3, 6, 10],
  'dim7':      [0, 3, 6, 9],
  '7sus2':     [0, 2, 7, 10],
  '7sus4':     [0, 5, 7, 10],
  'add9':      [0, 2, 4, 7],
  'madd9':     [0, 2, 3, 7],
  '6':         [0, 4, 7, 9],
  'm6':        [0, 3, 7, 9],
  '9':         [0, 2, 4, 7, 10],
  'maj9':      [0, 2, 4, 7, 11],
  'm9':        [0, 2, 3, 7, 10],
  'm(maj9)':   [0, 2, 3, 7, 11],
  'm9b5':      [0, 2, 3, 6, 10],
  // 11th chords — 3rd omitted from dom11 to avoid tritone clash with 11th
  '11':        [0, 2, 5, 10],
  'maj11':     [0, 2, 4, 5, 11],
  'm11':       [0, 2, 3, 5, 10],
  // 13th chords — 11th omitted for playability
  '13':        [0, 4, 7, 9, 10],
  'maj13':     [0, 4, 7, 9, 11],
  'm13':       [0, 3, 7, 9, 10],
  // Altered dominants — extensions stored as raw semitones above the octave
  // so spelling helpers can distinguish b9(13) from b2(1), #9(15) from b3(3), etc.
  '7b9':       [0, 4, 10, 13],
  '7#9':       [0, 4, 10, 15],
  '7#11':      [0, 4, 10, 18],
  '7b9#11':    [0, 4, 10, 13, 18],
  '7#9#11':    [0, 4, 10, 15, 18],
  '7b13':      [0, 4, 10, 20],
  '7alt':      [0, 4, 10, 13, 20],
}

export const CHORD_QUALITY_NAMES = Object.keys(CHORD_QUALITIES)

export const CHORD_QUALITY_GROUPS: { label: string; qualities: string[] }[] = [
  { label: 'Triads',           qualities: ['', 'm', 'dim', 'aug', 'sus2', 'sus4'] },
  { label: '7th Chords',       qualities: ['7', 'maj7', 'm7', 'm(maj7)', '7#5', 'maj7#5', 'm7b5', 'dim7', '7sus2', '7sus4'] },
  { label: 'Extended',         qualities: ['add9', 'madd9', '6', 'm6', '9', 'maj9', 'm9', 'm(maj9)', 'm9b5', '11', 'maj11', 'm11', '13', 'maj13', 'm13'] },
  { label: 'Altered Dominant', qualities: ['7b9', '7#9', '7#11', '7b9#11', '7#9#11', '7b13', '7alt'] },
]
export const INVERSION_LABELS = [
  'Root position',
  '1st inversion',
  '2nd inversion',
  '3rd inversion',
  '4th inversion',
  '5th inversion',
  '6th inversion',
]

// Low E → high e open-string pitch classes
export const OPEN_PC = [4, 9, 2, 7, 11, 4] as const

export interface Voicing {
  // frets[0]=low E … frets[5]=high e. -1=mute, 0=open, ≥1=fretted
  frets: [number, number, number, number, number, number]
  inversion: number  // 0=root, 1=first, 2=second, 3=third
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function longestConsecutiveRun(strings: readonly number[]): number {
  if (strings.length === 0) return 0
  let max = 1, cur = 1
  for (let j = 1; j < strings.length; j++) {
    cur = strings[j] === strings[j - 1] + 1 ? cur + 1 : 1
    if (cur > max) max = cur
  }
  return max
}

function estimateFingers(frets: readonly number[]): number {
  const groups = new Map<number, number[]>()
  frets.forEach((f, si) => {
    if (f > 0) {
      if (!groups.has(f)) groups.set(f, [])
      groups.get(f)!.push(si)
    }
  })
  if (groups.size === 0) return 0

  let count = 0
  const sorted = [...groups.keys()].sort((a, b) => a - b)
  for (let i = 0; i < sorted.length; i++) {
    const strings = groups.get(sorted[i])!.sort((a, b) => a - b)
    if (i === 0) {
      // Lowest fret: longest consecutive run → barre (1 finger); rest are individual
      const run = longestConsecutiveRun(strings)
      count += run >= 2 ? 1 + (strings.length - run) : strings.length
    } else {
      count += strings.length
    }
  }
  return count
}

function isValid(frets: readonly number[], chordPcs: ReadonlySet<number>): boolean {
  const played: { si: number; pc: number; fret: number }[] = []
  frets.forEach((f, si) => {
    if (f !== -1) played.push({ si, fret: f, pc: f === 0 ? OPEN_PC[si] : (OPEN_PC[si] + f) % 12 })
  })

  if (played.length < 3) return false

  // At most one muted string within the played span — single-string skips are
  // common (e.g. x-A string muted in many Amaj7 / jazz voicings) and are muted
  // by angling an adjacent fretting finger without adding a finger.
  const minSi = played[0].si
  const maxSi = played[played.length - 1].si
  let interiorMutes = 0
  for (let si = minSi; si <= maxSi; si++) {
    if (frets[si] === -1) interiorMutes++
  }
  if (interiorMutes > 1) return false

  // Every chord tone must be covered by at least one string
  const present = new Set(played.map(p => p.pc))
  for (const pc of chordPcs) {
    if (!present.has(pc)) return false
  }

  // Non-open notes must span ≤ 3 frets
  const fretted = played.filter(p => p.fret > 0).map(p => p.fret)
  if (fretted.length > 0 && Math.max(...fretted) - Math.min(...fretted) > 3) return false

  // When open strings are present the diagram anchors to the nut (startFret=1),
  // so fretted notes beyond row 4 would be clipped off the display.
  const hasOpen = played.some(p => p.fret === 0)
  if (hasOpen && fretted.length > 0 && Math.max(...fretted) > 4) return false

  if (estimateFingers(frets) > 4) return false

  return true
}

function getInversion(frets: readonly number[], intervals: readonly number[], rootPc: number): number {
  const bassIdx = frets.findIndex(f => f !== -1)
  if (bassIdx === -1) return 0
  const f = frets[bassIdx]
  const bassPc = f === 0 ? OPEN_PC[bassIdx] : (OPEN_PC[bassIdx] + f) % 12
  const idx = intervals.findIndex(i => (rootPc + i) % 12 === bassPc)
  return Math.max(0, idx)
}

// ── Main generator ─────────────────────────────────────────────────────────────

export function generateVoicings(root: NoteName, quality: string): Voicing[] {
  const intervals = CHORD_QUALITIES[quality]
  if (!intervals) return []

  const rootPc = noteIndex(root) % 12
  const chordPcs = new Set(intervals.map(i => (rootPc + i) % 12))
  const seen = new Set<string>()
  const results: Voicing[] = []

  // For each hand position, enumerate every valid 6-string combination.
  // Open strings (fret 0) are always offered when they're a chord tone.
  for (let pos = 1; pos <= 12; pos++) {
    const winHi = pos + 3

    const choices: number[][] = (OPEN_PC as readonly number[]).map(openPc => {
      const opts: number[] = [-1]
      if (chordPcs.has(openPc)) opts.push(0)
      for (let f = pos; f <= winHi; f++) {
        if (chordPcs.has((openPc + f) % 12)) opts.push(f)
      }
      return opts
    })

    for (const e  of choices[0])
    for (const a  of choices[1])
    for (const d  of choices[2])
    for (const g  of choices[3])
    for (const b  of choices[4])
    for (const he of choices[5]) {
      const frets = [e, a, d, g, b, he] as Voicing['frets']
      if (!isValid(frets, chordPcs)) continue
      const key = frets.join(',')
      if (seen.has(key)) continue
      seen.add(key)
      results.push({ frets, inversion: getInversion(frets, intervals, rootPc) })
    }
  }

  // Sort: lowest hand position first, then fewest fingers
  results.sort((a, b) => {
    const loA = Math.min(...a.frets.filter(f => f > 0).concat(99))
    const loB = Math.min(...b.frets.filter(f => f > 0).concat(99))
    return loA - loB || estimateFingers(a.frets) - estimateFingers(b.frets)
  })

  return results
}
