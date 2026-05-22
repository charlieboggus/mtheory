import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IntervalFretboardSVG } from '@/components/IntervalFretboardSVG'
import { INTERVALS, buildIntervalFretboardMap, targetNoteName } from '@/theory/intervals'
import { ALL_ROOTS } from '@/theory/scales'
import type { NoteName } from '@/theory/types'

interface IntervalExplorerProps {
  root: NoteName
  semitones: number
  onRootChange: (r: NoteName) => void
  onSemitonesChange: (s: number) => void
}

const SELECT_CLS = cn(
  'h-8 appearance-none rounded-md border border-border bg-secondary',
  'pl-3 pr-7 font-mono text-sm font-medium text-foreground',
  'focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer'
)

export function IntervalExplorer({ root, semitones, onRootChange, onSemitonesChange }: IntervalExplorerProps) {
  const fretboardMap = useMemo(
    () => buildIntervalFretboardMap(root, semitones),
    [root, semitones]
  )

  const intervalDef  = INTERVALS.find(i => i.semitones === semitones) ?? INTERVALS[7]
  const targetNote   = useMemo(() => targetNoteName(root, semitones), [root, semitones])
  const isUnison     = semitones === 0 || semitones === 12

  // Count occurrences per role across the map
  const counts = useMemo(() => {
    let roots = 0, targets = 0
    for (const v of fretboardMap.values()) {
      if (!v) continue
      if (v.role === 'root') roots++
      else targets++
    }
    return { roots, targets }
  }, [fretboardMap])

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

        {/* Interval */}
        <div className="relative">
          <select
            value={semitones}
            onChange={e => onSemitonesChange(Number(e.target.value))}
            className={SELECT_CLS}
          >
            {INTERVALS.map(({ semitones: s, name, short }) => (
              <option key={s} value={s}>{short} — {name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* ── Info strip ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 pb-3 shrink-0 flex-wrap">
        <span className="text-xs font-mono text-muted-foreground/60 uppercase tracking-wider">
          interval
        </span>

        {/* Root pill */}
        <span className={cn(
          'inline-flex items-center justify-center rounded border font-mono text-xs font-semibold px-2 h-7 min-w-[2rem]',
          'bg-amber-500/20 border-amber-500/60 text-amber-300'
        )}>
          {root}
        </span>

        {!isUnison && (
          <>
            <span className="text-xs font-mono text-muted-foreground">
              +{intervalDef.short}
            </span>

            {/* Target pill */}
            <span className={cn(
              'inline-flex items-center justify-center rounded border font-mono text-xs font-semibold px-2 h-7 min-w-[2rem]',
              'bg-rose-500/20 border-rose-500/60 text-rose-300'
            )}>
              {targetNote}
            </span>
          </>
        )}

        <span className="text-xs font-mono text-muted-foreground ml-1">
          {isUnison
            ? `${counts.roots} occurrence${counts.roots !== 1 ? 's' : ''}`
            : `${counts.roots} root · ${counts.targets} ${intervalDef.short}`}
        </span>
      </div>

      {/* ── Fretboard ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-5 pb-6 scrollbar-none">
        <IntervalFretboardSVG fretboardMap={fretboardMap} frets={12} />
      </div>

    </div>
  )
}
