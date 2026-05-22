import { useState, useCallback } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ScaleInput } from '@/components/ScaleInput'
import { FretboardSVG } from '@/components/FretboardSVG'
import { ChordTable } from '@/components/ChordTable'
import { ScaleInfo } from '@/components/ScaleInfo'
import { ChordFingerings } from '@/components/ChordFingerings'
import { IntervalExplorer } from '@/components/IntervalExplorer'
import { ArpeggioExplorer } from '@/components/ArpeggioExplorer'
import { resolveScale, ALL_ROOTS, SCALE_NAMES } from '@/theory/scales'
import type { NoteName, ScaleResult } from '@/theory/types'
import { cn } from '@/lib/utils'

type View = 'scale' | 'fingerings' | 'arpeggios' | 'intervals'

function randomScale(): [NoteName, string] {
  const root = ALL_ROOTS[Math.floor(Math.random() * ALL_ROOTS.length)]
  const name = SCALE_NAMES[Math.floor(Math.random() * SCALE_NAMES.length)]
  return [root, name]
}

const [DEFAULT_ROOT, DEFAULT_SCALE] = randomScale()

export default function App() {
  // ── View ────────────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>('scale')

  // ── Scale explorer ───────────────────────────────────────────────────────────
  const [root, setRoot]           = useState<NoteName>(DEFAULT_ROOT)
  const [scaleName, setScaleName] = useState(DEFAULT_SCALE)
  const [scale, setScale]         = useState<ScaleResult | null>(() =>
    resolveScale(DEFAULT_ROOT, DEFAULT_SCALE)
  )

  const updateScale = useCallback((r: NoteName, s: string) => {
    const result = resolveScale(r, s)
    if (result) setScale(result)
  }, [])

  const handleRootChange = useCallback((r: NoteName) => {
    setRoot(r)
    updateScale(r, scaleName)
  }, [scaleName, updateScale])

  const handleScaleChange = useCallback((s: string) => {
    setScaleName(s)
    updateScale(root, s)
  }, [root, updateScale])

  const handleRandom = useCallback(() => {
    const [r, s] = randomScale()
    setRoot(r); setScaleName(s); updateScale(r, s)
  }, [updateScale])

  // ── Chord fingerings ─────────────────────────────────────────────────────────
  const [fingeringRoot,    setFingeringRoot]    = useState<NoteName>('C')
  const [fingeringQuality, setFingeringQuality] = useState<string>('')

  // ── Arpeggio explorer ────────────────────────────────────────────────────────
  const [arpeggioRoot,    setArpeggioRoot]    = useState<NoteName>('C')
  const [arpeggioQuality, setArpeggioQuality] = useState<string>('')

  // ── Interval explorer ────────────────────────────────────────────────────────
  const [intervalRoot,      setIntervalRoot]      = useState<NoteName>('C')
  const [intervalSemitones, setIntervalSemitones] = useState<number>(7)

  const handleChordClick = useCallback((r: NoteName, quality: string) => {
    setFingeringRoot(r)
    setFingeringQuality(quality)
    setView('fingerings')
  }, [])

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">

        {/* macOS title-bar drag region */}
        <div
          className="h-9 shrink-0 flex items-center px-4"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
          <span className="text-xs font-mono font-medium text-muted-foreground tracking-widest uppercase select-none ml-16">
            mtheory
          </span>
        </div>

        <Separator />

        {/* Top-level navigation */}
        <div
          className="flex items-center gap-1 px-4 py-2 shrink-0"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {([
            { id: 'scale',      label: 'Scale Explorer'    },
            { id: 'fingerings', label: 'Chord Diagrams'    },
            { id: 'arpeggios',  label: 'Arpeggios'         },
            { id: 'intervals',  label: 'Interval Explorer' },
          ] as { id: View; label: string }[]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors',
                view === id
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Separator />

        {/* ── Scale Explorer ───────────────────────────────────────────────── */}
        {view === 'scale' && (
          <>
            <div
              className="flex items-center gap-4 px-5 py-3 shrink-0"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              <ScaleInput
                root={root}
                scaleName={scaleName}
                onRootChange={handleRootChange}
                onScaleChange={handleScaleChange}
                onRandom={handleRandom}
              />
            </div>

            <Separator />

            {scale ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-5 pt-4 pb-2 shrink-0">
                  <ScaleInfo scale={scale} />
                </div>

                <Tabs defaultValue="fretboard" className="flex-1 flex flex-col overflow-hidden px-5 pb-4">
                  <TabsList className="w-fit shrink-0 mb-4">
                    <TabsTrigger value="fretboard">Fretboard</TabsTrigger>
                    <TabsTrigger value="chords">Chords</TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="fretboard"
                    className="flex-1 overflow-auto scrollbar-none data-[state=inactive]:hidden"
                  >
                    <FretboardSVG scale={scale} frets={12} />
                  </TabsContent>

                  <TabsContent
                    value="chords"
                    className="flex-1 overflow-auto scrollbar-none data-[state=inactive]:hidden"
                  >
                    <ChordTable scale={scale} onChordClick={handleChordClick} />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Enter a valid root and scale name
              </div>
            )}
          </>
        )}

        {/* ── Chord Diagrams ───────────────────────────────────────────────── */}
        {view === 'fingerings' && (
          <div className="flex-1 overflow-hidden">
            <ChordFingerings
              root={fingeringRoot}
              quality={fingeringQuality}
              onRootChange={setFingeringRoot}
              onQualityChange={setFingeringQuality}
            />
          </div>
        )}

        {/* ── Arpeggio Explorer ───────────────────────────────────────────── */}
        {view === 'arpeggios' && (
          <div className="flex-1 overflow-hidden">
            <ArpeggioExplorer
              root={arpeggioRoot}
              quality={arpeggioQuality}
              onRootChange={setArpeggioRoot}
              onQualityChange={setArpeggioQuality}
            />
          </div>
        )}

        {/* ── Interval Explorer ────────────────────────────────────────────── */}
        {view === 'intervals' && (
          <div className="flex-1 overflow-hidden">
            <IntervalExplorer
              root={intervalRoot}
              semitones={intervalSemitones}
              onRootChange={setIntervalRoot}
              onSemitonesChange={setIntervalSemitones}
            />
          </div>
        )}

      </div>
    </TooltipProvider>
  )
}
