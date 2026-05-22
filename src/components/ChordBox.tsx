import { noteIndex, FLAT_ROOTS } from '@/theory/scales'
import { OPEN_PC } from '@/theory/voicings'
import type { Voicing } from '@/theory/voicings'
import type { NoteName } from '@/theory/types'

interface ChordBoxProps {
  voicing:  Voicing
  root:     NoteName
}

// ── Diagram constants (px) ─────────────────────────────────────────────────────
const S       = 24   // string spacing
const F       = 26   // fret-cell height
const STRINGS = 6
const FRETS   = 4
const PAD_L   = 34   // extra left room for fret-position label
const PAD_R   = 14
const PAD_TOP = 38   // room for note labels above nut
const PAD_BOT = 10
const DOT_R   = 10

const W = PAD_L + (STRINGS - 1) * S + PAD_R  // 162
const H = PAD_TOP + FRETS * F + PAD_BOT       // 152

// ── Note labelling ─────────────────────────────────────────────────────────────
const SHARP_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const FLAT_NAMES  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']
// Extended values (>11) let us distinguish b9(13) from b2(1), #9(15) from b3(3), etc.
// flat  — b2/b9(1/13), b3(3), b5(6), b7(10), b13(20)
// sharp — aug5(8), #9(15), #11(18)
// else  — follow root preference
function pcLabel(pc: number, interval: number, useFlats: boolean): string {
  const useFl =
    interval === 1 || interval === 3 || interval === 6 || interval === 10 || interval === 13 || interval === 20
      ? true
      : interval === 8 || interval === 15 || interval === 18
        ? false
        : useFlats
  return (useFl ? FLAT_NAMES : SHARP_NAMES)[pc]
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ChordBox({ voicing, root }: ChordBoxProps) {
  const { frets } = voicing

  const rootPc   = noteIndex(root) % 12
  const useFlats = FLAT_ROOTS.has(root) || root.includes('b')

  const frettedList = frets.filter(f => f > 0)
  const baseFret    = frettedList.length > 0 ? Math.min(...frettedList) : 0
  const hasOpen     = frets.some(f => f === 0)
  const showNut     = baseFret <= 1 || hasOpen
  const startFret   = showNut ? 1 : baseFret

  const sx   = (si: number) => PAD_L + si * S
  const dotY = (f:  number) => PAD_TOP + (f - startFret + 0.5) * F

  // Longest consecutive run of strings at baseFret → barre
  let barreRun: number[] = []
  let cur: number[] = []
  for (let si = 0; si < STRINGS; si++) {
    if (frets[si] === baseFret && baseFret > 0) {
      cur.push(si)
    } else {
      if (cur.length > barreRun.length) barreRun = cur
      cur = []
    }
  }
  if (cur.length > barreRun.length) barreRun = cur
  const hasBarre = barreRun.length >= 2

  const labelFontSize     = (label: string) => label.length === 1 ? 9   : 7.5  // inside dots
  const openLabelFontSize = (label: string) => label.length === 1 ? 12  : 10   // above nut

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ fontFamily: "'DM Mono', monospace", display: 'block' }}
    >
      {/* Nut or fret-position number */}
      {showNut ? (
        <rect
          x={PAD_L - 1}
          y={PAD_TOP}
          width={(STRINGS - 1) * S + 2}
          height={4}
          fill="#a8a29e"
        />
      ) : (
        <text
          x={PAD_L - DOT_R - 6}
          y={PAD_TOP + 0.5 * F}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={11}
          fontWeight="600"
          fill="#a1a1aa"
        >
          {startFret}
        </text>
      )}

      {/* Fret lines */}
      {Array.from({ length: FRETS + 1 }, (_, i) => (
        <line
          key={`f${i}`}
          x1={PAD_L} y1={PAD_TOP + i * F}
          x2={PAD_L + (STRINGS - 1) * S} y2={PAD_TOP + i * F}
          stroke="#3f3f46" strokeWidth={1}
        />
      ))}

      {/* String lines — thicker on the bass side */}
      {Array.from({ length: STRINGS }, (_, si) => (
        <line
          key={`s${si}`}
          x1={sx(si)} y1={PAD_TOP}
          x2={sx(si)} y2={PAD_TOP + FRETS * F}
          stroke="#57534e"
          strokeWidth={si === 0 ? 1.8 : si === 1 ? 1.4 : 1}
        />
      ))}

      {/* Open-string note labels / mute markers above the nut */}
      {frets.map((f, si) => {
        if (f > 0) return null
        if (f === -1) {
          return (
            <text
              key={`mx${si}`}
              x={sx(si)} y={PAD_TOP - 13}
              textAnchor="middle" dominantBaseline="central"
              fontSize={13} fill="#52525b"
            >
              ✕
            </text>
          )
        }
        // Open string — show note name coloured by root
        const pc       = OPEN_PC[si]
        const isRoot   = pc === rootPc
        const interval = (pc - rootPc + 12) % 12
        const label    = pcLabel(pc, interval, useFlats)
        return (
          <text
            key={`on${si}`}
            x={sx(si)} y={PAD_TOP - 13}
            textAnchor="middle" dominantBaseline="central"
            fontSize={openLabelFontSize(label)}
            fontWeight="700"
            fill={isRoot ? '#f59e0b' : '#71717a'}
          >
            {label}
          </text>
        )
      })}

      {/* Barre bar */}
      {hasBarre && (
        <>
          <rect
            x={sx(barreRun[0]) - DOT_R}
            y={dotY(baseFret) - DOT_R}
            width={sx(barreRun[barreRun.length - 1]) - sx(barreRun[0]) + DOT_R * 2}
            height={DOT_R * 2}
            rx={DOT_R}
            fill="#3b82f6"
          />
          {/* Amber highlight for root positions within barre */}
          {barreRun.map(si => {
            const pc = (OPEN_PC[si] + baseFret) % 12
            if (pc !== rootPc) return null
            return (
              <circle
                key={`br${si}`}
                cx={sx(si)} cy={dotY(baseFret)}
                r={DOT_R} fill="#f59e0b"
              />
            )
          })}
          {/* Note labels on barre */}
          {barreRun.map(si => {
            const pc       = (OPEN_PC[si] + baseFret) % 12
            const interval = (pc - rootPc + 12) % 12
            const label    = pcLabel(pc, interval, useFlats)
            return (
              <text
                key={`bt${si}`}
                x={sx(si)} y={dotY(baseFret)}
                textAnchor="middle" dominantBaseline="central"
                fontSize={labelFontSize(label)}
                fontWeight="700"
                fill="white"
              >
                {label}
              </text>
            )
          })}
        </>
      )}

      {/* Individual finger dots */}
      {frets.map((f, si) => {
        if (f <= 0) return null
        const row = f - startFret
        if (row < 0 || row >= FRETS) return null
        if (hasBarre && f === baseFret && barreRun.includes(si)) return null
        const pc       = (OPEN_PC[si] + f) % 12
        const isRoot   = pc === rootPc
        const interval = (pc - rootPc + 12) % 12
        const label    = pcLabel(pc, interval, useFlats)
        return (
          <g key={`d${si}`}>
            <circle
              cx={sx(si)} cy={dotY(f)}
              r={DOT_R}
              fill={isRoot ? '#f59e0b' : '#3b82f6'}
            />
            <text
              x={sx(si)} y={dotY(f)}
              textAnchor="middle" dominantBaseline="central"
              fontSize={labelFontSize(label)}
              fontWeight="700"
              fill="white"
            >
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
