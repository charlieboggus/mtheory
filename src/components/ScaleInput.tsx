import { useState, useCallback, useEffect } from 'react'
import { ChevronDown, Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ALL_ROOTS, SCALE_NAMES, fuzzyMatch } from '@/theory/scales'
import type { NoteName } from '@/theory/types'

interface ScaleInputProps {
  root: NoteName
  scaleName: string
  onRootChange: (r: NoteName) => void
  onScaleChange: (s: string) => void
  onRandom: () => void
}

export function ScaleInput({ root, scaleName, onRootChange, onScaleChange, onRandom }: ScaleInputProps) {
  const [scaleInput, setScaleInput] = useState(scaleName)
  const [scaleError, setScaleError] = useState(false)

  const handleScaleCommit = useCallback((value: string) => {
    const matched = fuzzyMatch(value)
    if (matched) {
      setScaleError(false)
      onScaleChange(matched)
    } else {
      setScaleError(true)
    }
  }, [onScaleChange])

  const handleScaleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleScaleCommit(scaleInput)
  }

  const handleScaleBlur = () => handleScaleCommit(scaleInput)

  const handleRandomExternal = () => {
    onRandom()
    // Reset input to show updated scale after random
    setScaleError(false)
  }

  // Sync input when scaleName changes externally (e.g. random)
  useEffect(() => {
    setScaleInput(scaleName)
  }, [scaleName])

  return (
    <div className="flex items-center gap-2">
      {/* Root selector */}
      <div className="relative">
        <select
          value={root}
          onChange={e => onRootChange(e.target.value as NoteName)}
          className={cn(
            'h-8 appearance-none rounded-md border border-border bg-secondary',
            'pl-3 pr-7 font-mono text-sm font-medium text-foreground',
            'focus:outline-none focus:ring-1 focus:ring-ring',
            'cursor-pointer'
          )}
        >
          {ALL_ROOTS.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
      </div>

      {/* Scale name input */}
      <div className="relative flex-1 min-w-[220px]">
        <input
          type="text"
          value={scaleInput}
          onChange={e => { setScaleInput(e.target.value); setScaleError(false) }}
          onKeyDown={handleScaleKey}
          onBlur={handleScaleBlur}
          placeholder="Scale name…"
          className={cn(
            'h-8 w-full rounded-md border bg-secondary px-3',
            'font-mono text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-1 focus:ring-ring',
            scaleError
              ? 'border-red-500/60 focus:ring-red-500/60'
              : 'border-border'
          )}
          list="scale-suggestions"
          spellCheck={false}
        />
        <datalist id="scale-suggestions">
          {SCALE_NAMES.map(s => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      {/* Random button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRandomExternal}
        title="Random scale"
        className="text-muted-foreground hover:text-foreground"
      >
        <Shuffle className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
