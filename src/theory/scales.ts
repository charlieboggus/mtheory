import type { NoteName, ScaleResult, IntervalDegree, FretNote } from './types'

// ── Chromatic reference ────────────────────────────────────────────────────────

export const SHARPS: NoteName[] = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
export const FLATS: NoteName[]  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']

export const FLAT_ROOTS = new Set(['F','Bb','Eb','Ab','Db','Gb','Cb'])

export function noteIndex(note: NoteName): number {
  switch (note) {
    case 'Cbb': return 10; case 'Dbb': return 0;  case 'Ebb': return 2
    case 'Fbb': return 3;  case 'Gbb': return 5;  case 'Abb': return 7;  case 'Bbb': return 9
    case 'C##': return 2;  case 'D##': return 4;  case 'E##': return 6
    case 'F##': return 7;  case 'G##': return 9;  case 'A##': return 11; case 'B##': return 1
    case 'Cb':  return 11; case 'Fb':  return 4;  case 'E#':  return 5;  case 'B#':  return 0
    default: {
      const si = SHARPS.indexOf(note as typeof SHARPS[number])
      if (si !== -1) return si
      const fi = FLATS.indexOf(note as typeof FLATS[number])
      if (fi !== -1) return fi
      throw new Error(`Unknown note: ${note}`)
    }
  }
}

export function chromatic(root: NoteName, preferFlats?: boolean): NoteName[] {
  const useFl = preferFlats ?? (FLAT_ROOTS.has(root) || root.includes('b'))
  const base = useFl ? FLATS : SHARPS
  const idx = noteIndex(root)
  return Array.from({ length: 12 }, (_, i) => base[(idx + i) % 12])
}

// ── Scale database ─────────────────────────────────────────────────────────────

export const SCALES: Record<string, number[]> = {
  // Major modes
  'major':                 [0,2,4,5,7,9,11],
  'ionian':                [0,2,4,5,7,9,11],
  'dorian':                [0,2,3,5,7,9,10],
  'phrygian':              [0,1,3,5,7,8,10],
  'lydian':                [0,2,4,6,7,9,11],
  'mixolydian':            [0,2,4,5,7,9,10],
  'minor':                 [0,2,3,5,7,8,10],
  'natural minor':         [0,2,3,5,7,8,10],
  'aeolian':               [0,2,3,5,7,8,10],
  'locrian':               [0,1,3,5,6,8,10],
  // Harmonic minor + modes
  'harmonic minor':        [0,2,3,5,7,8,11],
  'locrian natural 6':     [0,1,3,5,6,9,10],
  'ionian augmented':      [0,2,4,5,8,9,11],
  'dorian #4':             [0,2,3,6,7,9,10],
  'phrygian dominant':     [0,1,4,5,7,8,10],
  'ahava rabbah':          [0,1,4,5,7,8,10],
  'lydian #2':             [0,3,4,6,7,9,11],
  'ultralocrian':          [0,1,3,4,6,8,9],
  // Melodic minor + modes
  'melodic minor':         [0,2,3,5,7,9,11],
  'dorian b2':             [0,1,3,5,7,9,10],
  'lydian augmented':      [0,2,4,6,8,9,11],
  'lydian dominant':       [0,2,4,6,7,9,10],
  'mixolydian b6':         [0,2,4,5,7,8,10],
  'aeolian dominant':      [0,2,4,5,7,8,10],
  'half diminished':       [0,2,3,5,6,8,10],
  'locrian #2':            [0,2,3,5,6,8,10],
  'altered':               [0,1,3,4,6,8,10],
  'super locrian':         [0,1,3,4,6,8,10],
  // Pentatonics
  'major pentatonic':      [0,2,4,7,9],
  'minor pentatonic':      [0,3,5,7,10],
  'blues':                 [0,3,5,6,7,10],
  'major blues':           [0,2,3,4,7,9],
  // Symmetric
  'whole tone':            [0,2,4,6,8,10],
  'whole half diminished': [0,2,3,5,6,8,9,11],
  'half whole diminished': [0,1,3,4,6,7,9,10],
  'chromatic':             [0,1,2,3,4,5,6,7,8,9,10,11],
  // Other
  'double harmonic':       [0,1,4,5,7,8,11],
  'hungarian minor':       [0,2,3,6,7,8,11],
  'hungarian major':       [0,3,4,6,7,9,10],
  'neapolitan minor':      [0,1,3,5,7,8,11],
  'neapolitan major':      [0,1,3,5,7,9,11],
  'persian':               [0,1,4,5,6,8,11],
  'enigmatic':             [0,1,4,6,8,10,11],
  'bebop major':           [0,2,4,5,7,8,9,11],
  'bebop dominant':        [0,2,4,5,7,9,10,11],
  'bebop minor':           [0,2,3,4,5,7,9,10],
  'bebop dorian':          [0,2,3,4,5,7,9,10],
  'in sen':                [0,1,5,7,10],
  'yo':                    [0,2,5,7,9],
  'hirajoshi':             [0,2,3,7,8],
  'iwato':                 [0,1,5,6,10],
}

// ── Note spelling ──────────────────────────────────────────────────────────────

const NOTE_LETTERS = ['C','D','E','F','G','A','B'] as const
const LETTER_PC: Record<string, number> = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 }

// Degree letter index (0=root letter, 1=2nd letter, …) for each position in non-7-note scales.
const SCALE_DEGREE_TEMPLATES: Record<string, number[]> = {
  'major pentatonic':      [0,1,2,4,5],
  'minor pentatonic':      [0,2,3,4,6],
  'blues':                 [0,2,3,4,4,6],
  'major blues':           [0,1,2,2,4,5],
  'in sen':                [0,1,3,4,6],
  'yo':                    [0,1,3,4,5],
  'hirajoshi':             [0,1,2,4,5],
  'iwato':                 [0,1,3,4,6],
  'whole tone':            [0,1,2,3,4,5],
  'bebop major':           [0,1,2,3,4,4,5,6],
  'bebop dominant':        [0,1,2,3,4,5,6,6],
  'bebop minor':           [0,1,2,2,3,4,5,6],
  'bebop dorian':          [0,1,2,2,3,4,5,6],
  'whole half diminished': [0,1,2,3,4,5,5,6],
  'half whole diminished': [0,1,2,2,3,4,5,6],
}

// Given a root and interval set, compute the exact note name for each degree.
// For 7-note scales, degree i uses the letter (root + i) mod 7.
// For other scales with a degree template, the template specifies which letter slot each position uses.
// Accidentals (including double) are derived from the difference between the pitch class
// and the natural pitch class of the expected letter.
function buildScaleNotes(root: NoteName, intervals: number[], scaleName: string): NoteName[] {
  const rootPc = noteIndex(root) % 12
  const rootLetterIdx = NOTE_LETTERS.indexOf(root[0] as typeof NOTE_LETTERS[number])
  const degreeTemplate = SCALE_DEGREE_TEMPLATES[scaleName]

  return intervals.map((interval, i) => {
    const pc = (rootPc + interval) % 12

    let letterIdx: number
    if (intervals.length === 7) {
      letterIdx = (rootLetterIdx + i) % 7
    } else if (degreeTemplate) {
      letterIdx = (rootLetterIdx + degreeTemplate[i]) % 7
    } else {
      // Chromatic scale or any scale with no template: use enharmonic spelling
      const useFlats = FLAT_ROOTS.has(root) || root.includes('b')
      return (useFlats ? FLATS : SHARPS)[pc]
    }

    const letter = NOTE_LETTERS[letterIdx]
    const letterPc = LETTER_PC[letter]
    const diff = (pc - letterPc + 12) % 12

    switch (diff) {
      case 0:  return letter as NoteName
      case 1:  return `${letter}#` as NoteName
      case 2:  return `${letter}##` as NoteName
      case 11: return `${letter}b` as NoteName
      case 10: return `${letter}bb` as NoteName
      default: {
        // Triple accidental — not musically representable; fall back to enharmonic
        const useFlats = FLAT_ROOTS.has(root) || root.includes('b')
        return (useFlats ? FLATS : SHARPS)[pc]
      }
    }
  })
}

// ── Fuzzy scale name matching ──────────────────────────────────────────────────

export function fuzzyMatch(input: string): string | null {
  const sl = input.toLowerCase().trim()
  if (sl in SCALES) return sl
  for (const key of Object.keys(SCALES)) {
    if (key.includes(sl) || sl.includes(key)) return key
  }
  return null
}

// ── Main scale resolver ────────────────────────────────────────────────────────

export function resolveScale(root: NoteName, scaleName: string): ScaleResult | null {
  const matched = fuzzyMatch(scaleName)
  if (!matched) return null
  const intervals = SCALES[matched]
  const notes = buildScaleNotes(root, intervals, matched)
  return {
    root,
    name: matched,
    displayName: `${root} ${matched.replace(/\b\w/g, c => c.toUpperCase())}`,
    notes,
    intervals,
    preferFlats: FLAT_ROOTS.has(root) || root.includes('b'),
  }
}

// ── Interval degree classification ────────────────────────────────────────────

export function classifyInterval(semitones: number): IntervalDegree {
  switch (semitones) {
    case 0:  return 'root'
    case 1: case 2: return 'second'
    case 3: case 4: return 'third'
    case 5: case 6: return 'fourth'
    case 7: return 'fifth'
    case 8: case 9: return 'sixth'
    case 10: case 11: return 'seventh'
    default: return 'other'
  }
}

// ── Fretboard map builder ──────────────────────────────────────────────────────

export const STANDARD_TUNING: Array<{ name: string; openPc: number }> = [
  { name: 'e', openPc: 4  },
  { name: 'B', openPc: 11 },
  { name: 'G', openPc: 7  },
  { name: 'D', openPc: 2  },
  { name: 'A', openPc: 9  },
  { name: 'E', openPc: 4  },
]

export function buildFretboardMap(
  scale: ScaleResult,
  frets = 12
): Map<string, FretNote | null> {
  const rootPc = noteIndex(scale.root) % 12
  const scaleMap = new Map<number, { note: NoteName; semitones: number }>()

  scale.notes.forEach((note, i) => {
    const pc = noteIndex(note) % 12
    scaleMap.set(pc, { note, semitones: scale.intervals[i] })
  })

  const map = new Map<string, FretNote | null>()

  for (const { name: stringName, openPc } of STANDARD_TUNING) {
    for (let fret = 0; fret <= frets; fret++) {
      const pc = (openPc + fret) % 12
      const key = `${stringName}-${fret}`
      const entry = scaleMap.get(pc)
      map.set(key, entry
        ? { note: entry.note, degree: classifyInterval(entry.semitones), isRoot: pc === rootPc, intervalSemitones: entry.semitones }
        : null
      )
    }
  }

  return map
}

export const ALL_ROOTS: NoteName[] = [
  'C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'
]

export const SCALE_NAMES = Object.keys(SCALES).sort()
