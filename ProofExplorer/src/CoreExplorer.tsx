import { ArrowDown, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import './CoreExplorer.css'

type CoreFocus = 'flow' | 'scales' | 'energy'

interface CoreGeometryProps {
  time: number
  focus: CoreFocus
  idPrefix: string
  compact?: boolean
}

const focusNotes: Record<CoreFocus, { label: string; title: string; body: string }> = {
  flow: {
    label: 'Velocity field',
    title: 'In around the axis. Out along it.',
    body: 'Fluid spirals toward the axis. Incompressibility sends it upward above the dividing layer and downward below it.',
  },
  scales: {
    label: 'Similarity scales',
    title: 'The radius collapses faster than the height.',
    body: 'With τ = 1 − t, the radial scale is τ¹ᐟ² while the axial scale is τ¹ᐟ²⁻ʰ. The drawing exaggerates the growing slenderness.',
  },
  energy: {
    label: 'Concentration',
    title: 'Faster flow, less energy in the core.',
    body: 'The characteristic angular and axial speeds diverge as τ⁻¹ᐟ²⁻ʰ, yet the shrinking core carries energy of order τ¹ᐟ²⁻³ʰ, which tends to zero.',
  },
}

function pointPath(points: Array<[number, number]>) {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
}

function spiralPath(radius: number, phase: number, yOffset: number) {
  const points: Array<[number, number]> = []
  for (let index = 0; index <= 120; index += 1) {
    const amount = index / 120
    const angle = phase + amount * Math.PI * 6.5
    const currentRadius = radius * (1 - amount * 0.84)
    points.push([
      350 + currentRadius * Math.cos(angle),
      260 + yOffset + currentRadius * 0.22 * Math.sin(angle),
    ])
  }
  return pointPath(points)
}

function axialPath(height: number, radius: number, direction: -1 | 1, phase: number) {
  const points: Array<[number, number]> = []
  for (let index = 0; index <= 80; index += 1) {
    const amount = index / 80
    const spread = 0.2 + amount * 0.8
    points.push([
      350 + radius * 0.13 * spread * Math.sin(phase + amount * Math.PI * 5),
      260 + direction * height * amount,
    ])
  }
  return pointPath(points)
}

function CoreGeometry({ time, focus, idPrefix, compact = false }: CoreGeometryProps) {
  const tau = Math.max(0.015, 1 - time)
  const radius = 148 * (0.19 + 0.81 * Math.pow(tau, 0.62))
  const height = 170 * (0.42 + 0.58 * Math.pow(tau, 0.34))
  const dashDuration = Math.max(0.38, 2.45 - time * 1.9)
  const spiralPaths = useMemo(
    () => [
      spiralPath(radius, 0, 0),
      spiralPath(radius * 0.88, Math.PI * 0.72, -height * 0.06),
      spiralPath(radius * 0.78, Math.PI * 1.35, height * 0.07),
    ],
    [height, radius],
  )
  const axialPaths = useMemo(
    () => [
      axialPath(height, radius, -1, 0),
      axialPath(height, radius, -1, Math.PI),
      axialPath(height, radius, 1, Math.PI * 0.4),
      axialPath(height, radius, 1, Math.PI * 1.4),
    ],
    [height, radius],
  )
  const envelope = [
    `M 350 ${260 - height}`,
    `C ${350 + radius * 0.17} ${260 - height * 0.68}, ${350 + radius * 0.35} ${260 - height * 0.28}, ${350 + radius} 260`,
    `C ${350 + radius * 0.35} ${260 + height * 0.28}, ${350 + radius * 0.17} ${260 + height * 0.68}, 350 ${260 + height}`,
    `C ${350 - radius * 0.17} ${260 + height * 0.68}, ${350 - radius * 0.35} ${260 + height * 0.28}, ${350 - radius} 260`,
    `C ${350 - radius * 0.35} ${260 - height * 0.28}, ${350 - radius * 0.17} ${260 - height * 0.68}, 350 ${260 - height}`,
    'Z',
  ].join(' ')

  return (
    <svg
      className={`core-geometry focus-${focus}${compact ? ' compact' : ''}`}
      viewBox="0 0 700 520"
      role={compact ? undefined : 'img'}
      aria-hidden={compact ? true : undefined}
      aria-label={compact ? undefined : 'Schematic of the shrinking inner core with spiral inflow and axial outflow'}
    >
      <defs>
        <radialGradient id={`${idPrefix}-core-fill`}>
          <stop offset="0" stopColor="#80ead2" stopOpacity={0.18 + time * 0.16} />
          <stop offset="0.5" stopColor="#3c8e83" stopOpacity="0.08" />
          <stop offset="1" stopColor="#071210" stopOpacity="0" />
        </radialGradient>
        <filter id={`${idPrefix}-glow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={4 + time * 5} />
        </filter>
        <marker id={`${idPrefix}-teal-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#80ead2" />
        </marker>
        <marker id={`${idPrefix}-orange-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffc979" />
        </marker>
        <marker id={`${idPrefix}-scale-arrow`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#7daeff" />
        </marker>
      </defs>

      <g className="core-grid" aria-hidden="true">
        <line x1="350" y1="48" x2="350" y2="472" />
        <line x1="92" y1="260" x2="608" y2="260" />
        {!compact && <><text x="360" y="62">z</text><text x="593" y="249">r</text></>}
      </g>

      <path className="core-envelope" d={envelope} fill={`url(#${idPrefix}-core-fill)`} />
      <ellipse
        className="core-glow"
        cx="350"
        cy="260"
        rx={Math.max(10, radius * 0.31)}
        ry={Math.max(6, radius * 0.09)}
        filter={`url(#${idPrefix}-glow)`}
      />

      <g className="core-rings">
        {[-0.2, 0, 0.2].map((offset) => {
          const ringRadius = radius * (1 - Math.abs(offset) * 1.2)
          return (
            <ellipse
              key={offset}
              cx="350"
              cy={260 + height * offset}
              rx={ringRadius}
              ry={Math.max(5, ringRadius * 0.2)}
            />
          )
        })}
      </g>

      <g className="core-spirals">
        {spiralPaths.map((path, index) => (
          <path
            key={path}
            d={path}
            className={`core-motion-line spiral-${index + 1}`}
            markerEnd={`url(#${idPrefix}-teal-arrow)`}
            style={{ animationDuration: `${dashDuration + index * 0.12}s` }}
          />
        ))}
      </g>

      <g className="core-axial-flow">
        {axialPaths.map((path, index) => (
          <path
            key={path}
            d={path}
            className={`core-motion-line axial-${index + 1}`}
            markerEnd={`url(#${idPrefix}-orange-arrow)`}
            style={{ animationDuration: `${dashDuration * 0.88 + index * 0.08}s` }}
          />
        ))}
      </g>

      <g className="core-divider">
        <line x1={350 - radius * 1.12} y1="260" x2={350 + radius * 1.12} y2="260" />
        {!compact && <text x={350 + radius * 0.48} y="248">dividing layer</text>}
      </g>

      <g className="core-scale-overlay">
        <line
          x1={350 - radius}
          y1="418"
          x2={350 + radius}
          y2="418"
          markerStart={`url(#${idPrefix}-scale-arrow)`}
          markerEnd={`url(#${idPrefix}-scale-arrow)`}
        />
        <text x="350" y="443" textAnchor="middle">radial scale ℓᵣ</text>
        <line
          x1={350 + radius + 50}
          y1={260 - height}
          x2={350 + radius + 50}
          y2={260 + height}
          markerStart={`url(#${idPrefix}-scale-arrow)`}
          markerEnd={`url(#${idPrefix}-scale-arrow)`}
        />
        <text x={350 + radius + 66} y="260" transform={`rotate(90 ${350 + radius + 66} 260)`} textAnchor="middle">axial scale ℓz</text>
      </g>

      <g className="core-energy-overlay">
        <circle cx="350" cy="260" r={18 + time * 15} />
        <circle cx="350" cy="260" r={38 + time * 22} />
      </g>
    </svg>
  )
}

export function CorePreview() {
  return (
    <a className="core-preview" href="#inner-core" aria-label="Explore the inner-core flow from Figure 1">
      <CoreGeometry time={0.76} focus="flow" compact idPrefix="hero-core" />
      <span>Figure 1</span>
      <strong>Enter the inner core</strong>
      <ArrowDown size={17} />
    </a>
  )
}

export default function CoreExplorer({ paperUrl }: { paperUrl: string }) {
  const [time, setTime] = useState(0.18)
  const [focus, setFocus] = useState<CoreFocus>('flow')
  const [playing, setPlaying] = useState(false)
  const isPlaying = playing && time < 0.985
  const tau = Math.max(0.015, 1 - time)
  const note = focusNotes[focus]

  useEffect(() => {
    if (!isPlaying) return
    const timer = window.setInterval(() => {
      setTime((current) => Math.min(0.985, current + 0.006))
    }, 45)
    return () => window.clearInterval(timer)
  }, [isPlaying])

  const chooseTime = (nextTime: number) => {
    setPlaying(false)
    setTime(nextTime)
  }

  const reset = () => {
    setPlaying(false)
    setTime(0.18)
  }

  return (
    <section className="core-section" id="inner-core">
      <header className="core-section-heading">
        <div>
          <span className="section-kicker">Figure 1 · physical picture</span>
          <h2>Watch the singularity take shape.</h2>
        </div>
        <p>As time approaches 1, the core contracts while its angular and axial speeds diverge.</p>
      </header>

      <div className="core-lab">
        <aside className="core-controls">
          <div className="core-focus-tabs" aria-label="Choose an aspect of the inner core">
            {([
              ['flow', 'Flow'],
              ['scales', 'Scales'],
              ['energy', 'Energy'],
            ] as const).map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={focus === value ? 'active' : ''}
                onClick={() => setFocus(value)}
                aria-pressed={focus === value}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="core-note" aria-live="polite">
            <span>{note.label}</span>
            <h3>{note.title}</h3>
            <p>{note.body}</p>
          </div>

          <div className="core-equations" aria-label="Scaling laws">
            <div><span>radius</span><strong>ℓ<sub>r</sub> ≍ τ<sup>1/2</sup></strong></div>
            <div><span>height</span><strong>ℓ<sub>z</sub> ≍ τ<sup>1/2−h</sup></strong></div>
            <div><span>speed</span><strong>|u<sub>θ</sub>|, |u<sub>z</sub>| ≍ τ<sup>−1/2−h</sup></strong></div>
            <div><span>core energy</span><strong>≍ τ<sup>1/2−3h</sup> → 0</strong></div>
            <p className="core-parameter">0 &lt; h &lt; 1/100</p>
          </div>
        </aside>

        <figure className="core-canvas">
          <div className="core-time-status">
            <span>time</span>
            <strong>t = {time.toFixed(3)}</strong>
            <code>τ = 1 − t = {tau.toFixed(3)}</code>
          </div>
          <CoreGeometry time={time} focus={focus} idPrefix="lab-core" />
          <figcaption>
            Interactive reconstruction of Figure 1. The difference between radial and axial scales is exaggerated, as it is in the paper.
            {' '}<a href={`${paperUrl}#page=4`} target="_blank" rel="noreferrer">Open the original <ArrowDown size={13} /></a>
          </figcaption>
        </figure>
      </div>

      <div className="core-timeline">
        <div className="core-playback">
          <button
            type="button"
            onClick={() => {
              if (time >= 0.985) setTime(0.18)
              setPlaying((current) => !current || time >= 0.985)
            }}
            aria-label={isPlaying ? 'Pause time animation' : 'Play time animation'}
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            {isPlaying ? 'Pause' : 'Approach t = 1'}
          </button>
          <button type="button" className="core-reset" onClick={reset} aria-label="Reset inner-core time">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
        <label htmlFor="core-time">
          <span className="sr-only">Time before singularity</span>
          <input
            id="core-time"
            type="range"
            min="0.05"
            max="0.985"
            step="0.005"
            value={time}
            onChange={(event) => chooseTime(Number(event.target.value))}
            style={{ background: `linear-gradient(90deg, var(--mint) ${((time - 0.05) / 0.935) * 100}%, rgba(183, 231, 221, 0.15) 0)` }}
          />
        </label>
        <div className="core-presets" aria-label="Time presets">
          <button type="button" className={time < 0.4 ? 'active' : ''} onClick={() => chooseTime(0.18)}>earlier</button>
          <button type="button" className={time >= 0.4 && time < 0.85 ? 'active' : ''} onClick={() => chooseTime(0.65)}>later</button>
          <button type="button" className={time >= 0.85 ? 'active' : ''} onClick={() => chooseTime(0.965)}>near t = 1</button>
        </div>
      </div>
    </section>
  )
}
