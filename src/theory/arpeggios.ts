import { noteIndex, STANDARD_TUNING, FLAT_ROOTS, classifyInterval } from './scales'
import { CHORD_QUALITIES } from './voicings'
import type { NoteName, FretNote } from './types'

const SHARP_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const FLAT_NAMES  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']

// Same spelling rules as ChordBox/ChordFingerings — extended intervals use above-octave
// values (b9=13, #9=15, #11=18, b13=20) to select the right enharmonic.
function spellNote(pc: number, interval: number, useFlats: boolean): NoteName {
  const useFlat =
    interval === 1 || interval === 3 || interval === 6 || interval === 10 || interval === 13 || interval === 20
      ? true
      : interval === 8 || interval === 15 || interval === 18
        ? false
        : useFlats
  return (useFlat ? FLAT_NAMES : SHARP_NAMES)[pc] as NoteName
}

export function buildArpeggioFretboardMap(
  root: NoteName,
  quality: string,
  frets = 12
): Map<string, FretNote | null> {
  const intervals = CHORD_QUALITIES[quality]
  if (!intervals) return new Map()

  const rootPc   = noteIndex(root) % 12
  const useFlats = FLAT_ROOTS.has(root) || root.includes('b')

  // pitch class → { note, semitones } — last interval wins for enharmonic on collisions
  const chordMap = new Map<number, { note: NoteName; semitones: number }>()
  for (const interval of intervals) {
    const pc = (rootPc + interval) % 12
    chordMap.set(pc, { note: spellNote(pc, interval, useFlats), semitones: interval % 12 })
  }

  const map = new Map<string, FretNote | null>()
  for (const { name: stringName, openPc } of STANDARD_TUNING) {
    for (let fret = 0; fret <= frets; fret++) {
      const pc    = (openPc + fret) % 12
      const key   = `${stringName}-${fret}`
      const entry = chordMap.get(pc)
      map.set(key, entry
        ? { note: entry.note, degree: classifyInterval(entry.semitones), isRoot: pc === rootPc, intervalSemitones: entry.semitones }
        : null
      )
    }
  }

  return map
}
