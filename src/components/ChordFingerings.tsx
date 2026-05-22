import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChordBox } from '@/components/ChordBox'
import { generateVoicings, CHORD_QUALITIES, CHORD_QUALITY_GROUPS, INVERSION_LABELS } from '@/theory/voicings'
import { ALL_ROOTS, FLAT_ROOTS, noteIndex, classifyInterval } from '@/theory/scales'
import type { IntervalDegree } from '@/theory/types'
import type { NoteName } from '@/theory/types'

interface ChordFingeringsProps {
  root: NoteName
  quality: string
  onRootChange: (r: NoteName) => void
  onQualityChange: (q: string) => void
}

const SELECT_CLS = cn(
  'h-8 appearance-none rounded-md border border-border bg-secondary',
  'pl-3 pr-7 font-mono text-sm font-medium text-foreground',
  'focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer'
)

const SHARP_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const FLAT_NAMES  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']

// Spelling rules per interval:
//   flat  — b2/b9(1/13), b3/#9-context(3), b5(6), b7(10), b13(20)
//   sharp — aug5/#5(8), #9(15), #11(18)
//   else  — follow root preference
// Extended values (>11) let us distinguish b9(13) from b2(1), #9(15) from b3(3), etc.
function chordToneName(pc: number, interval: number, rootUsesFlats: boolean): string {
  const useFlat =
    interval === 1 || interval === 3 || interval === 6 || interval === 10 || interval === 13 || interval === 20
      ? true
      : interval === 8 || interval === 15 || interval === 18
        ? false
        : rootUsesFlats
  return (useFlat ? FLAT_NAMES : SHARP_NAMES)[pc]
}

function classifyExtended(semitones: number): IntervalDegree {
  return classifyInterval(semitones <= 11 ? semitones : semitones % 12)
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

export function ChordFingerings({ root, quality, onRootChange, onQualityChange }: ChordFingeringsProps) {
  const voicings = useMemo(() => generateVoicings(root, quality), [root, quality])

  const groups = useMemo(() => {
    const map = new Map<number, typeof voicings>()
    for (const v of voicings) {
      if (!map.has(v.inversion)) map.set(v.inversion, [])
      map.get(v.inversion)!.push(v)
    }
    return [...map.entries()].sort(([a], [b]) => a - b)
  }, [voicings])

  const chordNotes = useMemo(() => {
    const intervals = CHORD_QUALITIES[quality]
    if (!intervals) return []
    const rootPc   = noteIndex(root) % 12
    const useFlats = FLAT_ROOTS.has(root) || root.includes('b')
    return intervals.map(interval => ({
      name:   chordToneName((rootPc + interval) % 12, interval, useFlats),
      degree: classifyExtended(interval),
    }))
  }, [root, quality])

  const chordName = `${root}${quality}`

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Input bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-5 py-3 shrink-0">

        {/* Root */}
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

        {/* Quality */}
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

        {/* Chord name + voicing count */}
        <span className="font-mono text-lg font-semibold ml-1">{chordName || root}</span>
        <span className="text-xs text-muted-foreground font-mono">
          {voicings.length} voicing{voicings.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Chord notes ───────────────────────────────────────────────────── */}
      {chordNotes.length > 0 && (
        <div className="flex items-center gap-2 px-5 pb-3 shrink-0 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground/60 uppercase tracking-wider">
            notes
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

      {/* ── Voicings ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-8 scrollbar-none">
        {voicings.length === 0 && (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            No playable voicings found for {chordName}
          </div>
        )}

        {groups.map(([inv, list]) => (
          <section key={inv}>
            <h3 className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {INVERSION_LABELS[inv] ?? `${inv}th inversion`}
            </h3>
            <div className="flex flex-wrap gap-2">
              {list.map((voicing, i) => (
                <div
                  key={i}
                  className="rounded-md border border-border/50 bg-card p-1.5"
                >
                  <ChordBox voicing={voicing} root={root} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
