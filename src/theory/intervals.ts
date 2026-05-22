import { noteIndex, STANDARD_TUNING, SHARPS, FLATS, FLAT_ROOTS } from './scales'
import type { NoteName, IntervalFretNote } from './types'

export interface IntervalDef {
  semitones: number
  name: string
  short: string
}

export const INTERVALS: IntervalDef[] = [
  { semitones: 0,  name: 'Unison',         short: 'P1'  },
  { semitones: 1,  name: 'Minor 2nd',       short: 'm2'  },
  { semitones: 2,  name: 'Major 2nd',       short: 'M2'  },
  { semitones: 3,  name: 'Minor 3rd',       short: 'm3'  },
  { semitones: 4,  name: 'Major 3rd',       short: 'M3'  },
  { semitones: 5,  name: 'Perfect 4th',     short: 'P4'  },
  { semitones: 6,  name: 'Tritone',         short: 'TT'  },
  { semitones: 7,  name: 'Perfect 5th',     short: 'P5'  },
  { semitones: 8,  name: 'Minor 6th',       short: 'm6'  },
  { semitones: 9,  name: 'Major 6th',       short: 'M6'  },
  { semitones: 10, name: 'Minor 7th',       short: 'm7'  },
  { semitones: 11, name: 'Major 7th',       short: 'M7'  },
  { semitones: 12, name: 'Octave',          short: 'P8'  },
]

export function targetNoteName(root: NoteName, semitones: number): NoteName {
  if (semitones === 0 || semitones === 12) return root
  const useFlats = FLAT_ROOTS.has(root) || root.includes('b')
  const pc = (noteIndex(root) + semitones) % 12
  return (useFlats ? FLATS : SHARPS)[pc]
}

export function buildIntervalFretboardMap(
  root: NoteName,
  semitones: number,
  frets = 12
): Map<string, IntervalFretNote | null> {
  const rootPc   = noteIndex(root) % 12
  const targetPc = (rootPc + semitones) % 12
  const useFlats = FLAT_ROOTS.has(root) || root.includes('b')

  const map = new Map<string, IntervalFretNote | null>()

  for (const { name: stringName, openPc } of STANDARD_TUNING) {
    for (let fret = 0; fret <= frets; fret++) {
      const pc  = (openPc + fret) % 12
      const key = `${stringName}-${fret}`

      if (pc === rootPc) {
        map.set(key, { note: root, role: 'root' })
      } else if (pc === targetPc) {
        const note = (useFlats ? FLATS : SHARPS)[pc]
        map.set(key, { note, role: 'target' })
      } else {
        map.set(key, null)
      }
    }
  }

  return map
}
