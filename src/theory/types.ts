export type NoteName =
  | 'C' | 'C#' | 'Cb' | 'C##' | 'Cbb'
  | 'D' | 'D#' | 'Db' | 'D##' | 'Dbb'
  | 'E' | 'E#' | 'Eb' | 'E##' | 'Ebb'
  | 'F' | 'F#' | 'Fb' | 'F##' | 'Fbb'
  | 'G' | 'G#' | 'Gb' | 'G##' | 'Gbb'
  | 'A' | 'A#' | 'Ab' | 'A##' | 'Abb'
  | 'B' | 'B#' | 'Bb' | 'B##' | 'Bbb'

export type ScaleName = string

export interface ScaleResult {
  root: NoteName
  name: ScaleName
  displayName: string
  notes: NoteName[]
  intervals: number[]
  preferFlats: boolean
}

export interface ChordResult {
  degree: number
  roman: string
  name: string        // e.g. "Dm7", "G7", "Bm7b5"
  notes: NoteName[]
  quality: string     // suffix after root, e.g. "m7", "maj7", ""
}

export type IntervalDegree = 'root' | 'second' | 'third' | 'fourth' | 'fifth' | 'sixth' | 'seventh' | 'other'

export interface FretNote {
  note: NoteName
  degree: IntervalDegree
  isRoot: boolean
  intervalSemitones: number  // semitones from root
}

// Per fret on the fretboard: either a scale note or null
export type FretboardMap = Record<string, FretNote | null>  // key: `${string}-${number}` (string-fret)

export interface IntervalFretNote {
  note: NoteName
  role: 'root' | 'target'
}
