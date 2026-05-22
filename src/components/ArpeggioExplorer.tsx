import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FretboardSVG } from '@/components/FretboardSVG'
import { buildArpeggioFretboardMap } from '@/theory/arpeggios'
import { CHORD_QUALITIES, CHORD_QUALITY_GROUPS } from '@/theory/voicings'
import { ALL_ROOTS, FLAT_ROOTS, noteIndex, classifyInterval } from '@/theory/scales'
import type { NoteName } from '@/theory/types'

interface ArpeggioExplorerProps {
  root:            NoteName
  quality:         string
  onRootChange:    (r: NoteName) => void
  onQualityChange: (q: string) => void
}

const SELECT_CLS = cn(
  'h-8 appearance-none rounded-md border border-border bg-secondary',
  'pl-3 pr-7 font-mono text-sm font-medium text-foreground',
  'focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer'
)

const SHARP_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const FLAT_NAMES  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']

function spellNote(pc: number, interval: number, useFlats: boolean): string {
  const useFlat =
    interval === 1 || interval === 3 || interval === 6 || interval === 10 || interval === 13 || interval === 20
      ? true
      : interval === 8 || interval === 15 || interval === 18
        ? false
        : useFlats
  return (useFlat ? FLAT_NAMES : SHARP_NAMES)[pc]
}

const NOTE_STYLES: Record<string, string> = {
  root:    'bg-amber-500/20 border-amber-500/60 text-amber-300',
  third:   'bg-teal-500/20 border-teal-500/60 text-teal-300',
  fifth:   'bg-blue-500/20 border-blue-500/60 text-blue-300',
  seventh: 'bg-violet-500/20 border-violet-500/60 text-violet-300',
  second:  'bg-rose-500/20 border-rose-500/60 text-rose-300',
  fourth:  'bg-sky-500/20 border-sky-500/60 text-sky-300',
  sixth:   'bg-emerald-500/20 border-emerald-500/60 text-emerald-300',
  other:   'bg-zinc-800 border-zinc-700 text-zinc-300',
}

export function ArpeggioExplorer({ root, quality, onRootChange, onQualityChange }: ArpeggioExplorerProps) {
  const fretboardMap = useMemo(() => buildArpeggioFretboardMap(root, quality, 12), [root, quality])

  const chordNotes = useMemo(() => {
    const intervals = CHORD_QUALITIES[quality]
    if (!intervals) return []
    const rootPc   = noteIndex(root) % 12
    const useFlats = FLAT_ROOTS.has(root) || root.includes('b')
    return intervals.map(interval => ({
      name:   spellNote((rootPc + interval) % 12, interval, useFlats),
      degree: classifyInterval(interval % 12),
    }))
  }, [root, quality])

  const chordName = `${root}${quality}`

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Input bar */}
      <div className="flex items-center gap-2 px-5 py-3 shrink-0">
        <div className="relative">
          <select
            value={root}
            onChange={e => onRootChange(e.target.value as NoteName)}
            className={SELECT_CLS}
          >
            {ALL_ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="relative">
          <select
            value={quality}
            onChange={e => onQualityChange(e.target.value)}
            className={SELECT_CLS}
          >
            {CHORD_QUALITY_GROUPS.map(({ label, qualities }) => (
              <optgroup key={label} label={label}>
                {qualities.map(q => (
                  <option key={q} value={q}>{q === '' ? 'maj' : q}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        </div>

        <span className="font-mono text-lg font-semibold ml-1">{chordName || root}</span>
      </div>

      {/* Chord tones */}
      {chordNotes.length > 0 && (
        <div className="flex items-center gap-2 px-5 pb-3 shrink-0 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground/60 uppercase tracking-wider">
            tones
          </span>
          {chordNotes.map(({ name, degree }, i) => (
            <span
              key={i}
              className={cn(
                'inline-flex items-center justify-center rounded border font-mono text-xs font-semibold px-2 h-7 min-w-[2rem]',
                NOTE_STYLES[degree] ?? NOTE_STYLES.other
              )}
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Fretboard */}
      <div className="flex-1 overflow-auto px-5 pb-6 scrollbar-none">
        <FretboardSVG map={fretboardMap} frets={12} />
      </div>

    </div>
  )
}
