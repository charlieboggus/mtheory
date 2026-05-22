import { cn } from '@/lib/utils'
import type { ScaleResult } from '@/theory/types'
import { classifyInterval, noteIndex } from '@/theory/scales'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

interface ScaleInfoProps {
  scale: ScaleResult
}

// Compare the note's pitch class to the major-scale pitch class at that degree.
// This correctly handles e.g. F# from D = '3' (natural major 3rd, not '#3').
const LETTERS      = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const DEGREE_NAMES = ['R', '2', '3', '4', '5', '6', '7']
const MAJOR_STEPS  = [0, 2, 4, 5, 7, 9, 11]

function degreeLabel(root: string, note: string): string {
  const degree = (LETTERS.indexOf(note[0]) - LETTERS.indexOf(root[0]) + 7) % 7
  if (degree === 0) return 'R'
  const rootPc  = noteIndex(root as import('@/theory/types').NoteName) % 12
  const notePc  = noteIndex(note as import('@/theory/types').NoteName) % 12
  const majorPc = (rootPc + MAJOR_STEPS[degree]) % 12
  const diff = (notePc - majorPc + 12) % 12
  const num  = DEGREE_NAMES[degree]
  if (diff === 1)  return `#${num}`
  if (diff === 2)  return `##${num}`
  if (diff === 11) return `b${num}`
  if (diff === 10) return `bb${num}`
  return num
}

const NOTE_STYLES: Record<string, string> = {
  root:    'bg-amber-500/20 border-amber-500/60 text-amber-300',
  third:   'bg-teal-500/20 border-teal-500/60 text-teal-300',
  fifth:   'bg-blue-500/20 border-blue-500/60 text-blue-300',
  seventh: 'bg-violet-500/20 border-violet-500/60 text-violet-300',
  other:   'bg-zinc-800 border-zinc-700 text-zinc-300',
}

export function ScaleInfo({ scale }: ScaleInfoProps) {
  return (
    <div className="space-y-3 pb-2">
      <div className="flex items-baseline gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{scale.displayName}</h2>
        <span className="text-xs text-muted-foreground font-mono">
          {scale.notes.length} notes
        </span>
        <Popover>
          <PopoverTrigger className="ml-1 flex items-center justify-center w-4 h-4 rounded-full border border-muted-foreground/40 text-muted-foreground/60 text-[10px] font-mono hover:border-muted-foreground hover:text-muted-foreground transition-colors">
            ?
          </PopoverTrigger>
          <PopoverContent className="p-3 w-44">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Color legend</p>
            <div className="space-y-1.5">
              {[
                { style: NOTE_STYLES.root,    label: 'Root' },
                { style: NOTE_STYLES.third,   label: 'Third' },
                { style: NOTE_STYLES.fifth,   label: 'Fifth' },
                { style: NOTE_STYLES.seventh, label: 'Seventh' },
                { style: NOTE_STYLES.other,   label: 'Other degree' },
              ].map(({ style, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={cn('w-4 h-4 rounded border flex-shrink-0', style)} />
                  <span className="text-xs text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-3 flex-wrap">
        {scale.notes.map((note, i) => {
          const degree = classifyInterval(scale.intervals[i])
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={cn(
                'flex items-center justify-center rounded-md border font-mono font-semibold',
                'text-sm w-10 h-10',
                NOTE_STYLES[degree] ?? NOTE_STYLES.other
              )}>
                {note}
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {degreeLabel(scale.root, note)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
