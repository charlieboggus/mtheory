import type { IntervalFretNote } from '@/theory/types'

interface IntervalFretboardSVGProps {
  fretboardMap: Map<string, IntervalFretNote | null>
  frets?: number
}

const ROLE_COLORS = {
  root:   { fill: '#f59e0b', stroke: '#d97706', text: '#1a0a00' },
  target: { fill: '#f43f5e', stroke: '#e11d48', text: '#1a0007' },
}

const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']
const FRET_MARKERS = new Set([3, 5, 7, 9, 12])
const DOUBLE_MARKERS = new Set([12])

export function IntervalFretboardSVG({ fretboardMap, frets = 12 }: IntervalFretboardSVGProps) {
  const PADDING_LEFT   = 40
  const PADDING_RIGHT  = 20
  const PADDING_TOP    = 44
  const PADDING_BOTTOM = 32
  const STRING_SPACING = 44
  const FRET_SPACING   = 68
  const NUT_WIDTH      = 5
  const STRING_COUNT   = 6
  const DOT_RADIUS     = 11

  const boardWidth  = PADDING_LEFT + NUT_WIDTH + frets * FRET_SPACING + PADDING_RIGHT
  const boardHeight = PADDING_TOP + (STRING_COUNT - 1) * STRING_SPACING + PADDING_BOTTOM

  const fretX = (fret: number) => {
    if (fret === 0) return PADDING_LEFT + NUT_WIDTH / 2
    return PADDING_LEFT + NUT_WIDTH + (fret - 0.5) * FRET_SPACING
  }

  const wireX = (fret: number) =>
    fret === 0 ? PADDING_LEFT : PADDING_LEFT + NUT_WIDTH + fret * FRET_SPACING

  const stringY = (si: number) => PADDING_TOP + si * STRING_SPACING

  return (
    <svg
      viewBox={`0 0 ${boardWidth} ${boardHeight}`}
      width="100%"
      className="w-full max-w-full"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      {/* Fretboard background */}
      <rect
        x={PADDING_LEFT}
        y={PADDING_TOP}
        width={boardWidth - PADDING_LEFT - PADDING_RIGHT}
        height={(STRING_COUNT - 1) * STRING_SPACING}
        fill="#1c1917"
        rx={2}
      />

      {/* Fret wires */}
      {Array.from({ length: frets + 1 }, (_, i) => {
        const x = wireX(i)
        const isNut = i === 0
        return (
          <rect
            key={`wire-${i}`}
            x={x - (isNut ? NUT_WIDTH / 2 : 0.75)}
            y={PADDING_TOP - 1}
            width={isNut ? NUT_WIDTH : 1.5}
            height={(STRING_COUNT - 1) * STRING_SPACING + 2}
            fill={isNut ? '#a8a29e' : '#3f3f46'}
          />
        )
      })}

      {/* Fret number labels */}
      {Array.from({ length: frets + 1 }, (_, fret) => fret === 0 ? null : (
        <text
          key={`fnum-${fret}`}
          x={fretX(fret)}
          y={PADDING_TOP - 16}
          textAnchor="middle"
          fontSize={11}
          fill="#71717a"
        >
          {fret}
        </text>
      ))}

      {/* Strings */}
      {STRING_NAMES.map((_, si) => (
        <line
          key={`string-${si}`}
          x1={PADDING_LEFT}
          y1={stringY(si)}
          x2={boardWidth - PADDING_RIGHT}
          y2={stringY(si)}
          stroke="#57534e"
          strokeWidth={si < 3 ? 1 : 1.5 + (si - 3) * 0.4}
        />
      ))}

      {/* String name labels */}
      {STRING_NAMES.map((name, si) => (
        <text
          key={`sname-${si}`}
          x={PADDING_LEFT - 14}
          y={stringY(si) + 4}
          textAnchor="middle"
          fontSize={11}
          fontWeight="500"
          fill="#71717a"
        >
          {name}
        </text>
      ))}

      {/* Fret position markers */}
      {Array.from({ length: frets + 1 }, (_, fret) => {
        if (!FRET_MARKERS.has(fret)) return null
        const x = fretX(fret)
        const y = PADDING_TOP + (STRING_COUNT - 1) * STRING_SPACING + 16
        return DOUBLE_MARKERS.has(fret) ? (
          <g key={`marker-${fret}`}>
            <circle cx={x - 7} cy={y} r={3.5} fill="#3f3f46" />
            <circle cx={x + 7} cy={y} r={3.5} fill="#3f3f46" />
          </g>
        ) : (
          <circle key={`marker-${fret}`} cx={x} cy={y} r={3.5} fill="#3f3f46" />
        )
      })}

      {/* Interval dots */}
      {STRING_NAMES.map((stringName, si) =>
        Array.from({ length: frets + 1 }, (_, fret) => {
          const key   = `${stringName}-${fret}`
          const entry = fretboardMap.get(key)
          if (!entry) return null

          const cx     = fretX(fret)
          const cy     = stringY(si)
          const colors = ROLE_COLORS[entry.role]

          return (
            <g key={key}>
              <circle
                cx={cx}
                cy={cy}
                r={DOT_RADIUS}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={entry.role === 'root' ? 2.5 : 1.5}
                opacity={entry.role === 'root' ? 1 : 0.9}
              />
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fontSize={entry.note.length > 2 ? 9 : 11}
                fontWeight={entry.role === 'root' ? '700' : '500'}
                fill={colors.text}
              >
                {entry.note}
              </text>
            </g>
          )
        })
      )}
    </svg>
  )
}
