import { Info, Pause, Play } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import './CorePreview.css'
import { InlineMath, MathText } from './MathText'

interface CoreGeometryProps {
  time: number
  idPrefix: string
}

const END_TIME = 0.999
const DISPLAY_H = 1 / 200

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

function CoreGeometry({ time, idPrefix }: CoreGeometryProps) {
  const tau = Math.max(0.001, 1 - time)
  const radius = 148 * (0.19 + 0.81 * Math.pow(tau, 0.62))
  const height = 170 * (0.42 + 0.58 * Math.pow(tau, 0.34))
  const dashDuration = Math.max(0.24, 2.55 - time * 2.3)
  const relativeSpeed = Math.pow(tau, -0.5 - DISPLAY_H)
  const maximumSpeed = Math.pow(1 - END_TIME, -0.5 - DISPLAY_H)
  const blowupIntensity = Math.log(relativeSpeed) / Math.log(maximumSpeed)
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
      className="core-geometry"
      viewBox="0 0 700 520"
      role="img"
      aria-label="The inner core contracts while its flow accelerates toward the singular time"
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
        <marker id={`${idPrefix}-axis-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#7daeff" />
        </marker>
      </defs>

      <g className="core-grid" aria-hidden="true">
        <line x1="350" y1="472" x2="350" y2="48" markerEnd={`url(#${idPrefix}-axis-arrow)`} />
        <line x1="92" y1="260" x2="608" y2="260" markerEnd={`url(#${idPrefix}-axis-arrow)`} />
        <text x="362" y="61">z</text>
        <text x="592" y="247">r</text>
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

      <g
        className="core-blowup-signal"
        aria-hidden="true"
        style={{
          '--blowup-opacity': (0.04 + blowupIntensity * 0.68).toFixed(3),
          '--blowup-period': `${Math.max(0.38, 1.8 - blowupIntensity * 1.35).toFixed(2)}s`,
        } as CSSProperties}
      >
        <circle cx="350" cy="260" r="24" />
        <circle cx="350" cy="260" r="24" />
      </g>

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
      </g>
    </svg>
  )
}

export function CorePreview() {
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const isPlaying = playing && time < END_TIME
  const tau = Math.max(0.001, 1 - time)
  const relativeSpeed = Math.pow(tau, -0.5 - DISPLAY_H)
  const relativeEnergy = Math.pow(tau, 0.5 - 3 * DISPLAY_H)
  const maximumSpeed = Math.pow(1 - END_TIME, -0.5 - DISPLAY_H)
  const blowupIntensity = Math.log(relativeSpeed) / Math.log(maximumSpeed)
  const speedLabel = relativeSpeed < 10 ? relativeSpeed.toFixed(2) : relativeSpeed.toFixed(1)

  useEffect(() => {
    if (!isPlaying) return
    const timer = window.setInterval(() => {
      setTime((current) => Math.min(END_TIME, current + 0.006))
    }, 45)
    return () => window.clearInterval(timer)
  }, [isPlaying])

  return (
    <section className="core-preview" aria-labelledby="hero-core-title">
      <header className="core-preview-heading">
        <h2 id="hero-core-title"><span>Watch the singularity</span> <span>take shape.</span></h2>
        <div className="core-preview-info">
          <button type="button" aria-label="How to read the singularity animation" aria-describedby="core-preview-explanation">
            <Info size={16} />
          </button>
          <p id="core-preview-explanation" role="tooltip">
            <MathText>{'The core contracts as its angular and axial speeds diverge. The readouts use $h = 1/200$, within the paper’s range $0 < h < 1/100$.'}</MathText>
          </p>
        </div>
      </header>

      <div
        className="core-preview-visual"
        style={{ boxShadow: `inset 0 0 ${12 + blowupIntensity * 58}px rgba(255, 201, 121, ${0.02 + blowupIntensity * 0.17})` }}
      >
        <CoreGeometry time={time} idPrefix="hero-core" />
        <div className="core-preview-time" aria-live="polite">
          <strong><InlineMath>{`t = ${time.toFixed(3)}`}</InlineMath></strong>
          <span className="tau-value"><InlineMath>{String.raw`\tau = ${tau.toFixed(3)}`}</InlineMath></span>
        </div>
        <div className="core-preview-readouts" aria-label="Blowup scaling readouts">
          <div>
            <span>relative speed</span>
            <strong><InlineMath>{String.raw`\times ${speedLabel}`}</InlineMath></strong>
            <span className="scaling-law"><InlineMath>{String.raw`\tau^{-1/2-h}`}</InlineMath></span>
          </div>
          <div>
            <span>core energy</span>
            <strong><InlineMath>{String.raw`${Math.round(relativeEnergy * 100)}\%`}</InlineMath></strong>
            <span className="scaling-law"><InlineMath>{String.raw`\tau^{1/2-3h}`}</InlineMath></span>
          </div>
        </div>
      </div>

      <div className="core-preview-controls">
        <button
          type="button"
          onClick={() => {
            if (time >= END_TIME) setTime(0)
            setPlaying((current) => !current || time >= END_TIME)
          }}
          aria-label={isPlaying ? 'Pause singularity animation' : 'Play singularity animation'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
        </button>
        <label htmlFor="hero-core-time">
          <span className="sr-only">Time before singularity</span>
          <input
            id="hero-core-time"
            type="range"
            min="0"
            max={END_TIME}
            step="0.001"
            value={time}
            onChange={(event) => {
              setPlaying(false)
              setTime(Number(event.target.value))
            }}
            style={{ background: `linear-gradient(90deg, var(--mint) ${(time / END_TIME) * 100}%, rgba(183, 231, 221, 0.15) 0)` }}
          />
        </label>
      </div>
    </section>
  )
}
