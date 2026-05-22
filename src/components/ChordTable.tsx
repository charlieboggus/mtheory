import { cn } from '@/lib/utils'
import type { ScaleResult, NoteName } from '@/theory/types'
import { buildDiatonicChords } from '@/theory/chords'

interface ChordTableProps {
  scale: ScaleResult
  onChordClick?: (root: NoteName, quality: string) => void
}

const NOTE_STYLES = [
  'bg-amber-500/20 border-amber-500/60 text-amber-300',    // root
  'bg-teal-500/20 border-teal-500/60 text-teal-300',       // third
  'bg-blue-500/20 border-blue-500/60 text-blue-300',       // fifth
  'bg-violet-500/20 border-violet-500/60 text-violet-300', // seventh
  'bg-rose-500/20 border-rose-500/60 text-rose-300',       // ninth
  'bg-sky-500/20 border-sky-500/60 text-sky-300',          // eleventh
  'bg-emerald-500/20 border-emerald-500/60 text-emerald-300', // thirteenth
]

export function ChordTable({ scale, onChordClick }: ChordTableProps) {
  if (scale.notes.length !== 7) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        Chord table available for 7-note scales only
      </div>
    )
  }

  const chords = buildDiatonicChords(scale)

  return (
    <div className="w-full h-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 px-4 text-center font-medium text-muted-foreground font-mono text-xs w-1/3">
              Degree
            </th>
            <th className="py-3 px-4 text-center font-medium text-muted-foreground font-mono text-xs w-1/3">
              Chord
            </th>
            <th className="py-3 px-4 text-center font-medium text-muted-foreground font-mono text-xs w-1/3">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {chords.map((chord) => (
            <tr
              key={chord.degree}
              onClick={() => chord.name !== '?' && onChordClick?.(chord.notes[0], chord.quality)}
              className={cn(
                'border-b border-border/40 last:border-0 transition-colors',
                onChordClick && chord.name !== '?'
                  ? 'cursor-pointer hover:bg-muted/30'
                  : 'hover:bg-muted/20'
              )}
            >
              {/* Degree */}
              <td className="py-4 px-4 text-center">
                <span className={cn(
                  'font-mono text-base tabular-nums',
                  chord.roman === chord.roman.toUpperCase() && !chord.roman.includes('ø') && !chord.roman.includes('°')
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                )}>
                  {chord.roman}
                </span>
              </td>

              {/* Chord name */}
              <td className="py-4 px-4 text-center">
                <span className={cn(
                  'font-mono text-base font-semibold',
                  chord.name === '?' ? 'text-muted-foreground' : 'text-foreground'
                )}>
                  {chord.name}
                </span>
              </td>

              {/* Notes */}
              <td className="py-4 px-4 text-center">
                <div className="flex gap-2.5 flex-wrap justify-center">
                  {chord.notes.map((note, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center justify-center rounded border font-mono text-sm font-medium',
                        'w-10 h-9',
                        NOTE_STYLES[i] ?? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                      )}
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
